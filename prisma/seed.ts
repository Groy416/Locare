import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

async function main() {
  console.log("Seeding ERP database...");

  // Clean existing records
  await prisma.invoice.deleteMany();
  await prisma.orderLine.deleteMany();
  await prisma.rentalOrder.deleteMany();
  await prisma.productAttribute.deleteMany();
  await prisma.quotationTemplate.deleteMany();
  await prisma.productVariantAttributeValue.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.attributeValue.deleteMany();
  await prisma.attribute.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.pickupReturnSetting.deleteMany();
  await prisma.lateFeeConfig.deleteMany();

  // 1. Seed Settings
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

  // 2. Seed Users
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const vendorPasswordHash = await bcrypt.hash("vendor123", 10);
  const customerPasswordHash = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.create({
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

  console.log(`Seeded Users: Admin (${admin.email}), Vendor (${vendor.email}), Customer (${customer.email})`);

  // 3. Seed Product Attributes
  await prisma.productAttribute.create({
    data: {
      id: "attr-001",
      name: "Brand",
      displayType: "radio",
      values: JSON.stringify(["Bosch", "DeWalt", "Makita", "Sony"]),
    },
  });
  await prisma.productAttribute.create({
    data: {
      id: "attr-002",
      name: "Color",
      displayType: "pills",
      values: JSON.stringify(["Black", "Yellow", "Blue", "White"]),
    },
  });

  // 4. Seed Quotation Templates
  await prisma.quotationTemplate.create({
    data: {
      id: "tmpl-001",
      name: "Home Rental Furniture",
      validityDays: 30,
      paymentTerms: "Immediate Payment",
      templateLines: JSON.stringify([
        { productName: "Party Tent 20x40 ft", quantity: 1, unitPrice: 250 },
      ]),
    },
  });
  await prisma.quotationTemplate.create({
    data: {
      id: "tmpl-002",
      name: "Office Rental Furniture & AV",
      validityDays: 15,
      paymentTerms: "15 Days Net",
      templateLines: JSON.stringify([
        { productName: "Projector 4K Ultra", quantity: 2, unitPrice: 120 },
      ]),
    },
  });

  // 5. Seed Products
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
      vendorId: vendor.id,
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
      vendorId: vendor.id,
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

  // 6. Seed Rental Orders matching Wireframes (SO00001, SO00002, etc.)
  const orderData = [
    {
      id: "order-001",
      orderNumber: "SO00001",
      customerId: customer.id,
      customerName: "Sarah Chen",
      invoiceAddress: "123 Tech Park, Suite 400",
      deliveryAddress: "123 Tech Park, Suite 400",
      rentalStart: daysFromNow(-4),
      rentalEnd: daysFromNow(3),
      deliveryMethod: "delivery",
      status: "CONFIRMED", // Sale Order Confirmed
      invoiceStatus: "INVOICED",
      untaxedAmount: 525,
      taxAmount: 52.5,
      totalAmount: 577.5,
      depositAmount: 200,
      depositStatus: "held",
      lines: [
        { productId: "prod-001", quantity: 1, unitPrice: 75, taxPercent: 10, amount: 525 },
      ],
    },
    {
      id: "order-002",
      orderNumber: "SO00002",
      customerId: customer.id,
      customerName: "Marcus Johnson",
      invoiceAddress: "88 Horizon Blvd",
      deliveryAddress: "88 Horizon Blvd",
      rentalStart: daysFromNow(-2),
      rentalEnd: daysFromNow(0),
      deliveryMethod: "pickup",
      status: "PICKED_UP", // Picked Up
      invoiceStatus: "WAITING_TO_INVOICE",
      untaxedAmount: 240,
      taxAmount: 24,
      totalAmount: 264,
      depositAmount: 400,
      depositStatus: "held",
      lines: [
        { productId: "prod-005", quantity: 1, unitPrice: 120, taxPercent: 10, amount: 240 },
      ],
    },
    {
      id: "order-003",
      orderNumber: "SO00003",
      customerId: customer.id,
      customerName: "Priya Patel",
      invoiceAddress: "45 Industrial Way",
      deliveryAddress: "45 Industrial Way",
      rentalStart: daysFromNow(-10),
      rentalEnd: daysFromNow(-3),
      deliveryMethod: "delivery",
      status: "OVERDUE", // Late Return
      invoiceStatus: "WAITING_TO_INVOICE",
      untaxedAmount: 2450,
      taxAmount: 245,
      totalAmount: 2695,
      depositAmount: 1500,
      depositStatus: "held",
      lateFeeCharged: 135,
      lines: [
        { productId: "prod-002", quantity: 1, unitPrice: 350, taxPercent: 10, amount: 2450 },
      ],
    },
    {
      id: "order-004",
      orderNumber: "SO00004",
      customerId: customer.id,
      customerName: "David Kim",
      invoiceAddress: "12 Sunset Ave",
      deliveryAddress: "12 Sunset Ave",
      rentalStart: daysFromNow(1),
      rentalEnd: daysFromNow(3),
      deliveryMethod: "delivery",
      status: "QUOTATION_SENT", // Quotation Sent
      invoiceStatus: "NOTHING_TO_INVOICE",
      untaxedAmount: 500,
      taxAmount: 50,
      totalAmount: 550,
      depositAmount: 600,
      depositStatus: "held",
      lines: [
        { productId: "prod-006", quantity: 1, unitPrice: 250, taxPercent: 10, amount: 500 },
      ],
    },
    {
      id: "order-005",
      orderNumber: "SO00005",
      customerId: customer.id,
      customerName: "Emily Rodriguez",
      invoiceAddress: "77 Ocean Drive",
      deliveryAddress: "77 Ocean Drive",
      rentalStart: daysFromNow(-14),
      rentalEnd: daysFromNow(-7),
      deliveryMethod: "pickup",
      status: "RETURNED", // Returned
      invoiceStatus: "INVOICED",
      untaxedAmount: 665,
      taxAmount: 66.5,
      totalAmount: 731.5,
      depositAmount: 300,
      depositStatus: "refunded",
      lines: [
        { productId: "prod-004", quantity: 1, unitPrice: 95, taxPercent: 10, amount: 665 },
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

  // 7. Seed Invoices (INV/2026/0001, etc.)
  await prisma.invoice.create({
    data: {
      id: "inv-001",
      invoiceNumber: "INV/2026/0001",
      rentalOrderId: "order-001",
      invoiceDate: daysFromNow(-4),
      status: "POSTED",
      untaxedAmount: 525,
      taxAmount: 52.5,
      totalAmount: 577.5,
      amountPaid: 577.5,
    },
  });

  await prisma.invoice.create({
    data: {
      id: "inv-002",
      invoiceNumber: "INV/2026/0002",
      rentalOrderId: "order-005",
      invoiceDate: daysFromNow(-14),
      status: "PAID",
      untaxedAmount: 665,
      taxAmount: 66.5,
      totalAmount: 731.5,
      amountPaid: 731.5,
    },
  });

  // ── 8. Seed Categories, Attributes, AttributeValues, Products & Variants ──

  const catClothing = await prisma.category.create({ data: { name: "Clothing" } });
  const catFootwear = await prisma.category.create({ data: { name: "Footwear" } });

  // Clothing attributes
  const attrCSize = await prisma.attribute.create({ data: { name: "Size", categoryId: catClothing.id } });
  const attrCColor = await prisma.attribute.create({ data: { name: "Color", categoryId: catClothing.id } });

  // Footwear attributes
  const attrFSize = await prisma.attribute.create({ data: { name: "Size", categoryId: catFootwear.id } });
  const attrFBrand = await prisma.attribute.create({ data: { name: "Brand", categoryId: catFootwear.id } });

  // Clothing attribute values
  const [cS, cM, cL, cXL] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrCSize.id, value: "S" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCSize.id, value: "M" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCSize.id, value: "L" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCSize.id, value: "XL" } }),
  ]);
  const [cRed, cBlue, cBlack] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "Red" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "Blue" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "Black" } }),
  ]);

  // Footwear attribute values
  const [fUK6, fUK7, fUK8, fUK9, fUK10, fUK11] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id, value: "UK6" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id, value: "UK7" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id, value: "UK8" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id, value: "UK9" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id, value: "UK10" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id, value: "UK11" } }),
  ]);
  const [fNike, fAdidas] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrFBrand.id, value: "Nike" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFBrand.id, value: "Adidas" } }),
  ]);

  // Clothing Product 1: Formal Shirt
  const shirt = await prisma.product.create({
    data: {
      id: "cat-prod-001",
      name: "Formal Dress Shirt",
      description: "Premium cotton formal shirt available in multiple sizes and colors.",
      category: "Clothing",
      image: "/images/placeholder.jpg",
      rentalUnit: "day",
      price: 8,
      securityDeposit: 30,
      inStock: 20,
      categoryId: catClothing.id,
    },
  });

  // Shirt variants: S/Red, M/Blue, L/Black
  const shirtV1 = await prisma.productVariant.create({ data: { productId: shirt.id, sku: "SHIRT-S-RED", price: 8, stock: 5 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: shirtV1.id, attributeValueId: cS.id },
    { variantId: shirtV1.id, attributeValueId: cRed.id },
  ]});
  const shirtV2 = await prisma.productVariant.create({ data: { productId: shirt.id, sku: "SHIRT-M-BLUE", price: 8, stock: 8 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: shirtV2.id, attributeValueId: cM.id },
    { variantId: shirtV2.id, attributeValueId: cBlue.id },
  ]});
  const shirtV3 = await prisma.productVariant.create({ data: { productId: shirt.id, sku: "SHIRT-L-BLACK", price: 9, stock: 7 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: shirtV3.id, attributeValueId: cL.id },
    { variantId: shirtV3.id, attributeValueId: cBlack.id },
  ]});

  // Clothing Product 2: Casual Tee
  const tee = await prisma.product.create({
    data: {
      id: "cat-prod-002",
      name: "Casual Cotton Tee",
      description: "Comfortable everyday cotton t-shirt for casual wear.",
      category: "Clothing",
      image: "/images/placeholder.jpg",
      rentalUnit: "day",
      price: 5,
      securityDeposit: 15,
      inStock: 30,
      categoryId: catClothing.id,
    },
  });

  const teeV1 = await prisma.productVariant.create({ data: { productId: tee.id, sku: "TEE-M-RED", price: 5, stock: 10 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: teeV1.id, attributeValueId: cM.id },
    { variantId: teeV1.id, attributeValueId: cRed.id },
  ]});
  const teeV2 = await prisma.productVariant.create({ data: { productId: tee.id, sku: "TEE-XL-BLACK", price: 5, stock: 20 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: teeV2.id, attributeValueId: cXL.id },
    { variantId: teeV2.id, attributeValueId: cBlack.id },
  ]});

  // Footwear Product 1: Running Shoe
  const runShoe = await prisma.product.create({
    data: {
      id: "cat-prod-003",
      name: "Running Shoe",
      description: "Lightweight performance running shoe with cushioned sole.",
      category: "Footwear",
      image: "/images/placeholder.jpg",
      rentalUnit: "day",
      price: 12,
      securityDeposit: 50,
      inStock: 15,
      categoryId: catFootwear.id,
    },
  });

  const runV1 = await prisma.productVariant.create({ data: { productId: runShoe.id, sku: "RUN-UK8-NIKE", price: 12, stock: 5 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: runV1.id, attributeValueId: fUK8.id },
    { variantId: runV1.id, attributeValueId: fNike.id },
  ]});
  const runV2 = await prisma.productVariant.create({ data: { productId: runShoe.id, sku: "RUN-UK9-ADIDAS", price: 12, stock: 5 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: runV2.id, attributeValueId: fUK9.id },
    { variantId: runV2.id, attributeValueId: fAdidas.id },
  ]});
  const runV3 = await prisma.productVariant.create({ data: { productId: runShoe.id, sku: "RUN-UK10-NIKE", price: 13, stock: 5 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: runV3.id, attributeValueId: fUK10.id },
    { variantId: runV3.id, attributeValueId: fNike.id },
  ]});

  // Footwear Product 2: Formal Oxford
  const oxford = await prisma.product.create({
    data: {
      id: "cat-prod-004",
      name: "Formal Oxford Shoe",
      description: "Classic leather Oxford shoe for formal occasions.",
      category: "Footwear",
      image: "/images/placeholder.jpg",
      rentalUnit: "day",
      price: 15,
      securityDeposit: 60,
      inStock: 10,
      categoryId: catFootwear.id,
    },
  });

  const oxV1 = await prisma.productVariant.create({ data: { productId: oxford.id, sku: "OXF-UK7-ADIDAS", price: 15, stock: 4 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: oxV1.id, attributeValueId: fUK7.id },
    { variantId: oxV1.id, attributeValueId: fAdidas.id },
  ]});
  const oxV2 = await prisma.productVariant.create({ data: { productId: oxford.id, sku: "OXF-UK11-NIKE", price: 16, stock: 6 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: oxV2.id, attributeValueId: fUK11.id },
    { variantId: oxV2.id, attributeValueId: fNike.id },
  ]});

  // suppress unused variable warnings
  void cXL; void fUK6;

  console.log("ERP Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
