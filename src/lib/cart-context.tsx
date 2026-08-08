"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Product, RentalUnit } from "@/lib/data";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
  rentalStart: string; // YYYY-MM-DD
  rentalEnd: string; // YYYY-MM-DD
  rentalUnits: number; // computed: how many days/weeks/months
  rentalCost: number; // price × rentalUnits × quantity
  depositTotal: number; // securityDeposit × quantity
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  totalRentalCost: number;
  totalDeposit: number;
  grandTotal: number;
  itemCount: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function calculateRentalUnits(
  start: string,
  end: string,
  unit: RentalUnit
): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  switch (unit) {
    case "day":
      return diffDays;
    case "week":
      return Math.max(1, Math.ceil(diffDays / 7));
    case "month":
      return Math.max(1, Math.ceil(diffDays / 30));
  }
}

export function formatRentalUnit(unit: RentalUnit, count: number): string {
  const label = unit === "day" ? "day" : unit === "week" ? "week" : "month";
  return count === 1 ? `1 ${label}` : `${count} ${label}s`;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      // Replace if same product already in cart
      const filtered = prev.filter(
        (i) => i.product.id !== item.product.id
      );
      return [...filtered, item];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalRentalCost = items.reduce((sum, i) => sum + i.rentalCost, 0);
  const totalDeposit = items.reduce((sum, i) => sum + i.depositTotal, 0);
  const grandTotal = totalRentalCost + totalDeposit;
  const itemCount = items.length;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        totalRentalCost,
        totalDeposit,
        grandTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
