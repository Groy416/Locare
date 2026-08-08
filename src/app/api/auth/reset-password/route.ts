import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Please enter your Email ID." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this Email ID." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "The password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("POST /api/auth/reset-password error:", error);
    return NextResponse.json(
      { error: "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
