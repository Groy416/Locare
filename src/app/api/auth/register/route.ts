import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      role = "customer",
      companyName,
      productCategory,
      gstNo,
    } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Password and Confirm Password fields must match." },
        { status: 400 }
      );
    }

    // Password validation rules from wireframe:
    // Length 6-12, 1 uppercase, 1 lowercase, 1 special char (@, $, #, ...)
    if (password.length < 6 || password.length > 12) {
      return NextResponse.json(
        { error: "Password length must be between 6 and 12 characters." },
        { status: 400 }
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter." },
        { status: 400 }
      );
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one lowercase letter." },
        { status: 400 }
      );
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one special character (@, $, #, etc.)." },
        { status: 400 }
      );
    }

    // Check unique email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this Email ID already exists." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = `${firstName || ""} ${lastName || ""}`.trim() || email.split("@")[0];

    const newUser = await prisma.user.create({
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
        name: fullName,
        email: email.toLowerCase(),
        passwordHash,
        role: role === "vendor" ? "vendor" : "customer",
        companyName: companyName || null,
        productCategory: productCategory || null,
        gstNo: gstNo || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully.",
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/auth/register error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
