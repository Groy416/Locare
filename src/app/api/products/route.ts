import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { products as seedProducts } from "@/lib/data";

export async function GET() {
  try {
    let dbProducts = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });

    // Auto-seed database if empty
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
      dbProducts = await prisma.product.findMany({
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json(dbProducts);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(seedProducts);
  }
}
