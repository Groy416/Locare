import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, amountPaid } = body;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      if (status === "PAID") {
        updateData.amountPaid = invoice.totalAmount;
      }
    }

    if (amountPaid !== undefined) {
      updateData.amountPaid = Number(amountPaid);
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        rentalOrder: true,
      },
    });

    if (status === "POSTED" || status === "PAID") {
      await prisma.rentalOrder.update({
        where: { id: invoice.rentalOrderId },
        data: { invoiceStatus: "INVOICED" },
      });
    }

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("PATCH /api/invoices/[id] error:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}
