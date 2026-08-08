import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateLateFee, calculateDepositRefund } from "@/lib/rental-logic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const damageCharge = Number(body.damageCharge) || 0;

    const rental = await prisma.rental.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!rental) {
      return NextResponse.json({ error: "Rental order not found" }, { status: 404 });
    }

    const config = (await prisma.lateFeeConfig.findFirst()) || {
      dailyRate: 15,
      gracePeriodDays: 1,
    };

    const lateFee = calculateLateFee(rental.rentalEnd, config);
    const refundAmount = calculateDepositRefund(rental.depositAmount, lateFee, damageCharge);

    let newDepositStatus = "refunded";
    if (lateFee + damageCharge > 0) {
      newDepositStatus = "partially-deducted";
    }

    const updatedRental = await prisma.rental.update({
      where: { id },
      data: {
        status: "returned",
        lateFeeCharged: lateFee,
        damageCharge: damageCharge,
        depositStatus: newDepositStatus,
      },
      include: { product: true },
    });

    return NextResponse.json({
      rental: updatedRental,
      lateFee,
      damageCharge,
      refundAmount,
      depositStatus: newDepositStatus,
    });
  } catch (error) {
    console.error("POST /api/rentals/[id]/return error:", error);
    return NextResponse.json(
      { error: "Failed to process rental return" },
      { status: 500 }
    );
  }
}
