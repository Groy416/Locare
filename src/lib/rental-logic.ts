import type { Rental, Product, LateFeeConfig } from "./data";

export interface DashboardMetrics {
  totalActiveRentals: number;
  totalRevenue: number;
  overdueCount: number;
  totalHeldDeposits: number;
  utilizationRate: number; // percentage 0-100
  recentActivity: Array<{
    id: string;
    type: "booking" | "return" | "overdue";
    message: string;
    timestamp: string;
  }>;
}

export function calculateLateFee(
  rentalEnd: string,
  config: LateFeeConfig = { dailyRate: 15, gracePeriodDays: 1 }
): number {
  const dueDate = new Date(rentalEnd);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  const daysLate = Math.floor(
    (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysLate <= config.gracePeriodDays) return 0;

  const chargeableDays = daysLate - config.gracePeriodDays;
  return chargeableDays * config.dailyRate;
}

export function calculateDepositRefund(
  depositAmount: number,
  lateFee: number,
  damageCharge: number = 0
): number {
  const totalDeductions = lateFee + damageCharge;
  return Math.max(0, depositAmount - totalDeductions);
}

export function aggregateDashboardMetrics(
  rentals: Rental[],
  products: Product[]
): DashboardMetrics {
  const activeRentals = rentals.filter((r) => r.status === "active");
  const overdueRentals = rentals.filter((r) => r.status === "overdue");

  const totalActiveRentals = activeRentals.length + overdueRentals.length;

  // Calculate estimated total revenue from all bookings & late fees
  const totalRevenue = rentals.reduce((sum, r) => {
    const prod = products.find((p) => p.id === r.productId);
    const price = prod ? prod.price : 100;
    return sum + price + (r.lateFeeCharged || 0);
  }, 0);

  const overdueCount = overdueRentals.length;

  const totalHeldDeposits = rentals
    .filter((r) => r.depositStatus === "held")
    .reduce((sum, r) => sum + r.depositAmount, 0);

  const totalInventory = products.reduce((sum, p) => sum + p.inStock, 0);
  const currentlyRented = totalActiveRentals;
  const utilizationRate =
    totalInventory > 0
      ? Math.min(100, Math.round((currentlyRented / totalInventory) * 100))
      : 0;

  const recentActivity = rentals.slice(0, 5).map((r) => {
    const prod = products.find((p) => p.id === r.productId);
    const prodName = prod ? prod.name : "Equipment";
    if (r.status === "overdue") {
      return {
        id: `act-${r.id}`,
        type: "overdue" as const,
        message: `${r.customerName}'s rental of ${prodName} is overdue`,
        timestamp: "Action Required",
      };
    } else if (r.status === "returned") {
      return {
        id: `act-${r.id}`,
        type: "return" as const,
        message: `${r.customerName} returned ${prodName}`,
        timestamp: "Recently",
      };
    } else {
      return {
        id: `act-${r.id}`,
        type: "booking" as const,
        message: `${r.customerName} booked ${prodName}`,
        timestamp: "Active",
      };
    }
  });

  return {
    totalActiveRentals,
    totalRevenue,
    overdueCount,
    totalHeldDeposits,
    utilizationRate,
    recentActivity,
  };
}
