import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        categoryRef: true,
        variants: {
          include: {
            attributeValues: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Format variants to resolve attributeValues into clean objects: { attribute: "Color", value: "Red" }
    const formattedVariants = product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
      attributeValues: v.attributeValues.map((av) => ({
        attribute: av.attributeValue.attribute.name,
        value: av.attributeValue.value,
        attributeId: av.attributeValue.attributeId,
        attributeValueId: av.attributeValueId,
      })),
    }));

    // Extract unique colors for display swatches
    const colors = Array.from(
      new Set(
        formattedVariants
          .flatMap((v) => v.attributeValues)
          .filter((av) => av.attribute.toLowerCase() === "color")
          .map((av) => av.value)
      )
    );

    return NextResponse.json({
      ...product,
      variants: formattedVariants,
      colors,
    });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
