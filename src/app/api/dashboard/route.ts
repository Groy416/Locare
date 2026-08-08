import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aggregateDashboardMetrics, calculateLateFee } from "@/lib/rental-logic";
import type { Rental, Product } from "@/lib/data";
import { products as seedProducts, rentals as seedRentals } from "@/lib/data";

export async function GET() {
  try {
    let dbProducts = await prisma.product.findMany();
    let dbRentals = await prisma.rental.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });

    // Auto-seed products if DB is empty
    if (dbProducts.length === 0) {
      for (const prod of seedProducts) {
        await prisma.product.create({
          data: {
            id: prod.id,
            name: prod.name,
            description: prod.description,
            category: prod.category,
            image: prod.image,
            rentalUnit: prod.rentalUnit,
            price: prod.price,
            securityDeposit: prod.securityDeposit,
            inStock: prod.inStock,
          },
        }).catch(() => {});
      }
      dbProducts = await prisma.product.findMany();
    }

    // Auto-seed rentals if DB is empty
    if (dbRentals.length === 0) {
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
      dbRentals = await prisma.rental.findMany({
        include: { product: true },
        orderBy: { createdAt: "desc" },
      });
    }

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
      if (r.depositStatus === "partially_deducted" || r.depositStatus === "partially-deducted") depStatus = "partially-deducted";

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
      products,
      returnsQueue,
      lateConfig,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    const metrics = aggregateDashboardMetrics(seedRentals, seedProducts);
    return NextResponse.json({
      metrics,
      rentals: seedRentals,
      products: seedProducts,
      returnsQueue: seedRentals.filter((r) => r.status === "active" || r.status === "overdue"),
      lateConfig: { dailyRate: 15, gracePeriodDays: 1 },
    });
  }
}
