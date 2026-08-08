/**
 * In-memory data store for the Rental Management System.
 * No real database — all data lives in memory per the MVP scope.
 * @see /docs/MVP-SCOPE.md
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type RentalUnit = "day" | "week" | "month";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string; // placeholder path
  rentalUnit: RentalUnit;
  price: number; // per rental unit
  securityDeposit: number; // fixed deposit amount
  inStock: number;
}

export type RentalStatus = "booked" | "active" | "returned" | "overdue";
export type DepositStatus = "held" | "refunded" | "partially-deducted";
export type DeliveryMethod = "pickup" | "delivery";

export interface Rental {
  id: string;
  productId: string;
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
    name: "Pressure Washer Pro 3000",
    description:
      "Industrial-grade pressure washer, 3000 PSI. Perfect for driveways, decks, and exterior walls.",
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
    description:
      "Compact mini excavator ideal for landscaping, trenching, and small demolition jobs.",
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
    description:
      "Aluminium scaffold tower, 6m working height. Includes platform, guardrails, and outriggers.",
    category: "Access Equipment",
    image: "/images/scaffolding.jpg",
    rentalUnit: "week",
    price: 220,
    securityDeposit: 500,
    inStock: 6,
  },
  {
    id: "prod-004",
    name: 'Concrete Mixer 9 cu ft',
    description:
      "Portable concrete mixer with electric motor. Mixes up to 9 cubic feet per batch.",
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
    description:
      "4K laser projector with 5000 lumens. Great for events, conferences, and outdoor screenings.",
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
    description:
      "Large white party tent with sidewalls. Seats up to 100 guests comfortably.",
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
    description:
      "Portable gasoline generator, 7500W peak power. Ideal for job sites and emergency backup.",
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
    description:
      "Telescopic boom lift with 40 ft working height. For exterior painting, tree work, and signage.",
    category: "Access Equipment",
    image: "/images/aerial-lift.jpg",
    rentalUnit: "day",
    price: 425,
    securityDeposit: 2000,
    inStock: 1,
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
  productId: string;
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
    const p = getProduct(item.product.id);
    if (p) {
      p.inStock = Math.max(0, p.inStock - item.quantity);
    }
  });

  return newOrder;
}

