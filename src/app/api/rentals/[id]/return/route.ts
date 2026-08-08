import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLateFee, calculateDepositRefund } from "@/lib/rental-logic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    const body = await request.json().catch(() => ({}));
    const damageCharge = Number(body.damageCharge) || 0;

    const order = await prisma.rentalOrder.findFirst({
      where: !isNaN(numId)
        ? { OR: [{ id: numId }, { orderNumber: id }] }
        : { orderNumber: id },
      include: {
        orderLines: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Rental order not found" }, { status: 404 });
    }

    const config = (await prisma.pickupReturnSetting.findFirst()) || {
      dailyRate: 15,
      gracePeriodDays: 1,
    };

    const lateFee = calculateLateFee(order.rentalEnd, {
      dailyRate: config.dailyRate,
      gracePeriodDays: config.gracePeriodDays,
    });
    const refundAmount = calculateDepositRefund(order.depositAmount, lateFee, damageCharge);

    let newDepositStatus = "refunded";
    if (lateFee + damageCharge > 0) {
      newDepositStatus = "partially-deducted";
    }

    const updatedOrder = await prisma.rentalOrder.update({
      where: { id: order.id },
      data: {
        status: "RETURNED",
        lateFeeCharged: lateFee,
        depositStatus: newDepositStatus,
      },
      include: {
        orderLines: {
          include: { product: true },
        },
      },
    });

    // Restore product stock and sync status (if 0 sold out before, now 1 Available!)
    for (const line of order.orderLines) {
      if (line.productId) {
        const prod = await prisma.product.findUnique({ where: { id: line.productId } });
        const newStock = (prod?.inStock || 0) + line.quantity;
        await prisma.product.update({
          where: { id: line.productId },
          data: {
            inStock: newStock,
            status: newStock > 0 ? "AVAILABLE" : "OUT_OF_STOCK",
          },
        }).catch((err) => console.error("Failed to restore stock on return:", err));
      }
    }

    return NextResponse.json({
      rental: updatedOrder,
      lateFee,
      damageCharge,
      refundAmount,
      depositStatus: newDepositStatus,
    });
  } catch (error) {
    console.error("POST /api/rentals/[id]/return error:", error);
    return NextResponse.json(
      { error: "Failed to process rental return" },
      { status: 500 }
    );
  }
}
