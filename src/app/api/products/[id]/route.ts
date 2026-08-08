import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);

    const product = await prisma.product.findUnique({
      where: { id: !isNaN(numId) ? numId : undefined },
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: numId },
    });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("DELETE /api/products/[id] error:", error);
    // Foreign key constraint violation error code in Prisma is P2003
    if (error.code === "P2003" || (error.message && error.message.includes("Foreign key constraint"))) {
      return NextResponse.json(
        { error: "Cannot delete this product — it has an active or pending rental. It can only be removed after the item is returned." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
