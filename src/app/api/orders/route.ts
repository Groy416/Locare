import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter"); // "today" | "pickup" | "return" | "late"
    const search = searchParams.get("search") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
      ];
    }

    if (filter === "late") {
      where.status = "OVERDUE";
    } else if (filter === "pickup") {
      where.deliveryMethod = "pickup";
    } else if (filter === "return") {
      where.status = "RETURNED";
    }

    const orders = await prisma.rentalOrder.findMany({
      where,
      include: {
        orderLines: {
          include: { product: true },
        },
        invoices: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute Metrics Summary
    const allOrders = await prisma.rentalOrder.findMany();
    const totalSales = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalLateFees = allOrders.reduce((sum, o) => sum + o.lateFeeCharged, 0);
    const totalDeposits = allOrders
      .filter((o) => o.depositStatus === "held")
      .reduce((sum, o) => sum + o.depositAmount, 0);

    return NextResponse.json({
      orders,
      metrics: {
        totalSales,
        totalLateFees,
        totalDeposits,
      },
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rental orders." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      invoiceAddress,
      deliveryAddress,
      rentalStart,
      rentalEnd,
      priceList = "Standard",
      orderLines = [],
    } = body;

    if (!customerName || !rentalStart || !rentalEnd || orderLines.length === 0) {
      return NextResponse.json(
        { error: "Customer name, rental period, and at least one order line are required." },
        { status: 400 }
      );
    }

    // Auto generate next order number SO0000X
    const count = await prisma.rentalOrder.count();
    const orderNumber = `SO${String(count + 1).padStart(5, "0")}`;

    let untaxedAmount = 0;
    let taxAmount = 0;

    const formattedLines = [];
    for (const line of orderLines) {
      const lineAmount = line.quantity * line.unitPrice;
      const lineTax = lineAmount * ((line.taxPercent || 10) / 100);
      untaxedAmount += lineAmount;
      taxAmount += lineTax;

      formattedLines.push({
        productId: typeof line.productId === "number" ? line.productId : parseInt(line.productId, 10),
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        taxPercent: line.taxPercent || 10,
        amount: lineAmount,
      });
    }

    const totalAmount = untaxedAmount + taxAmount;

    const newOrder = await prisma.rentalOrder.create({
      data: {
        orderNumber,
        customerName,
        invoiceAddress,
        deliveryAddress,
        rentalStart,
        rentalEnd,
        priceList,
        status: "QUOTATION",
        invoiceStatus: "NOTHING_TO_INVOICE",
        untaxedAmount,
        taxAmount,
        totalAmount,
        depositAmount: Math.round(totalAmount * 0.3),
        orderLines: {
          create: formattedLines,
        },
      },
      include: {
        orderLines: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { error: "Failed to create rental order." },
      { status: 500 }
    );
  }
}
