import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.pickupReturnSetting.findFirst();
    if (!settings) {
      settings = await prisma.pickupReturnSetting.create({
        data: {
          id: "default",
          dailyRate: 15,
          hourlyRate: 2.5,
          gracePeriodDays: 1,
          enableVendors: true,
          enableAttributes: true,
          enablePriceLists: true,
        },
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("GET /api/settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      dailyRate,
      hourlyRate,
      gracePeriodDays,
      enableVendors,
      enableAttributes,
      enablePriceLists,
    } = body;

    const updated = await prisma.pickupReturnSetting.upsert({
      where: { id: "default" },
      update: {
        dailyRate: Number(dailyRate) || 15,
        hourlyRate: Number(hourlyRate) || 2.5,
        gracePeriodDays: Number(gracePeriodDays) || 1,
        enableVendors: Boolean(enableVendors),
        enableAttributes: Boolean(enableAttributes),
        enablePriceLists: Boolean(enablePriceLists),
      },
      create: {
        id: "default",
        dailyRate: Number(dailyRate) || 15,
        hourlyRate: Number(hourlyRate) || 2.5,
        gracePeriodDays: Number(gracePeriodDays) || 1,
        enableVendors: Boolean(enableVendors),
        enableAttributes: Boolean(enableAttributes),
        enablePriceLists: Boolean(enablePriceLists),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("POST /api/settings error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
