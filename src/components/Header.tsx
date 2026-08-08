"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRole } from "@/lib/role-context";
import { useCart } from "@/lib/cart-context";

// ─── Nav items per role ──────────────────────────────────────────────────────

const customerNav = [
  { href: "/customer", label: "Browse Catalog" },
  { href: "/customer/bookings", label: "My Bookings" },
];

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/rentals", label: "Rentals" },
  { href: "/admin/returns", label: "Returns" },
];

// ─── Header Component ────────────────────────────────────────────────────────

export default function Header() {
  const { data: session } = useSession();
  const { role, setRole } = useRole();
  const { itemCount } = useCart();
  const pathname = usePathname();

  // If authenticated via NextAuth, prioritize session role, else fallback to client role context
  const activeRole = (session?.user as { role?: string })?.role || role;
  const navItems = activeRole === "admin" ? adminNav : customerNav;

  const handleRoleToggle = (targetRole: "admin" | "customer") => {
    setRole(targetRole);
    if (targetRole === "admin") {
      signIn("credentials", {
        email: "admin@locare.com",
        password: "admin123",
        redirect: false,
      });
    } else {
      signIn("credentials", {
        email: "customer@locare.com",
        password: "customer123",
        redirect: false,
      });
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link href={activeRole === "admin" ? "/admin" : "/customer"} className="logo">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="logo-icon"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="logo-text">Locare</span>
        </Link>

        {/* Navigation */}
        <nav className="header-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${
                pathname === item.href ? "nav-link-active" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

          {activeRole === "customer" && (
            <Link
              href="/customer/cart"
              className={`nav-link nav-cart-link ${
                pathname === "/customer/cart" ? "nav-link-active" : ""
              }`}
            >
              🛒 Cart
              {itemCount > 0 && (
                <span className="nav-cart-badge">{itemCount}</span>
              )}
            </Link>
          )}
        </nav>

        {/* Auth / Role Switcher */}
        <div className="role-switcher">
          <span className="role-label">
            {session?.user ? `Logged in: ${session.user.name}` : "Role:"}
          </span>
          <div className="role-toggle" role="radiogroup" aria-label="Role switcher">
            <button
              role="radio"
              aria-checked={activeRole === "customer"}
              onClick={() => handleRoleToggle("customer")}
              className={`role-btn ${activeRole === "customer" ? "role-btn-active" : ""}`}
            >
              <span className="role-btn-icon">👤</span>
              Customer
            </button>
            <button
              role="radio"
              aria-checked={activeRole === "admin"}
              onClick={() => handleRoleToggle("admin")}
              className={`role-btn ${activeRole === "admin" ? "role-btn-active" : ""}`}
            >
              <span className="role-btn-icon">🛡️</span>
              Admin
            </button>
            <div
              className="role-toggle-indicator"
              style={{
                transform:
                  activeRole === "admin" ? "translateX(100%)" : "translateX(0)",
              }}
            />
          </div>
          {session && (
            <button
              onClick={() => signOut({ redirect: false })}
              className="btn btn-ghost btn-sm"
              style={{ marginLeft: 8, fontSize: "0.75rem" }}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
