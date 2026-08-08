import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLateFee } from "@/lib/rental-logic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);

    const order = await prisma.rentalOrder.findFirst({
      where: !isNaN(numId)
        ? { OR: [{ id: numId }, { orderNumber: id }] }
        : { orderNumber: id },
      include: {
        orderLines: {
          include: { product: true },
        },
        invoices: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    const body = await request.json();
    const { status, invoiceStatus } = body;

    const existing = await prisma.rentalOrder.findFirst({
      where: !isNaN(numId)
        ? { OR: [{ id: numId }, { orderNumber: id }] }
        : { orderNumber: id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      // Auto-set invoice status when confirmed
      if (status === "CONFIRMED" && existing.invoiceStatus === "NOTHING_TO_INVOICE") {
        updateData.invoiceStatus = "WAITING_TO_INVOICE";
      }

      // Calculate late fee automatically when returned
      if (status === "RETURNED") {
        const config = (await prisma.pickupReturnSetting.findFirst()) || {
          dailyRate: 15,
          gracePeriodDays: 1,
        };
        const lateFee = calculateLateFee(existing.rentalEnd, config);
        updateData.lateFeeCharged = lateFee;
        updateData.depositStatus = lateFee > 0 ? "partially-deducted" : "refunded";
      }
    }

    if (invoiceStatus) {
      updateData.invoiceStatus = invoiceStatus;
    }

    const updatedOrder = await prisma.rentalOrder.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        orderLines: {
          include: { product: true },
        },
        invoices: true,
      },
    });

    // If status changed to PICKED_UP or RETURNED, update products
    if (status === "PICKED_UP") {
      for (const line of updatedOrder.orderLines) {
        if (line.productId) {
          await prisma.product.update({
            where: { id: line.productId },
            data: { status: "RENTED" },
          }).catch((err) => console.error("Failed to update product status to RENTED:", err));
        }
      }
    } else if (status === "RETURNED") {
      for (const line of updatedOrder.orderLines) {
        if (line.productId) {
          const prod = await prisma.product.findUnique({ where: { id: line.productId } });
          const newStock = (prod?.inStock || 0) + line.quantity;
          await prisma.product.update({
            where: { id: line.productId },
            data: {
              inStock: newStock,
              status: newStock > 0 ? "AVAILABLE" : "OUT_OF_STOCK",
            },
          }).catch((err) => console.error("Failed to restore product stock on RETURNED:", err));
        }
      }
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update order state" },
      { status: 500 }
    );
  }
}
