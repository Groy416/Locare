import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

async function main() {
  console.log("Seeding ERP database for Prompts 1 & 2...");

  // Clean existing records in reverse dependency order
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
  // Keep registered user accounts intact
  await prisma.pickupReturnSetting.deleteMany();
  await prisma.lateFeeConfig.deleteMany();

  // Reset SQLite autoincrement sequence counter
  try {
    await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence WHERE name = 'Product';");
  } catch (e) {
    // ignore if table doesn't exist yet
  }

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
  const garimaPasswordHash = await bcrypt.hash("Garima@0401", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@locare.com" },
    update: { passwordHash: adminPasswordHash },
    create: {
      firstName: "System",
      lastName: "Administrator",
      name: "Admin User",
      email: "admin@locare.com",
      passwordHash: adminPasswordHash,
      role: "admin",
    },
  });

  const vendor = await prisma.user.upsert({
    where: { email: "vendor@locare.com" },
    update: { passwordHash: vendorPasswordHash },
    create: {
      firstName: "Mark",
      lastName: "Wood",
      name: "TechRentals Vendor",
      email: "vendor@locare.com",
      passwordHash: vendorPasswordHash,
      role: "vendor",
      companyName: "TechRentals Inc.",
      productCategory: "Electronics",
      gstNo: "27AABCU9603R1ZN",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@locare.com" },
    update: { passwordHash: customerPasswordHash },
    create: {
      firstName: "Sarah",
      lastName: "Chen",
      name: "Sarah Chen",
      email: "customer@locare.com",
      passwordHash: customerPasswordHash,
      role: "customer",
    },
  });

  await prisma.user.upsert({
    where: { email: "garimaa.roy0401@gmail.com" },
    update: { passwordHash: garimaPasswordHash },
    create: {
      firstName: "Garima",
      lastName: "Roy",
      name: "Garima Roy",
      email: "garimaa.roy0401@gmail.com",
      passwordHash: garimaPasswordHash,
      role: "customer",
    },
  });

  // 3. Seed All 4 Categories
  const catClothing = await prisma.category.create({ data: { name: "Clothing" } });
  const catFootwear = await prisma.category.create({ data: { name: "Footwear" } });
  const catElectronics = await prisma.category.create({ data: { name: "Electronics" } });
  const catFurniture = await prisma.category.create({ data: { name: "Furniture" } });

  // 4. Seed Category Attributes & Values
  // ── Clothing Attributes
  const attrCSize = await prisma.attribute.create({ data: { name: "Size", categoryId: catClothing.id } });
  const attrCColor = await prisma.attribute.create({ data: { name: "Color", categoryId: catClothing.id } });
  const attrCBrand = await prisma.attribute.create({ data: { name: "Brand", categoryId: catClothing.id } });

  const [cS, cM, cL, cXL] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrCSize.id, value: "S" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCSize.id, value: "M" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCSize.id, value: "L" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCSize.id, value: "XL" } }),
  ]);
  const [cRed, cBlue, cBlack, cWhite, cGreen, cYellow] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "Red" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "Blue" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "Black" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "White" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "Green" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "Yellow" } }),
  ]);
  const [cMango, cZara, cHM, cLevis] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrCBrand.id, value: "Mango" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCBrand.id, value: "Zara" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCBrand.id, value: "H&M" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCBrand.id, value: "Levis" } }),
  ]);

  // ── Footwear Attributes
  const attrFSize = await prisma.attribute.create({ data: { name: "Size", categoryId: catFootwear.id } });
  const attrFColor = await prisma.attribute.create({ data: { name: "Color", categoryId: catFootwear.id } });
  const attrFBrand = await prisma.attribute.create({ data: { name: "Brand", categoryId: catFootwear.id } });

  const [fUK7, fUK8, fUK9, fUK10] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id, value: "UK7" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id, value: "UK8" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id, value: "UK9" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id, value: "UK10" } }),
  ]);
  const [fBlack, fWhite, fBrown] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrFColor.id, value: "Black" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFColor.id, value: "White" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFColor.id, value: "Brown" } }),
  ]);
  const [fNike, fAdidas, fPuma, fReebok] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrFBrand.id, value: "Nike" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFBrand.id, value: "Adidas" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFBrand.id, value: "Puma" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFBrand.id, value: "Reebok" } }),
  ]);

  // ── Electronics Attributes
  const attrESize = await prisma.attribute.create({ data: { name: "Size", categoryId: catElectronics.id } });
  const attrEColor = await prisma.attribute.create({ data: { name: "Color", categoryId: catElectronics.id } });
  const attrEBrand = await prisma.attribute.create({ data: { name: "Brand", categoryId: catElectronics.id } });

  const [eCompact, eStandard, ePro] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrESize.id, value: "Compact" } }),
    prisma.attributeValue.create({ data: { attributeId: attrESize.id, value: "Standard" } }),
    prisma.attributeValue.create({ data: { attributeId: attrESize.id, value: "Pro" } }),
  ]);
  const [eBlack, eSilver, eSpaceGray] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrEColor.id, value: "Black" } }),
    prisma.attributeValue.create({ data: { attributeId: attrEColor.id, value: "Silver" } }),
    prisma.attributeValue.create({ data: { attributeId: attrEColor.id, value: "Space Gray" } }),
  ]);
  const [eSony, eJBL, eBoat, eDJI] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrEBrand.id, value: "Sony" } }),
    prisma.attributeValue.create({ data: { attributeId: attrEBrand.id, value: "JBL" } }),
    prisma.attributeValue.create({ data: { attributeId: attrEBrand.id, value: "Boat" } }),
    prisma.attributeValue.create({ data: { attributeId: attrEBrand.id, value: "DJI" } }),
  ]);

  // ── Furniture Attributes
  const attrFurnSize = await prisma.attribute.create({ data: { name: "Size", categoryId: catFurniture.id } });
  const attrFurnColor = await prisma.attribute.create({ data: { name: "Color", categoryId: catFurniture.id } });
  const attrFurnBrand = await prisma.attribute.create({ data: { name: "Brand", categoryId: catFurniture.id } });

  await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrFurnSize.id, value: "Single" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFurnSize.id, value: "Double" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFurnSize.id, value: "King" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFurnSize.id, value: "3-Seater" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFurnColor.id, value: "Brown" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFurnColor.id, value: "Beige" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFurnColor.id, value: "Walnut" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFurnBrand.id, value: "N/A" } }),
  ]);

  // 5. Seed 5 Initial Products (IDs 1 to 5 for auto-increment sequence demo)
  const p1 = await prisma.product.create({
    data: {
      id: 1,
      name: "Pressure Washer Pro 3000",
      description: "Industrial-grade pressure washer, 3000 PSI.",
      category: "Electronics",
      image: "/images/pressure-washer.jpg",
      rentalUnit: "day",
      price: 75,
      securityDeposit: 200,
      inStock: 4,
      vendorId: vendor.id,
      categoryId: catElectronics.id,
    },
  });

  const p2 = await prisma.product.create({
    data: {
      id: 2,
      name: "Excavator Mini 1.5T",
      description: "Compact mini excavator ideal for landscaping.",
      category: "Electronics",
      image: "/images/excavator.jpg",
      rentalUnit: "day",
      price: 350,
      securityDeposit: 1500,
      inStock: 2,
      categoryId: catElectronics.id,
    },
  });

  const p3 = await prisma.product.create({
    data: {
      id: 3,
      name: "Formal Dress Shirt",
      description: "Premium cotton formal shirt by Zara.",
      category: "Clothing",
      image: "/images/placeholder.jpg",
      rentalUnit: "day",
      price: 15,
      securityDeposit: 30,
      inStock: 20,
      categoryId: catClothing.id,
    },
  });

  const p4 = await prisma.product.create({
    data: {
      id: 4,
      name: "Casual Cotton Tee",
      description: "Everyday cotton t-shirt by Levis.",
      category: "Clothing",
      image: "/images/placeholder.jpg",
      rentalUnit: "day",
      price: 10,
      securityDeposit: 15,
      inStock: 30,
      categoryId: catClothing.id,
    },
  });

  const p5 = await prisma.product.create({
    data: {
      id: 5,
      name: "Running Shoe Pro",
      description: "Lightweight performance running shoe by Nike.",
      category: "Footwear",
      image: "/images/placeholder.jpg",
      rentalUnit: "day",
      price: 25,
      securityDeposit: 50,
      inStock: 15,
      categoryId: catFootwear.id,
    },
  });

  // 6. Seed Product Variants
  // P3 Variants (Formal Dress Shirt - Zara / Red, Blue)
  const vP3_1 = await prisma.productVariant.create({ data: { productId: p3.id, sku: "SHIRT-M-RED", price: 15, stock: 10 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: vP3_1.id, attributeValueId: cM.id },
    { variantId: vP3_1.id, attributeValueId: cRed.id },
    { variantId: vP3_1.id, attributeValueId: cZara.id },
  ]});

  const vP3_2 = await prisma.productVariant.create({ data: { productId: p3.id, sku: "SHIRT-L-BLUE", price: 15, stock: 10 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: vP3_2.id, attributeValueId: cL.id },
    { variantId: vP3_2.id, attributeValueId: cBlue.id },
    { variantId: vP3_2.id, attributeValueId: cMango.id },
  ]});

  // P4 Variants (Casual Cotton Tee - Levis / Black, Green)
  const vP4_1 = await prisma.productVariant.create({ data: { productId: p4.id, sku: "TEE-M-BLACK", price: 10, stock: 15 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: vP4_1.id, attributeValueId: cM.id },
    { variantId: vP4_1.id, attributeValueId: cBlack.id },
    { variantId: vP4_1.id, attributeValueId: cLevis.id },
  ]});

  const vP4_2 = await prisma.productVariant.create({ data: { productId: p4.id, sku: "TEE-L-GREEN", price: 10, stock: 15 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: vP4_2.id, attributeValueId: cL.id },
    { variantId: vP4_2.id, attributeValueId: cGreen.id },
    { variantId: vP4_2.id, attributeValueId: cHM.id },
  ]});

  // P5 Variants (Running Shoe Pro - Nike / White, Black)
  const vP5_1 = await prisma.productVariant.create({ data: { productId: p5.id, sku: "SHOE-UK8-WHITE", price: 25, stock: 8 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: vP5_1.id, attributeValueId: fUK8.id },
    { variantId: vP5_1.id, attributeValueId: fWhite.id },
    { variantId: vP5_1.id, attributeValueId: fNike.id },
  ]});

  const vP5_2 = await prisma.productVariant.create({ data: { productId: p5.id, sku: "SHOE-UK9-BLACK", price: 25, stock: 7 } });
  await prisma.productVariantAttributeValue.createMany({ data: [
    { variantId: vP5_2.id, attributeValueId: fUK9.id },
    { variantId: vP5_2.id, attributeValueId: fBlack.id },
    { variantId: vP5_2.id, attributeValueId: fAdidas.id },
  ]});

  // 7. Seed Rental Orders (Products 1, 2, 3, 5 are rented; Product 4 is UNRENTED!)
  const order1 = await prisma.rentalOrder.create({
    data: {
      orderNumber: "SO00001",
      customerId: customer.id,
      customerName: "Sarah Chen",
      rentalStart: daysFromNow(-4),
      rentalEnd: daysFromNow(3),
      status: "CONFIRMED",
      invoiceStatus: "INVOICED",
      untaxedAmount: 525,
      taxAmount: 52.5,
      totalAmount: 577.5,
      depositAmount: 200,
    },
  });
  await prisma.orderLine.create({
    data: { rentalOrderId: order1.id, productId: p1.id, quantity: 1, unitPrice: 75, taxPercent: 10, amount: 525 },
  });

  const order2 = await prisma.rentalOrder.create({
    data: {
      orderNumber: "SO00002",
      customerId: customer.id,
      customerName: "Marcus Johnson",
      rentalStart: daysFromNow(-2),
      rentalEnd: daysFromNow(0),
      status: "PICKED_UP",
      invoiceStatus: "WAITING_TO_INVOICE",
      untaxedAmount: 250,
      taxAmount: 25,
      totalAmount: 275,
      depositAmount: 50,
    },
  });
  await prisma.orderLine.create({
    data: { rentalOrderId: order2.id, productId: p5.id, quantity: 1, unitPrice: 25, taxPercent: 10, amount: 250 },
  });

  const order3 = await prisma.rentalOrder.create({
    data: {
      orderNumber: "SO00003",
      customerId: customer.id,
      customerName: "Priya Patel",
      rentalStart: daysFromNow(-10),
      rentalEnd: daysFromNow(-3),
      status: "OVERDUE",
      invoiceStatus: "WAITING_TO_INVOICE",
      untaxedAmount: 2450,
      taxAmount: 245,
      totalAmount: 2695,
      depositAmount: 1500,
    },
  });
  await prisma.orderLine.create({
    data: { rentalOrderId: order3.id, productId: p2.id, quantity: 1, unitPrice: 350, taxPercent: 10, amount: 2450 },
  });

  console.log("ERP Seeding for Prompts 1 & 2 completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// ERP Database seed file verified

