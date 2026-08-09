import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { products as seedProducts } from "@/lib/data";

export async function GET() {
  try {
    let dbProducts = await prisma.product.findMany({
      orderBy: { name: "asc" },
      include: {
        variants: {
          include: {
            attributeValues: {
              include: {
                attributeValue: {
                  include: { attribute: true },
                },
              },
            },
          },
        },
        categoryRef: true,
        images: true,
      },
    });

    // Auto-seed database if empty
    if (dbProducts.length === 0) {
      for (const prod of seedProducts) {
        await prisma.product.create({
          data: {
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
        include: {
          variants: {
            include: {
              attributeValues: {
                include: {
                  attributeValue: {
                    include: { attribute: true },
                  },
                },
              },
            },
          },
          categoryRef: true,
          images: true,
        },
      });
    }

    return NextResponse.json(dbProducts);
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(seedProducts);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      category,
      brand,
      rentalUnit = "day",
      price,
      rentalPrice,
      securityDeposit,
      inStock = 5,
      image,
      imageUrl,
      categoryId,
      attributeValueIds = [],
      variants = [],
    } = body;

    const finalPrice = price !== undefined ? parseFloat(price) : rentalPrice !== undefined ? parseFloat(rentalPrice) : 0;

    if (!name || !description || !category || finalPrice === undefined || securityDeposit === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: Name, Description, Category, Price, and Security Deposit." },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        category,
        brand: brand || null,
        image: image || "/images/placeholder.jpg",
        imageUrl: imageUrl || null,
        rentalUnit: rentalUnit || "day",
        price: finalPrice,
        securityDeposit: parseFloat(securityDeposit),
        inStock: parseInt(String(inStock), 10) || 5,
        categoryId: categoryId || null,
      },
      include: {
        categoryRef: true,
      },
    });

    // Create default variant if attributeValueIds are provided
    if (attributeValueIds && attributeValueIds.length > 0) {
      const variant = await prisma.productVariant.create({
        data: {
          productId: newProduct.id,
          sku: `${newProduct.name.replace(/\s+/g, "-").toUpperCase()}-${newProduct.id}`,
          price: finalPrice,
          stock: parseInt(String(inStock), 10) || 5,
        },
      });

      for (const valId of attributeValueIds) {
        if (valId) {
          await prisma.productVariantAttributeValue.create({
            data: {
              variantId: variant.id,
              attributeValueId: valId,
            },
          }).catch(() => {});
        }
      }
    } else if (variants && variants.length > 0) {
      for (const v of variants) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: newProduct.id,
            sku: v.sku || `${newProduct.name.replace(/\s+/g, "-").toUpperCase()}-${Math.random().toString(36).substring(2, 6)}`,
            price: v.price !== undefined ? parseFloat(v.price) : finalPrice,
            stock: v.stock !== undefined ? parseInt(v.stock, 10) : 5,
          },
        });
        if (v.attributeValueIds && Array.isArray(v.attributeValueIds)) {
          for (const valId of v.attributeValueIds) {
            await prisma.productVariantAttributeValue.create({
              data: {
                variantId: variant.id,
                attributeValueId: valId,
              },
            }).catch(() => {});
          }
        }
      }
    }

    // Refetch created product with complete variant relations
    const fullProduct = await prisma.product.findUnique({
      where: { id: newProduct.id },
      include: {
        variants: {
          include: {
            attributeValues: {
              include: {
                attributeValue: {
                  include: { attribute: true },
                },
              },
            },
          },
        },
        categoryRef: true,
        images: true,
      },
    });

    return NextResponse.json(fullProduct, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
