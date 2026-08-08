import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aggregateDashboardMetrics, calculateLateFee } from "@/lib/rental-logic";
import type { Rental, Product } from "@/lib/data";
import { products as seedProducts, rentals as seedRentals } from "@/lib/data";

export async function GET() {
  try {
    let dbProducts = await prisma.product.findMany();
    let dbOrders = await prisma.rentalOrder.findMany({
      include: {
        orderLines: {
          include: { product: true },
        },
      },
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

    const lateConfig = (await prisma.pickupReturnSetting.findFirst()) || {
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

    // Format orders to match Rental interface
    const rentals: Rental[] = dbOrders.map((r) => {
      let depStatus: Rental["depositStatus"] = "held";
      if (r.depositStatus === "refunded") depStatus = "refunded";
      if (r.depositStatus === "partially_deducted" || r.depositStatus === "partially-deducted") depStatus = "partially-deducted";

      let statusMap: Rental["status"] = "booked";
      if (r.status === "PICKED_UP") statusMap = "active";
      else if (r.status === "RETURNED") statusMap = "returned";
      else if (r.status === "OVERDUE") statusMap = "overdue";
      else if (r.status === "CONFIRMED") statusMap = "active";

      return {
        id: r.id,
        productId: r.orderLines[0]?.productId || "prod-001",
        customerName: r.customerName,
        rentalStart: r.rentalStart,
        rentalEnd: r.rentalEnd,
        deliveryMethod: r.deliveryMethod as Rental["deliveryMethod"],
        status: statusMap,
        depositAmount: r.depositAmount,
        depositStatus: depStatus,
        lateFeeCharged: r.lateFeeCharged,
      };
    });

    const metrics = aggregateDashboardMetrics(rentals, products);

    const returnsQueue = dbOrders
      .filter((r) => r.status === "CONFIRMED" || r.status === "PICKED_UP" || r.status === "OVERDUE")
      .map((r) => {
        const estimatedLateFee = calculateLateFee(r.rentalEnd, {
          dailyRate: lateConfig.dailyRate,
          gracePeriodDays: lateConfig.gracePeriodDays,
        });
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
      returnsQueue: seedRentals.filter((r: Rental) => r.status === "active" || r.status === "overdue"),
      lateConfig: { dailyRate: 15, gracePeriodDays: 1 },
    });
  }
}
