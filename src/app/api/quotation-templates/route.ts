import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const templates = await prisma.quotationTemplate.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error("GET /api/quotation-templates error:", error);
    return NextResponse.json({ error: "Failed to fetch quotation templates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, validityDays = 30, paymentTerms = "Immediate Payment", templateLines = [] } = body;

    if (!name) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }

    const newTemplate = await prisma.quotationTemplate.create({
      data: {
        name,
        validityDays: Number(validityDays) || 30,
        paymentTerms,
        templateLines: typeof templateLines === "string" ? templateLines : JSON.stringify(templateLines),
      },
    });

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error("POST /api/quotation-templates error:", error);
    return NextResponse.json({ error: "Failed to create quotation template" }, { status: 500 });
  }
}
