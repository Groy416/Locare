import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export async function POST() {
  try {
    await prisma.invoice.deleteMany();
    await prisma.orderLine.deleteMany();
    await prisma.rentalOrder.deleteMany();
    await prisma.productAttribute.deleteMany();
    await prisma.quotationTemplate.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    await prisma.pickupReturnSetting.deleteMany();
    await prisma.lateFeeConfig.deleteMany();

    await prisma.pickupReturnSetting.create({
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

    await prisma.lateFeeConfig.create({
      data: {
        id: "default",
        dailyRate: 15,
        gracePeriodDays: 1,
      },
    });

    const adminPasswordHash = await bcrypt.hash("admin123", 10);
    const vendorPasswordHash = await bcrypt.hash("vendor123", 10);
    const customerPasswordHash = await bcrypt.hash("customer123", 10);

    await prisma.user.create({
      data: {
        firstName: "System",
        lastName: "Administrator",
        name: "Admin User",
        email: "admin@locare.com",
        passwordHash: adminPasswordHash,
        role: "admin",
      },
    });

    const vendor = await prisma.user.create({
      data: {
        firstName: "Mark",
        lastName: "Wood",
        name: "TechRentals Vendor",
        email: "vendor@locare.com",
        passwordHash: vendorPasswordHash,
        role: "vendor",
        companyName: "TechRentals Inc.",
        productCategory: "AV Equipment & Electronics",
        gstNo: "27AABCU9603R1ZN",
      },
    });

    const customer = await prisma.user.create({
      data: {
        firstName: "Sarah",
        lastName: "Chen",
        name: "Sarah Chen",
        email: "customer@locare.com",
        passwordHash: customerPasswordHash,
        role: "customer",
      },
    });

    const initialProducts = [
      {
        id: 1,
        name: "Pressure Washer Pro 3000",
        description: "Industrial-grade pressure washer, 3000 PSI. Perfect for driveways, decks, and exterior walls.",
        category: "Cleaning Equipment",
        image: "/images/pressure-washer.jpg",
        rentalUnit: "day",
        price: 75,
        securityDeposit: 200,
        inStock: 4,
        vendorId: vendor.id,
      },
      {
        id: 2,
        name: "Excavator Mini 1.5T",
        description: "Compact mini excavator ideal for landscaping, trenching, and small demolition jobs.",
        category: "Heavy Equipment",
        image: "/images/excavator.jpg",
        rentalUnit: "day",
        price: 350,
        securityDeposit: 1500,
        inStock: 2,
      },
      {
        id: 3,
        name: "Scaffolding Tower Set",
        description: "Aluminium scaffold tower, 6m working height. Includes platform, guardrails, and outriggers.",
        category: "Access Equipment",
        image: "/images/scaffolding.jpg",
        rentalUnit: "week",
        price: 220,
        securityDeposit: 500,
        inStock: 6,
      },
    ];

    for (const prod of initialProducts) {
      await prisma.product.create({ data: prod });
    }

    const orderData = [
      {
        id: 1,
        orderNumber: "SO00001",
        customerId: customer.id,
        customerName: "Sarah Chen",
        invoiceAddress: "123 Tech Park, Suite 400",
        deliveryAddress: "123 Tech Park, Suite 400",
        rentalStart: daysFromNow(-4),
        rentalEnd: daysFromNow(3),
        deliveryMethod: "delivery",
        status: "CONFIRMED",
        invoiceStatus: "INVOICED",
        untaxedAmount: 525,
        taxAmount: 52.5,
        totalAmount: 577.5,
        depositAmount: 200,
        depositStatus: "held",
        lines: [
          { productId: 1, quantity: 1, unitPrice: 75, taxPercent: 10, amount: 525 },
        ],
      },
    ];

    for (const ord of orderData) {
      const { lines, ...orderFields } = ord;
      const createdOrder = await prisma.rentalOrder.create({ data: orderFields });

      for (const line of lines) {
        await prisma.orderLine.create({
          data: {
            rentalOrderId: createdOrder.id,
            ...line,
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: "ERP Database reset successfully." });
  } catch (error) {
    console.error("POST /api/reset error:", error);
    return NextResponse.json({ error: "Failed to reset ERP database" }, { status: 500 });
  }
}
