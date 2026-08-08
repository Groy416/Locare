import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        rentalOrder: {
          include: {
            orderLines: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("GET /api/invoices error:", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rentalOrderId } = body;

    if (!rentalOrderId) {
      return NextResponse.json(
        { error: "rentalOrderId is required to create an invoice." },
        { status: 400 }
      );
    }

    const order = await prisma.rentalOrder.findUnique({
      where: { id: rentalOrderId },
    });

    if (!order) {
      return NextResponse.json({ error: "Rental order not found" }, { status: 404 });
    }

    // Auto-generate INV/2026/0001
    const count = await prisma.invoice.count();
    const invoiceNumber = `INV/2026/${String(count + 1).padStart(4, "0")}`;
    const todayStr = new Date().toISOString().split("T")[0];

    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        rentalOrderId,
        invoiceDate: todayStr,
        status: "DRAFT",
        untaxedAmount: order.untaxedAmount,
        taxAmount: order.taxAmount,
        totalAmount: order.totalAmount,
        amountPaid: 0,
      },
      include: {
        rentalOrder: {
          include: {
            orderLines: {
              include: { product: true },
            },
          },
        },
      },
    });

    // Update order invoice status
    await prisma.rentalOrder.update({
      where: { id: rentalOrderId },
      data: { invoiceStatus: "DRAFT_INVOICE" },
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error("POST /api/invoices error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
