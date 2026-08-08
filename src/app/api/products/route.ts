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
      rentalUnit,
      price,
      securityDeposit,
      inStock,
      image,
      imageUrl,
      categoryId,
    } = body;

    if (!name || !description || !category || !rentalUnit || price === undefined || securityDeposit === undefined || inStock === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        category,
        image: image || "/images/placeholder.jpg",
        imageUrl: imageUrl || null,
        rentalUnit,
        price: parseFloat(price),
        securityDeposit: parseFloat(securityDeposit),
        inStock: parseInt(inStock, 10),
        categoryId: categoryId || null,
      },
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
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("POST /api/products error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
