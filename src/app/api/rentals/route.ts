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

    let rentals = await prisma.rental.findMany({
      where: whereClause,
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (rentals.length === 0 && !status) {
      for (const rent of seedRentals) {
        await prisma.rental.create({
          data: {
            id: rent.id,
            productId: rent.productId,
            customerName: rent.customerName,
            rentalStart: rent.rentalStart,
            rentalEnd: rent.rentalEnd,
            deliveryMethod: rent.deliveryMethod,
            status: rent.status,
            depositAmount: rent.depositAmount,
            depositStatus: rent.depositStatus === "partially-deducted" ? "partially_deducted" : rent.depositStatus,
            lateFeeCharged: rent.lateFeeCharged,
          },
        }).catch(() => {});
      }
      rentals = await prisma.rental.findMany({
        include: { product: true },
        orderBy: { createdAt: "desc" },
      });
    }

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

    const newRental = await prisma.rental.create({
      data: {
        productId,
        customerName,
        rentalStart,
        rentalEnd,
        deliveryMethod: deliveryMethod === "delivery" ? "delivery" : "pickup",
        status: "booked",
        depositAmount: depositAmount ?? product.securityDeposit,
        depositStatus: "held",
        lateFeeCharged: 0,
        damageCharge: 0,
        userId: userId || null,
      },
      include: { product: true },
    });

    return NextResponse.json(newRental, { status: 201 });
  } catch (error) {
    console.error("POST /api/rentals error:", error);
    return NextResponse.json({ error: "Failed to create rental" }, { status: 500 });
  }
}
