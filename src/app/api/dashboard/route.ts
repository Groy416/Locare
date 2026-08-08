import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aggregateDashboardMetrics, calculateLateFee } from "@/lib/rental-logic";
import type { Rental, Product } from "@/lib/data";

export async function GET() {
  try {
    const dbProducts = await prisma.product.findMany();
    const dbRentals = await prisma.rental.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    const lateConfig = (await prisma.lateFeeConfig.findFirst()) || {
      dailyRate: 15,
      gracePeriodDays: 1,
    };

    // Format products to match Product interface
    const products: Product[] = dbProducts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      image: p.image,
      rentalUnit: p.rentalUnit as Product["rentalUnit"],
      price: p.price,
      securityDeposit: p.securityDeposit,
      inStock: p.inStock,
    }));

    // Format rentals to match Rental interface
    const rentals: Rental[] = dbRentals.map((r) => {
      let depStatus: Rental["depositStatus"] = "held";
      if (r.depositStatus === "refunded") depStatus = "refunded";
      if (r.depositStatus === "partially_deducted") depStatus = "partially-deducted";

      return {
        id: r.id,
        productId: r.productId,
        customerName: r.customerName,
        rentalStart: r.rentalStart,
        rentalEnd: r.rentalEnd,
        deliveryMethod: r.deliveryMethod as Rental["deliveryMethod"],
        status: r.status as Rental["status"],
        depositAmount: r.depositAmount,
        depositStatus: depStatus,
        lateFeeCharged: r.lateFeeCharged,
      };
    });

    const metrics = aggregateDashboardMetrics(rentals, products);

    // Filter active and overdue rentals for returns queue
    const returnsQueue = dbRentals
      .filter((r) => r.status === "active" || r.status === "overdue")
      .map((r) => {
        const estimatedLateFee = calculateLateFee(r.rentalEnd, lateConfig);
        return {
          ...r,
          estimatedLateFee,
        };
      });

    return NextResponse.json({
      metrics,
      rentals,
      returnsQueue,
      lateConfig,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard metrics" },
      { status: 500 }
    );
  }
}
