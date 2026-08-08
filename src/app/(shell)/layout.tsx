"use client";

import { RoleProvider } from "@/lib/role-context";
import { CartProvider } from "@/lib/cart-context";
import Header from "@/components/Header";

/**
 * Shared shell layout that wraps both /customer and /admin routes.
 * Provides the RoleProvider + CartProvider context and renders the Header with role switcher.
 */
export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleProvider>
      <CartProvider>
        <Header />
        <main className="flex-1">{children}</main>
      </CartProvider>
    </RoleProvider>
  );
}
