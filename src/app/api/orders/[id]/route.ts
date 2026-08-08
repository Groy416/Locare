import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("PATCH /api/orders/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update order state" },
      { status: 500 }
    );
  }
}
