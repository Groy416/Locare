"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRole } from "@/lib/role-context";
import { useCart } from "@/lib/cart-context";

const customerNav = [
  { href: "/customer", label: "Browse Catalog" },
  { href: "/customer/bookings", label: "My Bookings" },
];

const adminNav = [
  { href: "/admin", label: "Orders" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/settings", label: "Settings" },
];

export default function Header() {
  const { data: session } = useSession();
  const { role, setRole } = useRole();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const activeRole = (session?.user as { role?: string })?.role || role;
  const navItems = activeRole === "admin" || activeRole === "vendor" ? adminNav : customerNav;

  const handleRoleToggle = (targetRole: "admin" | "customer") => {
    setRole(targetRole);
    if (targetRole === "admin") {
      signIn("credentials", {
        email: "admin@locare.com",
        password: "admin123",
        redirect: false,
      });
      router.push("/admin");
    } else {
      signIn("credentials", {
        email: "customer@locare.com",
        password: "customer123",
        redirect: false,
      });
      router.push("/customer");
    }
  };

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link href={activeRole === "customer" ? "/customer" : "/admin"} className="logo">
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
          <span className="logo-text">Locare ERP</span>
        </Link>

        {/* Navigation Links */}
        <nav className="header-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${
                pathname === item.href || (item.href === "/admin" && pathname.startsWith("/admin/orders"))
                  ? "nav-link-active"
                  : ""
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

        {/* User Profile & Role Switcher */}
        <div className="role-switcher">
          <div className="profile-dropdown-wrapper">
            <button
              className="profile-avatar-btn"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              title="User Profile"
            >
              <span className="avatar-circle">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </span>
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-header">
                  <strong>{session?.user?.name || "User Account"}</strong>
                  <small>{session?.user?.email || "user@locare.com"}</small>
                </div>
                <div className="profile-dropdown-divider" />
                <Link
                  href="/admin/settings"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Profile & Settings
                </Link>
                <button
                  className="profile-dropdown-item logout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    signOut({ callbackUrl: "/auth/login" });
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <div className="role-toggle" role="radiogroup" aria-label="Role switcher">
            <button
              role="radio"
              aria-checked={activeRole === "customer"}
              onClick={() => handleRoleToggle("customer")}
              className={`role-btn ${activeRole === "customer" ? "role-btn-active" : ""}`}
            >
              👤 Customer
            </button>
            <button
              role="radio"
              aria-checked={activeRole === "admin" || activeRole === "vendor"}
              onClick={() => handleRoleToggle("admin")}
              className={`role-btn ${activeRole === "admin" || activeRole === "vendor" ? "role-btn-active" : ""}`}
            >
              🛡️ ERP Admin
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
