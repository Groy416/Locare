import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding local database...");

  // Clean existing tables
  await prisma.rental.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.lateFeeConfig.deleteMany();

  // 1. Seed Late Fee Config
  await prisma.lateFeeConfig.create({
    data: {
      id: "default",
      dailyRate: 15,
      gracePeriodDays: 1,
    },
  });

  // 2. Seed Users
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const customerPasswordHash = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@locare.com",
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Customer User",
      email: "customer@locare.com",
      passwordHash: customerPasswordHash,
      role: "customer",
    },
  });

  console.log(`Created Users: Admin (${admin.email}), Customer (${customer.email})`);

  // 3. Seed Products
  const initialProducts = [
    {
      id: "prod-001",
      name: "Pressure Washer Pro 3000",
      description: "Industrial-grade pressure washer, 3000 PSI. Perfect for driveways, decks, and exterior walls.",
      category: "Cleaning Equipment",
      image: "/images/pressure-washer.jpg",
      rentalUnit: "day",
      price: 75,
      securityDeposit: 200,
      inStock: 4,
    },
    {
      id: "prod-002",
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
      id: "prod-003",
      name: "Scaffolding Tower Set",
      description: "Aluminium scaffold tower, 6m working height. Includes platform, guardrails, and outriggers.",
      category: "Access Equipment",
      image: "/images/scaffolding.jpg",
      rentalUnit: "week",
      price: 220,
      securityDeposit: 500,
      inStock: 6,
    },
    {
      id: "prod-004",
      name: "Concrete Mixer 9 cu ft",
      description: "Portable concrete mixer with electric motor. Mixes up to 9 cubic feet per batch.",
      category: "Construction",
      image: "/images/concrete-mixer.jpg",
      rentalUnit: "day",
      price: 95,
      securityDeposit: 300,
      inStock: 3,
    },
    {
      id: "prod-005",
      name: "Projector 4K Ultra",
      description: "4K laser projector with 5000 lumens. Great for events, conferences, and outdoor screenings.",
      category: "AV Equipment",
      image: "/images/projector.jpg",
      rentalUnit: "day",
      price: 120,
      securityDeposit: 400,
      inStock: 5,
    },
    {
      id: "prod-006",
      name: "Party Tent 20x40 ft",
      description: "Large white party tent with sidewalls. Seats up to 100 guests comfortably.",
      category: "Events",
      image: "/images/party-tent.jpg",
      rentalUnit: "day",
      price: 250,
      securityDeposit: 600,
      inStock: 3,
    },
    {
      id: "prod-007",
      name: "Generator 7500W",
      description: "Portable gasoline generator, 7500W peak power. Ideal for job sites and emergency backup.",
      category: "Power Equipment",
      image: "/images/generator.jpg",
      rentalUnit: "day",
      price: 85,
      securityDeposit: 350,
      inStock: 4,
    },
    {
      id: "prod-008",
      name: "Aerial Lift 40 ft",
      description: "Telescopic boom lift with 40 ft working height. For exterior painting, tree work, and signage.",
      category: "Access Equipment",
      image: "/images/aerial-lift.jpg",
      rentalUnit: "day",
      price: 425,
      securityDeposit: 2000,
      inStock: 1,
    },
  ];

  for (const prod of initialProducts) {
    await prisma.product.create({ data: prod });
  }
  console.log(`Seeded ${initialProducts.length} products.`);

  // Helper date function
  function daysFromNow(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }

  // 4. Seed Rentals
  const initialRentals = [
    {
      id: "rent-001",
      productId: "prod-001",
      customerName: "Sarah Chen",
      rentalStart: daysFromNow(-4),
      rentalEnd: daysFromNow(3),
      deliveryMethod: "delivery",
      status: "active",
      depositAmount: 200,
      depositStatus: "held",
      lateFeeCharged: 0,
      userId: customer.id,
    },
    {
      id: "rent-002",
      productId: "prod-005",
      customerName: "Marcus Johnson",
      rentalStart: daysFromNow(-2),
      rentalEnd: daysFromNow(0),
      deliveryMethod: "pickup",
      status: "active",
      depositAmount: 400,
      depositStatus: "held",
      lateFeeCharged: 0,
    },
    {
      id: "rent-003",
      productId: "prod-002",
      customerName: "Priya Patel",
      rentalStart: daysFromNow(-10),
      rentalEnd: daysFromNow(-3),
      deliveryMethod: "delivery",
      status: "overdue",
      depositAmount: 1500,
      depositStatus: "held",
      lateFeeCharged: 0,
    },
    {
      id: "rent-004",
      productId: "prod-006",
      customerName: "David Kim",
      rentalStart: daysFromNow(1),
      rentalEnd: daysFromNow(3),
      deliveryMethod: "delivery",
      status: "booked",
      depositAmount: 600,
      depositStatus: "held",
      lateFeeCharged: 0,
    },
    {
      id: "rent-005",
      productId: "prod-004",
      customerName: "Emily Rodriguez",
      rentalStart: daysFromNow(-14),
      rentalEnd: daysFromNow(-7),
      deliveryMethod: "pickup",
      status: "returned",
      depositAmount: 300,
      depositStatus: "refunded",
      lateFeeCharged: 0,
    },
    {
      id: "rent-006",
      productId: "prod-008",
      customerName: "James O'Brien",
      rentalStart: daysFromNow(-12),
      rentalEnd: daysFromNow(-5),
      deliveryMethod: "delivery",
      status: "overdue",
      depositAmount: 2000,
      depositStatus: "held",
      lateFeeCharged: 0,
    },
  ];

  for (const rent of initialRentals) {
    await prisma.rental.create({ data: rent });
  }
  console.log(`Seeded ${initialRentals.length} rentals.`);
  console.log("Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
