import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

async function main() {
  console.log("Seeding ERP database — 350 products...");

  // ── Clean in dependency order ──────────────────────────────────────────────
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
  await prisma.pickupReturnSetting.deleteMany();
  await prisma.lateFeeConfig.deleteMany();

  try {
    await prisma.$executeRawUnsafe("DELETE FROM sqlite_sequence WHERE name = 'Product';");
  } catch { /* ignore */ }

  // ── Settings ───────────────────────────────────────────────────────────────
  await prisma.pickupReturnSetting.create({
    data: { id: "default", dailyRate: 15, hourlyRate: 2.5, gracePeriodDays: 1, enableVendors: true, enableAttributes: true, enablePriceLists: true },
  });
  await prisma.lateFeeConfig.create({ data: { id: "default", dailyRate: 15, gracePeriodDays: 1 } });

  // ── Users ──────────────────────────────────────────────────────────────────
  const adminHash    = await bcrypt.hash("admin123",   10);
  const vendorHash   = await bcrypt.hash("vendor123",  10);
  const customerHash = await bcrypt.hash("customer123",10);
  const garimaHash   = await bcrypt.hash("Garima@0401",10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@locare.com" },
    update: { passwordHash: adminHash },
    create: { firstName: "System", lastName: "Administrator", name: "Admin User", email: "admin@locare.com", passwordHash: adminHash, role: "admin" },
  });

  const vendor = await prisma.user.upsert({
    where: { email: "vendor@locare.com" },
    update: { passwordHash: vendorHash },
    create: { firstName: "Mark", lastName: "Wood", name: "TechRentals Vendor", email: "vendor@locare.com", passwordHash: vendorHash, role: "vendor", companyName: "TechRentals Inc.", productCategory: "Electronics", gstNo: "27AABCU9603R1ZN" },
  });

  const customer = await prisma.user.upsert({
    where: { email: "customer@locare.com" },
    update: { passwordHash: customerHash },
    create: { firstName: "Sarah", lastName: "Chen", name: "Sarah Chen", email: "customer@locare.com", passwordHash: customerHash, role: "customer" },
  });

  await prisma.user.upsert({
    where: { email: "garimaa.roy0401@gmail.com" },
    update: { passwordHash: garimaHash },
    create: { firstName: "Garima", lastName: "Roy", name: "Garima Roy", email: "garimaa.roy0401@gmail.com", passwordHash: garimaHash, role: "customer" },
  });

  void admin;

  // ── Categories ─────────────────────────────────────────────────────────────
  const catClothing    = await prisma.category.create({ data: { name: "Clothing" } });
  const catFootwear    = await prisma.category.create({ data: { name: "Footwear" } });
  const catElectronics = await prisma.category.create({ data: { name: "Electronics" } });
  const catFurniture   = await prisma.category.create({ data: { name: "Furniture" } });

  // ── Clothing Attributes ────────────────────────────────────────────────────
  const attrCSize  = await prisma.attribute.create({ data: { name: "Size",  categoryId: catClothing.id } });
  const attrCColor = await prisma.attribute.create({ data: { name: "Color", categoryId: catClothing.id } });
  const attrCBrand = await prisma.attribute.create({ data: { name: "Brand", categoryId: catClothing.id } });

  const [cS, cM, cL, cXL] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrCSize.id,  value: "S"   } }),
    prisma.attributeValue.create({ data: { attributeId: attrCSize.id,  value: "M"   } }),
    prisma.attributeValue.create({ data: { attributeId: attrCSize.id,  value: "L"   } }),
    prisma.attributeValue.create({ data: { attributeId: attrCSize.id,  value: "XL"  } }),
  ]);
  const [cRed, cBlue, cBlack, cWhite, cGreen, cYellow] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "Red"    } }),
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "Blue"   } }),
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "Black"  } }),
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "White"  } }),
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "Green"  } }),
    prisma.attributeValue.create({ data: { attributeId: attrCColor.id, value: "Yellow" } }),
  ]);
  const [cMango, cZara, cHM, cLevis] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrCBrand.id, value: "Mango" } }),
    prisma.attributeValue.create({ data: { attributeId: attrCBrand.id, value: "Zara"  } }),
    prisma.attributeValue.create({ data: { attributeId: attrCBrand.id, value: "H&M"   } }),
    prisma.attributeValue.create({ data: { attributeId: attrCBrand.id, value: "Levis" } }),
  ]);

  const clothingSizes   = [cS, cM, cL, cXL];
  const clothingColors  = [cRed, cBlue, cBlack, cWhite, cGreen, cYellow];
  const clothingBrands  = [cMango, cZara, cHM, cLevis];

  // ── Footwear Attributes ────────────────────────────────────────────────────
  const attrFSize  = await prisma.attribute.create({ data: { name: "Size",  categoryId: catFootwear.id } });
  const attrFColor = await prisma.attribute.create({ data: { name: "Color", categoryId: catFootwear.id } });
  const attrFBrand = await prisma.attribute.create({ data: { name: "Brand", categoryId: catFootwear.id } });

  const [fUK7, fUK8, fUK9, fUK10] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id,  value: "UK7"  } }),
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id,  value: "UK8"  } }),
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id,  value: "UK9"  } }),
    prisma.attributeValue.create({ data: { attributeId: attrFSize.id,  value: "UK10" } }),
  ]);
  const [fBlack, fWhite, fBrown] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrFColor.id, value: "Black" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFColor.id, value: "White" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFColor.id, value: "Brown" } }),
  ]);
  const [fNike, fAdidas, fPuma, fReebok] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrFBrand.id, value: "Nike"   } }),
    prisma.attributeValue.create({ data: { attributeId: attrFBrand.id, value: "Adidas" } }),
    prisma.attributeValue.create({ data: { attributeId: attrFBrand.id, value: "Puma"   } }),
    prisma.attributeValue.create({ data: { attributeId: attrFBrand.id, value: "Reebok" } }),
  ]);

  const footwearSizes   = [fUK7, fUK8, fUK9, fUK10];
  const footwearColors  = [fBlack, fWhite, fBrown];
  const footwearBrands  = [fNike, fAdidas, fPuma, fReebok];

  // ── Electronics Attributes ─────────────────────────────────────────────────
  const attrESize  = await prisma.attribute.create({ data: { name: "Size",  categoryId: catElectronics.id } });
  const attrEColor = await prisma.attribute.create({ data: { name: "Color", categoryId: catElectronics.id } });
  const attrEBrand = await prisma.attribute.create({ data: { name: "Brand", categoryId: catElectronics.id } });

  const [eCompact, eStandard, ePro] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrESize.id,  value: "Compact"  } }),
    prisma.attributeValue.create({ data: { attributeId: attrESize.id,  value: "Standard" } }),
    prisma.attributeValue.create({ data: { attributeId: attrESize.id,  value: "Pro"      } }),
  ]);
  const [eBlack, eSilver, eSpaceGray] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrEColor.id, value: "Black"      } }),
    prisma.attributeValue.create({ data: { attributeId: attrEColor.id, value: "Silver"     } }),
    prisma.attributeValue.create({ data: { attributeId: attrEColor.id, value: "Space Gray" } }),
  ]);
  const [eSony, eJBL, eBoat, eDJI] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrEBrand.id, value: "Sony" } }),
    prisma.attributeValue.create({ data: { attributeId: attrEBrand.id, value: "JBL"  } }),
    prisma.attributeValue.create({ data: { attributeId: attrEBrand.id, value: "Boat" } }),
    prisma.attributeValue.create({ data: { attributeId: attrEBrand.id, value: "DJI"  } }),
  ]);

  const electronicsSizes   = [eCompact, eStandard, ePro];
  const electronicsColors  = [eBlack, eSilver, eSpaceGray];
  const electronicsBrands  = [eSony, eJBL, eBoat, eDJI];

  // ── Furniture Attributes ───────────────────────────────────────────────────
  const attrFurnSize  = await prisma.attribute.create({ data: { name: "Size",  categoryId: catFurniture.id } });
  const attrFurnColor = await prisma.attribute.create({ data: { name: "Color", categoryId: catFurniture.id } });
  const attrFurnBrand = await prisma.attribute.create({ data: { name: "Brand", categoryId: catFurniture.id } });

  const [furnSingle, furnDouble, furnKing, furnSeater] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrFurnSize.id,  value: "Single"   } }),
    prisma.attributeValue.create({ data: { attributeId: attrFurnSize.id,  value: "Double"   } }),
    prisma.attributeValue.create({ data: { attributeId: attrFurnSize.id,  value: "King"     } }),
    prisma.attributeValue.create({ data: { attributeId: attrFurnSize.id,  value: "3-Seater" } }),
  ]);
  const [furnBrown, furnBeige, furnWalnut] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrFurnColor.id, value: "Brown"  } }),
    prisma.attributeValue.create({ data: { attributeId: attrFurnColor.id, value: "Beige"  } }),
    prisma.attributeValue.create({ data: { attributeId: attrFurnColor.id, value: "Walnut" } }),
  ]);
  const [furnNA] = await Promise.all([
    prisma.attributeValue.create({ data: { attributeId: attrFurnBrand.id, value: "N/A" } }),
  ]);

  const furnitureSizes   = [furnSingle, furnDouble, furnKing, furnSeater];
  const furnitureColors  = [furnBrown, furnBeige, furnWalnut];
  const furnitureBrands  = [furnNA];

  // ── Product Data Templates ──────────────────────────────────────────────────

  const clothingTemplates = [
    { name: "Classic Oxford Shirt", desc: "Crisp cotton Oxford shirt for formal occasions.", brand: "Zara" },
    { name: "Slim Fit Chinos", desc: "Modern stretch chinos with tapered fit.", brand: "Levis" },
    { name: "Casual Linen Blazer", desc: "Lightweight linen blazer for summer events.", brand: "Mango" },
    { name: "Graphic Print Tee", desc: "100% cotton graphic tee with bold print.", brand: "H&M" },
    { name: "Floral Midi Dress", desc: "Elegant floral midi dress for daytime events.", brand: "Zara" },
    { name: "Jogger Sweatpants", desc: "Comfortable joggers with elastic waistband.", brand: "H&M" },
    { name: "Denim Jacket", desc: "Classic washed denim jacket, versatile style.", brand: "Levis" },
    { name: "Striped Polo Shirt", desc: "Cotton-blend polo shirt with chest logo.", brand: "Mango" },
    { name: "Pleated Trousers", desc: "Formal pleated trousers for office and events.", brand: "Zara" },
    { name: "Oversized Hoodie", desc: "Cozy fleece hoodie in relaxed fit.", brand: "H&M" },
    { name: "Wrap Midi Skirt", desc: "Flowy wrap skirt in solid and printed options.", brand: "Mango" },
    { name: "Tailored Suit Jacket", desc: "Structured suit jacket for formal occasions.", brand: "Zara" },
    { name: "Cropped Denim Jacket", desc: "Trendy cropped denim jacket for street style.", brand: "Levis" },
    { name: "Satin Blouse", desc: "Silky satin blouse with button detail.", brand: "Mango" },
    { name: "Cargo Shorts", desc: "Utility cargo shorts with multiple pockets.", brand: "H&M" },
    { name: "Knit Sweater", desc: "Warm knit sweater in ribbed texture.", brand: "Zara" },
    { name: "Maxi Dress", desc: "Flowy maxi dress ideal for weddings and events.", brand: "Mango" },
    { name: "Track Jacket", desc: "Zip-up track jacket with contrast paneling.", brand: "H&M" },
    { name: "Slim Fit Jeans", desc: "Dark wash slim fit jeans, versatile and stylish.", brand: "Levis" },
    { name: "Trench Coat", desc: "Classic double-breasted trench coat in beige.", brand: "Zara" },
    { name: "Printed Kurta", desc: "Traditional kurta with block print pattern.", brand: "Mango" },
    { name: "Shacket Flannel", desc: "Plaid flannel shirt-jacket for layered looks.", brand: "H&M" },
    { name: "Velvet Blazer", desc: "Luxurious velvet blazer for evening events.", brand: "Zara" },
    { name: "Wide Leg Trousers", desc: "Flowy wide-leg trousers with high waist.", brand: "Levis" },
    { name: "Linen Trousers", desc: "Breathable linen trousers perfect for summer.", brand: "Mango" },
    { name: "Roll Neck Sweater", desc: "Fine knit roll neck sweater in neutral tones.", brand: "H&M" },
    { name: "A-Line Skirt", desc: "Classic A-line skirt hitting at the knee.", brand: "Zara" },
    { name: "Utility Vest", desc: "Multi-pocket utility vest in solid colors.", brand: "Levis" },
    { name: "Sequin Mini Dress", desc: "Party-ready sequin mini dress for nights out.", brand: "Mango" },
    { name: "Puffer Jacket", desc: "Lightweight puffer jacket with down filling.", brand: "H&M" },
  ];

  const footwearTemplates = [
    { name: "Classic Running Shoe", desc: "Cushioned running shoe with breathable mesh upper.", brand: "Nike" },
    { name: "Low Top Sneaker", desc: "Minimalist canvas low-top sneaker.", brand: "Adidas" },
    { name: "Leather Oxford", desc: "Classic leather Oxford shoe for formal settings.", brand: "Reebok" },
    { name: "High Top Basketball Shoe", desc: "Ankle-support high-top for court sports.", brand: "Nike" },
    { name: "Trail Running Shoe", desc: "Grippy outsole trail shoe for off-road runs.", brand: "Puma" },
    { name: "Slip-On Loafer", desc: "Casual suede loafer for everyday comfort.", brand: "Adidas" },
    { name: "Chelsea Boot", desc: "Elastic-sided Chelsea boot in leather.", brand: "Reebok" },
    { name: "Sports Sandal", desc: "Adjustable strap sports sandal with arch support.", brand: "Nike" },
    { name: "Derby Shoe", desc: "Open-laced Derby shoe in smooth leather.", brand: "Puma" },
    { name: "Platform Sneaker", desc: "Platform-sole chunky sneaker for streetwear.", brand: "Adidas" },
    { name: "Hiking Boot", desc: "Waterproof hiking boot with lug sole.", brand: "Nike" },
    { name: "Ballet Flat", desc: "Lightweight leather ballet flat with bow detail.", brand: "Reebok" },
    { name: "Ankle Boot", desc: "Block-heel ankle boot in smooth suede.", brand: "Puma" },
    { name: "Mule Sandal", desc: "Backless mule with cushioned footbed.", brand: "Adidas" },
    { name: "Flip Flop Thong", desc: "Quick-dry flip flops for beach and pool.", brand: "Nike" },
    { name: "Brogue Shoe", desc: "Perforated brogue detail leather shoe.", brand: "Reebok" },
    { name: "Espadrille", desc: "Woven espadrille with canvas upper.", brand: "Puma" },
    { name: "Wedge Sandal", desc: "Wedge-heel strappy sandal for summer events.", brand: "Adidas" },
    { name: "Work Boot", desc: "Steel-toe work boot with oil-resistant sole.", brand: "Nike" },
    { name: "Slide Sandal", desc: "Minimal slide sandal with adjustable strap.", brand: "Adidas" },
    { name: "Desert Boot", desc: "Suede crepe-sole desert boot.", brand: "Puma" },
    { name: "Cycling Shoe", desc: "Stiff-sole cycling shoe compatible with cleats.", brand: "Nike" },
    { name: "Football Cleat", desc: "Firm-ground football cleat with stud pattern.", brand: "Adidas" },
    { name: "Court Shoe", desc: "Non-marking court shoe for indoor sports.", brand: "Reebok" },
    { name: "Snow Boot", desc: "Insulated snow boot rated to -20°C.", brand: "Nike" },
    { name: "Skate Shoe", desc: "Reinforced canvas skate shoe with ollie zone.", brand: "Puma" },
    { name: "Driving Moccasin", desc: "Supple leather driving moccasin with rubber nubs.", brand: "Adidas" },
    { name: "Peep-Toe Heel", desc: "Block-heel peep-toe pump for formal wear.", brand: "Reebok" },
    { name: "Pool Slide", desc: "Quick-drain pool slide with cushioned sole.", brand: "Puma" },
    { name: "Barefoot Runner", desc: "Zero-drop minimalist barefoot running shoe.", brand: "Nike" },
  ];

  const electronicsTemplates = [
    { name: "4K Laser Projector", desc: "5000-lumen 4K laser projector for events.", brand: "Sony" },
    { name: "Wireless PA Speaker", desc: "200W rechargeable PA speaker with mic.", brand: "JBL" },
    { name: "DSLR Camera Kit", desc: "Full-frame DSLR camera with 24-70mm lens.", brand: "Sony" },
    { name: "DJI Drone Pro", desc: "4K aerial drone with obstacle avoidance.", brand: "DJI" },
    { name: "Bluetooth Soundbar", desc: "120W soundbar with Dolby Atmos support.", brand: "JBL" },
    { name: "LED Ring Light 18in", desc: "18-inch bi-color LED ring light with stand.", brand: "Boat" },
    { name: "Mirrorless Camera", desc: "Compact mirrorless with IBIS and 4K video.", brand: "Sony" },
    { name: "Wireless Mic System", desc: "Dual-channel UHF wireless microphone system.", brand: "Boat" },
    { name: "Laptop Rental i7", desc: "Intel Core i7 16GB RAM laptop for short-term use.", brand: "Sony" },
    { name: "Gaming Console Bundle", desc: "Console with 2 controllers and popular titles.", brand: "DJI" },
    { name: "Portable Generator 2kW", desc: "2kW petrol generator for outdoor power.", brand: "JBL" },
    { name: "LED Video Wall Panel", desc: "P3 indoor LED panel, 500×500mm tile.", brand: "Boat" },
    { name: "Studio Flash Kit", desc: "2-head 600Ws studio strobe kit with umbrellas.", brand: "Sony" },
    { name: "Action Camera 4K", desc: "Waterproof 4K action cam with stabilisation.", brand: "DJI" },
    { name: "Gimbal Stabilizer 3-axis", desc: "3-axis motorised gimbal for DSLR cameras.", brand: "DJI" },
    { name: "Portable Wi-Fi Router", desc: "4G LTE pocket router for event connectivity.", brand: "Boat" },
    { name: "Smart TV 55in", desc: "55-inch 4K QLED smart TV for display rental.", brand: "Sony" },
    { name: "Conference Webcam HD", desc: "4K wide-angle webcam for video conferencing.", brand: "Boat" },
    { name: "Subwoofer 18in", desc: "Passive 18-inch subwoofer for event sound.", brand: "JBL" },
    { name: "Laser Distance Meter", desc: "Digital laser tape measure up to 100m range.", brand: "Boat" },
    { name: "Thermal Camera", desc: "Handheld thermal imaging camera for inspection.", brand: "DJI" },
    { name: "Noise-Cancelling Headphones", desc: "Over-ear ANC headphones for studio use.", brand: "Sony" },
    { name: "Portable Monitor 15in", desc: "1080p IPS USB-C portable display.", brand: "JBL" },
    { name: "Electric Pressure Washer", desc: "1600W electric pressure washer for surfaces.", brand: "Boat" },
    { name: "VR Headset", desc: "Standalone VR headset for demos and events.", brand: "Sony" },
    { name: "Compact PA System", desc: "All-in-one 300W portable PA with mixer.", brand: "JBL" },
    { name: "360° Camera", desc: "5.7K 360-degree spherical action camera.", brand: "DJI" },
    { name: "LED Spotlight 150W", desc: "150W LED moving head spotlight for stage.", brand: "Boat" },
    { name: "Professional Mixer 12ch", desc: "12-channel analog mixing console.", brand: "JBL" },
    { name: "Tablet Rental 11in", desc: "11-inch iPad Pro for short-term event use.", brand: "Sony" },
  ];

  const furnitureTemplates = [
    { name: "Wooden Dining Table", desc: "Solid oak dining table seating up to 8.", brand: "N/A" },
    { name: "Upholstered Armchair", desc: "Button-tufted armchair with wooden legs.", brand: "N/A" },
    { name: "Modular Sofa", desc: "L-shaped modular sofa with reversible chaise.", brand: "N/A" },
    { name: "Standing Desk Electric", desc: "Motorised sit-stand desk with memory presets.", brand: "N/A" },
    { name: "Ergonomic Office Chair", desc: "Mesh-back ergonomic chair with lumbar support.", brand: "N/A" },
    { name: "Folding Event Table", desc: "6ft banquet folding table for events.", brand: "N/A" },
    { name: "Plastic Stackable Chair", desc: "Lightweight stackable chair for large events.", brand: "N/A" },
    { name: "King Size Bed Frame", desc: "Solid pine king bed frame with slat base.", brand: "N/A" },
    { name: "Wardrobe 3-Door", desc: "Sliding-door wardrobe with internal drawers.", brand: "N/A" },
    { name: "Bookshelf 5-Tier", desc: "Floating 5-tier bookshelf in walnut finish.", brand: "N/A" },
    { name: "Coffee Table Round", desc: "Round glass-top coffee table with chrome base.", brand: "N/A" },
    { name: "Bar Stool Set of 4", desc: "Padded counter-height bar stools with footrest.", brand: "N/A" },
    { name: "Outdoor Picnic Table", desc: "Pressure-treated timber picnic table and benches.", brand: "N/A" },
    { name: "Reception Desk", desc: "L-shaped reception desk with cable management.", brand: "N/A" },
    { name: "Lounge Pouffe Ottoman", desc: "Oversized round velvet pouffe for seating.", brand: "N/A" },
    { name: "TV Console Unit", desc: "Low-profile TV stand with floating shelves.", brand: "N/A" },
    { name: "Bedside Table Pair", desc: "Set of 2 nightstands with single drawer.", brand: "N/A" },
    { name: "4-Drawer Dresser", desc: "Mid-century modern dresser with brass handles.", brand: "N/A" },
    { name: "Display Cabinet", desc: "Glass-front display cabinet with lighting.", brand: "N/A" },
    { name: "Conference Table 10-Seat", desc: "Executive conference table for boardrooms.", brand: "N/A" },
    { name: "Hammock with Stand", desc: "Cotton hammock with portable steel stand.", brand: "N/A" },
    { name: "Accent Side Table", desc: "Marble-top accent table with gold legs.", brand: "N/A" },
    { name: "Gaming Desk Setup", desc: "L-shaped gaming desk with monitor stand.", brand: "N/A" },
    { name: "Chiavari Event Chair", desc: "Classic gold Chiavari chair for weddings.", brand: "N/A" },
    { name: "Outdoor Sofa Set", desc: "All-weather rattan 4-piece sofa set.", brand: "N/A" },
    { name: "Bunk Bed Frame", desc: "Twin-over-full bunk bed with safety rail.", brand: "N/A" },
    { name: "Folding Screen Divider", desc: "6-panel room divider in bamboo.", brand: "N/A" },
    { name: "Outdoor Dining Set 6", desc: "6-seat outdoor dining set with umbrella hole.", brand: "N/A" },
    { name: "Bean Bag Chair XL", desc: "Oversized waterproof bean bag for events.", brand: "N/A" },
    { name: "Chaise Longue", desc: "Velvet chaise longue for reading or lounging.", brand: "N/A" },
  ];

  // Category meta for batch building
  type CatMeta = {
    catName: string;
    catId: string;
    templates: { name: string; desc: string; brand: string }[];
    sizes: { id: string }[];
    colors: { id: string }[];
    brands: { id: string; value?: string }[];
    units: string[];
    priceMin: number;
    priceMax: number;
    depositMin: number;
    depositMax: number;
    stockMin: number;
    stockMax: number;
    image: string;
  };

  const catMeta: CatMeta[] = [
    {
      catName: "Clothing", catId: catClothing.id,
      templates: clothingTemplates,
      sizes: clothingSizes, colors: clothingColors, brands: clothingBrands,
      units: ["day"], priceMin: 8, priceMax: 60, depositMin: 20, depositMax: 150, stockMin: 5, stockMax: 40,
      image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
    },
    {
      catName: "Footwear", catId: catFootwear.id,
      templates: footwearTemplates,
      sizes: footwearSizes, colors: footwearColors, brands: footwearBrands,
      units: ["day"], priceMin: 12, priceMax: 80, depositMin: 30, depositMax: 200, stockMin: 3, stockMax: 20,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    },
    {
      catName: "Electronics", catId: catElectronics.id,
      templates: electronicsTemplates,
      sizes: electronicsSizes, colors: electronicsColors, brands: electronicsBrands,
      units: ["day", "week"], priceMin: 50, priceMax: 500, depositMin: 100, depositMax: 2000, stockMin: 1, stockMax: 10,
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
    },
    {
      catName: "Furniture", catId: catFurniture.id,
      templates: furnitureTemplates,
      sizes: furnitureSizes, colors: furnitureColors, brands: furnitureBrands,
      units: ["day", "week"], priceMin: 20, priceMax: 300, depositMin: 50, depositMax: 800, stockMin: 2, stockMax: 15,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
    },
  ];

  // Helper to build one product + 1-3 variants for a category
  async function createProductWithVariants(
    meta: CatMeta,
    index: number,
    vendorId: string,
  ): Promise<number> {
    const tmpl = meta.templates[index % meta.templates.length];
    const suffix = index < meta.templates.length ? "" : ` ${Math.floor(index / meta.templates.length) + 1}`;
    const price = Math.round(
      (meta.priceMin + Math.random() * (meta.priceMax - meta.priceMin)) * 2
    ) / 2;
    const deposit = Math.round(meta.depositMin + Math.random() * (meta.depositMax - meta.depositMin));
    const stock = meta.stockMin + Math.floor(Math.random() * (meta.stockMax - meta.stockMin));
    const unit = pick(meta.units);
    // Stable high-quality Unsplash pools per category to prevent 429 rate limiting on the client
    const categoryPools: Record<string, string[]> = {
      "Clothing": [
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",
        "https://images.unsplash.com/photo-1596755094514-f87e32f85e23?w=800&q=80",
        "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80",
        "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"
      ],
      "Footwear": [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80"
      ],
      "Electronics": [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80",
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
        "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?w=800&q=80",
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80"
      ],
      "Furniture": [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80",
        "https://images.unsplash.com/photo-1505691938895-1758d7def515?w=800&q=80",
        "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&q=80"
      ]
    };
    
    const pool = categoryPools[meta.catName] || [meta.image];
    const dynamicImageUrl = pool[index % pool.length];

    const product = await prisma.product.create({
      data: {
        name: tmpl.name + suffix,
        description: tmpl.desc,
        category: meta.catName,
        brand: tmpl.brand,
        image: dynamicImageUrl,
        imageUrl: dynamicImageUrl,
        rentalUnit: unit,
        price,
        securityDeposit: deposit,
        inStock: stock,
        categoryId: meta.catId,
        vendorId: Math.random() < 0.4 ? vendorId : null,
      },
    });

    // 1-3 variants using real attribute values
    const numVariants = 1 + Math.floor(Math.random() * 3);
    const sizePool  = pickN(meta.sizes,  numVariants);
    const colorPool = pickN(meta.colors, numVariants);
    const brandAV   = pick(meta.brands);

    for (let v = 0; v < numVariants; v++) {
      const sizeAV  = sizePool[v]  ?? sizePool[0];
      const colorAV = colorPool[v] ?? colorPool[0];
      const variantPrice = Math.round(price * (0.9 + Math.random() * 0.3) * 2) / 2;
      const variantStock = Math.max(1, Math.floor(stock / numVariants));
      const skuParts = [
        meta.catName.slice(0, 3).toUpperCase(),
        product.id,
        v,
      ];

      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: skuParts.join("-"),
          price: variantPrice,
          stock: variantStock,
        },
      });

      // Link size + color + brand attribute values
      const avLinks = [
        { variantId: variant.id, attributeValueId: sizeAV.id },
        { variantId: variant.id, attributeValueId: colorAV.id },
        { variantId: variant.id, attributeValueId: brandAV.id },
      ];
      await prisma.productVariantAttributeValue.createMany({ data: avLinks });
    }

    return product.id;
  }

  // ── 4 Batches of ~87-88 products each = 350 total ─────────────────────────
  // Distribution: Clothing 88, Footwear 88, Electronics 87, Furniture 87 = 350
  const batchDist: [CatMeta, number][] = [
    [catMeta[0], 88], // Clothing
    [catMeta[1], 88], // Footwear
    [catMeta[2], 87], // Electronics
    [catMeta[3], 87], // Furniture
  ];

  const allProductIds: number[] = [];

  for (let batchIdx = 0; batchIdx < batchDist.length; batchIdx++) {
    const [meta, count] = batchDist[batchIdx];
    console.log(`Batch ${batchIdx + 1}/4 — seeding ${count} ${meta.catName} products...`);

    for (let i = 0; i < count; i++) {
      const pid = await createProductWithVariants(meta, i, vendor.id);
      allProductIds.push(pid);
    }

    const created = await prisma.product.count({ where: { category: meta.catName } });
    console.log(`Batch ${batchIdx + 1}/4 done — ${created} ${meta.catName} products in DB.`);
  }

  const totalProducts = await prisma.product.count();
  console.log(`\nTotal products in DB: ${totalProducts}`);

  // ── 3 Sample Rental Orders ─────────────────────────────────────────────────
  const pid1 = allProductIds[0];
  const pid2 = allProductIds[50];
  const pid3 = allProductIds[150];

  const order1 = await prisma.rentalOrder.create({
    data: {
      orderNumber: "SO00001",
      customerId: customer.id,
      customerName: "Sarah Chen",
      rentalStart: daysFromNow(-4),
      rentalEnd: daysFromNow(3),   // active
      status: "CONFIRMED",
      invoiceStatus: "INVOICED",
      untaxedAmount: 525, taxAmount: 52.5, totalAmount: 577.5, depositAmount: 200,
    },
  });
  await prisma.orderLine.create({
    data: { rentalOrderId: order1.id, productId: pid1, quantity: 1, unitPrice: 75, taxPercent: 10, amount: 525 },
  });

  const order2 = await prisma.rentalOrder.create({
    data: {
      orderNumber: "SO00002",
      customerId: customer.id,
      customerName: "Marcus Johnson",
      rentalStart: daysFromNow(-2),
      rentalEnd: daysFromNow(0),   // due today
      status: "PICKED_UP",
      invoiceStatus: "WAITING_TO_INVOICE",
      untaxedAmount: 250, taxAmount: 25, totalAmount: 275, depositAmount: 50,
    },
  });
  await prisma.orderLine.create({
    data: { rentalOrderId: order2.id, productId: pid2, quantity: 1, unitPrice: 25, taxPercent: 10, amount: 250 },
  });

  const order3 = await prisma.rentalOrder.create({
    data: {
      orderNumber: "SO00003",
      customerId: customer.id,
      customerName: "Priya Patel",
      rentalStart: daysFromNow(-10),
      rentalEnd: daysFromNow(-3),  // overdue
      status: "OVERDUE",
      invoiceStatus: "WAITING_TO_INVOICE",
      untaxedAmount: 2450, taxAmount: 245, totalAmount: 2695, depositAmount: 1500,
    },
  });
  await prisma.orderLine.create({
    data: { rentalOrderId: order3.id, productId: pid3, quantity: 1, unitPrice: 350, taxPercent: 10, amount: 2450 },
  });

  console.log(`\nSeeding complete! ${totalProducts} products + 3 rental orders (active/due-today/overdue).`);
}

main()
  .catch((e) => { console.error("Seed error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
