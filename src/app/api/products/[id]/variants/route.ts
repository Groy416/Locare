import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { sku, price, stock, attributeValueIds = [] } = body;

    if (!sku || price === undefined || stock === undefined) {
      return NextResponse.json(
        { error: "sku, price, and stock are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId: id,
        sku,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        attributeValues: {
          create: (attributeValueIds as string[]).map((avId) => ({
            attributeValueId: avId,
          })),
        },
      },
      include: {
        attributeValues: {
          include: {
            attributeValue: {
              include: { attribute: true },
            },
          },
        },
      },
    });

    return NextResponse.json(variant, { status: 201 });
  } catch (error) {
    console.error("POST /api/products/[id]/variants error:", error);
    return NextResponse.json({ error: "Failed to create variant" }, { status: 500 });
  }
}
