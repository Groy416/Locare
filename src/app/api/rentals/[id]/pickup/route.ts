import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
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
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Rental order not found" }, { status: 404 });
    }

    const updatedOrder = await prisma.rentalOrder.update({
      where: { id: order.id },
      data: {
        status: "PICKED_UP",
      },
      include: {
        orderLines: {
          include: { product: true },
        },
      },
    });

    // Update products status to RENTED
    for (const line of order.orderLines) {
      if (line.productId) {
        await prisma.product.update({
          where: { id: line.productId },
          data: {
            status: "RENTED",
          },
        }).catch((err) => console.error("Failed to update product status to RENTED:", err));
      }
    }

    return NextResponse.json({
      success: true,
      rental: updatedOrder,
      message: "Item marked as Picked Up / Active Rental",
    });
  } catch (error) {
    console.error("POST /api/rentals/[id]/pickup error:", error);
    return NextResponse.json(
      { error: "Failed to process pickup" },
      { status: 500 }
    );
  }
}
