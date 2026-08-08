import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rentals as seedRentals } from "@/lib/data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const whereClause: Record<string, unknown> = {};
    if (status) {
      whereClause.status = status;
    }

    const orders = await prisma.rentalOrder.findMany({
      where: whereClause,
      include: {
        orderLines: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const rentals = orders.map((o) => ({
      id: o.id,
      productId: o.orderLines[0]?.productId || "",
      product: o.orderLines[0]?.product,
      customerName: o.customerName,
      rentalStart: o.rentalStart,
      rentalEnd: o.rentalEnd,
      deliveryMethod: o.deliveryMethod,
      status: o.status,
      depositAmount: o.depositAmount,
      depositStatus: o.depositStatus,
      lateFeeCharged: o.lateFeeCharged,
    }));

    return NextResponse.json(rentals);
  } catch (error) {
    console.error("GET /api/rentals error:", error);
    return NextResponse.json(seedRentals);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      productId,
      customerName,
      rentalStart,
      rentalEnd,
      deliveryMethod,
      depositAmount,
      userId,
    } = body;

    if (!productId || !customerName || !rentalStart || !rentalEnd) {
      return NextResponse.json(
        { error: "Missing required fields for booking" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const count = await prisma.rentalOrder.count();
    const orderNumber = `SO${String(count + 1).padStart(5, "0")}`;
    const amount = product.price;

    const newOrder = await prisma.rentalOrder.create({
      data: {
        orderNumber,
        customerId: userId || null,
        customerName,
        rentalStart,
        rentalEnd,
        deliveryMethod: deliveryMethod === "delivery" ? "delivery" : "pickup",
        status: "CONFIRMED",
        depositAmount: depositAmount ?? product.securityDeposit,
        depositStatus: "held",
        untaxedAmount: amount,
        taxAmount: amount * 0.1,
        totalAmount: amount * 1.1,
        orderLines: {
          create: [
            {
              productId,
              quantity: 1,
              unitPrice: product.price,
              taxPercent: 10,
              amount,
            },
          ],
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
    console.error("POST /api/rentals error:", error);
    return NextResponse.json({ error: "Failed to create rental" }, { status: 500 });
  }
}
