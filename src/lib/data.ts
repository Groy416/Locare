/**
 * In-memory data store for the Rental Management System.
 * No real database — all data lives in memory per the MVP scope.
 * @see /docs/MVP-SCOPE.md
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type RentalUnit = "hour" | "day" | "week" | "month";

export interface ProductVariant {
  id: string;
  name: string;
  options: string[];
}

export interface Product {
  id: string | number;
  name: string;
  description: string;
  category: string;
  brand?: string;
  image: string; // placeholder path
  imageUrl?: string | null;
  rentalUnit: RentalUnit;
  price: number; // per rental unit
  securityDeposit: number; // fixed deposit amount
  inStock: number;
  colorSwatches?: string[]; // hex colors for cards
  sizeVariantNote?: string; // e.g. "36, 42 & 55 inch TV"
  variants?: ProductVariant[];
}

export type RentalStatus = "booked" | "active" | "returned" | "overdue";
export type DepositStatus = "held" | "refunded" | "partially-deducted";
export type DeliveryMethod = "pickup" | "delivery";

export interface Rental {
  id: string | number;
  productId: string | number;
  customerName: string;
  rentalStart: string; // ISO date string
  rentalEnd: string; // ISO date string
  deliveryMethod: DeliveryMethod;
  status: RentalStatus;
  depositAmount: number;
  depositStatus: DepositStatus;
  lateFeeCharged: number;
}

export interface LateFeeConfig {
  dailyRate: number; // $ per day late
  gracePeriodDays: number; // days after due date before fees kick in
}

// ─── Late Fee Configuration ──────────────────────────────────────────────────

export const lateFeeConfig: LateFeeConfig = {
  dailyRate: 15,
  gracePeriodDays: 1,
};

// ─── Products ────────────────────────────────────────────────────────────────

export const products: Product[] = [
  {
    id: "prod-001",
    name: "3-Seater Comfort Sofa",
    description: "Plush fabric 3-seater living room sofa. Available in multiple color options.",
    category: "Furniture",
    brand: "Ashley",
    image: "/images/sofa.jpg",
    rentalUnit: "month",
    price: 45,
    securityDeposit: 150,
    inStock: 5,
    colorSwatches: ["#2563eb", "#f59e0b", "#475569"],
    variants: [
      { id: "color", name: "Color", options: ["Blue", "Master", "Charcoal"] },
    ],
  },
  {
    id: "prod-002",
    name: "Ergonomic Executive Office Desk",
    description: "Solid wood executive office desk with cable management and storage drawers.",
    category: "Furniture",
    brand: "IKEA",
    image: "/images/desk.jpg",
    rentalUnit: "month",
    price: 35,
    securityDeposit: 100,
    inStock: 0, // Out of stock matching wireframe
    colorSwatches: ["#78350f", "#1e293b"],
  },
  {
    id: "prod-003",
    name: "Solid Oak Dining Table Set",
    description: "Premium oak dining table with 4 matching padded chairs.",
    category: "Furniture",
    brand: "Ashley",
    image: "/images/dining.jpg",
    rentalUnit: "month",
    price: 60,
    securityDeposit: 200,
    inStock: 3,
    colorSwatches: ["#78350f"],
  },
  {
    id: "prod-004",
    name: "Smart 4K Ultra HD LED TV",
    description: "Crystal clear 4K Smart TV with HDR10+ and built-in streaming apps.",
    category: "Electronics",
    brand: "Sony",
    image: "/images/tv.jpg",
    rentalUnit: "day",
    price: 25,
    securityDeposit: 300,
    inStock: 4,
    sizeVariantNote: "36, 42 & 55 inch TV",
    colorSwatches: ["#0284c7", "#f59e0b"],
    variants: [
      { id: "size", name: "Screen Size", options: ["36 inch", "42 inch", "55 inch"] },
      { id: "color", name: "Frame Color", options: ["Midnight Black", "Silver Aluminum"] },
    ],
  },
  {
    id: "prod-005",
    name: "Desktop Workstation PC Pro",
    description: "High-performance desktop PC for design, video editing, and office workstation use.",
    category: "Computers",
    brand: "Dell",
    image: "/images/pc.jpg",
    rentalUnit: "day",
    price: 30,
    securityDeposit: 350,
    inStock: 6,
  },
  {
    id: "prod-006",
    name: "Pro Laptop 15.6 inch SSD",
    description: "Ultra-slim 15.6-inch laptop with Intel i7, 16GB RAM, and 512GB SSD.",
    category: "Computers",
    brand: "Dell",
    image: "/images/laptop.jpg",
    rentalUnit: "day",
    price: 20,
    securityDeposit: 250,
    inStock: 8,
  },
  {
    id: "prod-007",
    name: "PlayStation 5 Console Bundle",
    description: "PS5 disc edition console with dual controllers and 2 game titles.",
    category: "Gaming",
    brand: "Sony",
    image: "/images/ps5.jpg",
    rentalUnit: "hour",
    price: 5,
    securityDeposit: 400,
    inStock: 2,
  },
  {
    id: "prod-008",
    name: "King Size Velvet Bed Frame",
    description: "Upholstered king size bed frame with wooden slats and headboard.",
    category: "Furniture",
    brand: "IKEA",
    image: "/images/bed.jpg",
    rentalUnit: "month",
    price: 70,
    securityDeposit: 250,
    inStock: 3,
  },
  {
    id: "prod-009",
    name: "Studio Sound Speakers System",
    description: "High-fidelity studio monitor speakers with Bluetooth and optical input.",
    category: "Audio",
    brand: "Sony",
    image: "/images/speaker.jpg",
    rentalUnit: "day",
    price: 18,
    securityDeposit: 120,
    inStock: 5,
  },
  {
    id: "prod-010",
    name: "4K DSLR Cinema Camera Kit",
    description: "Professional 4K DSLR camera with 24-70mm lens, tripod, and memory cards.",
    category: "Cameras",
    brand: "Canon",
    image: "/images/camera.jpg",
    rentalUnit: "hour",
    price: 8,
    securityDeposit: 500,
    inStock: 3,
  },
];

// ─── Helper: Date relative to today ──────────────────────────────────────────

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

// ─── Seed Rentals ────────────────────────────────────────────────────────────
// Mix of statuses so the admin dashboard has real data immediately.

export const rentals: Rental[] = [
  {
    // Active — due in 3 days
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
  },
  {
    // Active — due today
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
    // Overdue — 3 days past due
    id: "rent-003",
    productId: "prod-002",
    customerName: "Priya Patel",
    rentalStart: daysFromNow(-10),
    rentalEnd: daysFromNow(-3),
    deliveryMethod: "delivery",
    status: "overdue",
    depositAmount: 1500,
    depositStatus: "held",
    lateFeeCharged: 0, // will be calculated on return
  },
  {
    // Booked — starts tomorrow
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
    // Returned — completed, deposit refunded
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
    // Overdue — 5 days past due, large deposit held
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

// ─── Lookup helpers ──────────────────────────────────────────────────────────

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getRental(id: string): Rental | undefined {
  return rentals.find((r) => r.id === id);
}

export function getRentalsByStatus(status: RentalStatus): Rental[] {
  return rentals.filter((r) => r.status === status);
}

export function calculateLateFee(rental: Rental): number {
  const dueDate = new Date(rental.rentalEnd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const daysLate = Math.floor(
    (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysLate <= lateFeeConfig.gracePeriodDays) return 0;

  const chargeableDays = daysLate - lateFeeConfig.gracePeriodDays;
  return chargeableDays * lateFeeConfig.dailyRate;
}

export function calculateDepositRefund(
  rental: Rental,
  lateFee: number,
  damageCharge: number = 0
): number {
  const totalDeductions = lateFee + damageCharge;
  return Math.max(0, rental.depositAmount - totalDeductions);
}

// ─── Orders Store ────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string | number;
  productName: string;
  quantity: number;
  rentalStart: string;
  rentalEnd: string;
  rentalUnits: number;
  rentalCost: number;
  depositTotal: number;
}

export interface Order {
  id: string; // e.g. "SO00001"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  items: OrderItem[];
  totalRentalCost: number;
  totalDeposit: number;
  grandTotal: number;
  createdAt: string;
}

export const orders: Order[] = [];
let orderCounter = 1;

export function getOrder(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function createOrder(
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    deliveryAddress?: string;
  },
  deliveryMethod: DeliveryMethod,
  cartItems: {
    product: Product;
    quantity: number;
    rentalStart: string;
    rentalEnd: string;
    rentalUnits: number;
    rentalCost: number;
    depositTotal: number;
  }[]
): Order {
  const id = `SO${String(orderCounter++).padStart(5, "0")}`;

  const orderItems: OrderItem[] = cartItems.map((item) => ({
    productId: item.product.id,
    productName: item.product.name,
    quantity: item.quantity,
    rentalStart: item.rentalStart,
    rentalEnd: item.rentalEnd,
    rentalUnits: item.rentalUnits,
    rentalCost: item.rentalCost,
    depositTotal: item.depositTotal,
  }));

  const totalRentalCost = cartItems.reduce((sum, i) => sum + i.rentalCost, 0);
  const totalDeposit = cartItems.reduce((sum, i) => sum + i.depositTotal, 0);
  const grandTotal = totalRentalCost + totalDeposit;

  const newOrder: Order = {
    id,
    customerName: customerDetails.name,
    customerEmail: customerDetails.email,
    customerPhone: customerDetails.phone,
    deliveryMethod,
    deliveryAddress: customerDetails.deliveryAddress,
    items: orderItems,
    totalRentalCost,
    totalDeposit,
    grandTotal,
    createdAt: new Date().toISOString(),
  };

  orders.unshift(newOrder);

  // Also create corresponding Rental records for admin tracking
  cartItems.forEach((item, index) => {
    const rentalRecord: Rental = {
      id: `rent-${id.toLowerCase()}-${index + 1}`,
      productId: item.product.id,
      customerName: customerDetails.name,
      rentalStart: item.rentalStart,
      rentalEnd: item.rentalEnd,
      deliveryMethod,
      status: "booked",
      depositAmount: item.depositTotal,
      depositStatus: "held",
      lateFeeCharged: 0,
    };
    rentals.unshift(rentalRecord);

    // Update stock in memory
    const p = products.find((prod) => prod.id === item.product.id);
    if (p) {
      p.inStock = Math.max(0, p.inStock - item.quantity);
    }
  });

  return newOrder;
}

