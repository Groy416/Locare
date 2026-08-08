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

    // Check if product is linked to any active (unreturned) rental orders
    const activeRentalLines = await prisma.orderLine.count({
      where: {
        productId: numId,
        rentalOrder: {
          status: { in: ["QUOTATION", "QUOTATION_SENT", "CONFIRMED", "PICKED_UP", "OVERDUE", "active"] },
        },
      },
    });

    if (activeRentalLines > 0) {
      return NextResponse.json(
        { error: "Cannot delete product because it has an active, unreturned rental." },
        { status: 409 }
      );
    }

    // Product is unrented or all rentals have been returned/cancelled.
    // Delete associated historical order lines (if any returned ones remain)
    await prisma.orderLine.deleteMany({
      where: { productId: numId },
    }).catch(() => null);

    // Delete associated variants and product variant attribute values
    const variants = await prisma.productVariant.findMany({
      where: { productId: numId },
      select: { id: true },
    });

    const variantIds = variants.map((v) => v.id);

    if (variantIds.length > 0) {
      await prisma.productVariantAttributeValue.deleteMany({
        where: { variantId: { in: variantIds } },
      });
      await prisma.productVariant.deleteMany({
        where: { productId: numId },
      });
    }

    await prisma.productImage.deleteMany({
      where: { productId: numId },
    });

    await prisma.product.delete({
      where: { id: numId },
    });

    return NextResponse.json({ success: true, deletedId: numId });
  } catch (error: unknown) {
    console.error("DELETE /api/products/[id] error:", error);
    const err = error as { code?: string; message?: string };
    if (err.code === "P2003" || (err.message && err.message.includes("Foreign key constraint"))) {
      return NextResponse.json(
        { error: "Cannot delete product because it is currently linked to an active rental order." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = parseInt(id, 10);
    const body = await request.json();

    if (isNaN(numId)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });
    }

    const newStock = body.inStock !== undefined ? Math.max(0, parseInt(String(body.inStock), 10)) : undefined;
    let autoStatus = body.status ? String(body.status).toUpperCase() : undefined;
    if (newStock !== undefined && !body.status) {
      autoStatus = newStock > 0 ? "AVAILABLE" : "OUT_OF_STOCK";
    }

    const updatedProduct = await prisma.product.update({
      where: { id: numId },
      data: {
        ...(newStock !== undefined ? { inStock: newStock } : {}),
        ...(autoStatus ? { status: autoStatus } : {}),
        ...(body.name ? { name: body.name } : {}),
        ...(body.price !== undefined ? { price: parseFloat(body.price) } : {}),
        ...(body.securityDeposit !== undefined ? { securityDeposit: parseFloat(body.securityDeposit) } : {}),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("PATCH /api/products/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update product details" },
      { status: 500 }
    );
  }
}
// Product ID API verified
