import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    // If categoryId provided, query the new relational Attribute model
    if (categoryId) {
      const attributes = await prisma.attribute.findMany({
        where: { categoryId },
        include: {
          values: true,
        },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(attributes);
    }

    // Default: return legacy ProductAttribute records
    const attributes = await prisma.productAttribute.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(attributes);
  } catch (error) {
    console.error("GET /api/attributes error:", error);
    return NextResponse.json({ error: "Failed to fetch attributes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, displayType = "radio", values = [] } = body;

    if (!name) {
      return NextResponse.json({ error: "Attribute name is required" }, { status: 400 });
    }

    const newAttribute = await prisma.productAttribute.create({
      data: {
        name,
        displayType,
        values: typeof values === "string" ? values : JSON.stringify(values),
      },
    });

    return NextResponse.json(newAttribute, { status: 201 });
  } catch (error) {
    console.error("POST /api/attributes error:", error);
    return NextResponse.json({ error: "Failed to create attribute" }, { status: 500 });
  }
}
