"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRole } from "@/lib/role-context";
import { useCart } from "@/lib/cart-context";
import { useTheme } from "@/lib/theme-context";

const customerNav = [
  { href: "/customer", label: "Products" },
  { href: "/customer/terms", label: "Terms & Condition" },
  { href: "/customer/about", label: "About us" },
  { href: "/customer/contact", label: "Contact Us" },
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
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [wishlistCount] = useState(2);

  const activeRole = (session?.user as { role?: string })?.role || role;
  const navItems = activeRole === "admin" || activeRole === "vendor" ? adminNav : customerNav;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/customer?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
          <div className="logo-badge px-logo-badge" style={{ background: "linear-gradient(135deg, #5B8731, #7CCC19)", border: "2px solid #7CCC19" }}>
            <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: "1.1rem", color: "#ffffff" }}>🟩</span>
          </div>
          <span className="logo-text" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", fontWeight: 900, letterSpacing: "-0.02em" }}>Locare</span>
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
        </nav>

        {/* Search Bar */}
        {activeRole === "customer" && (
          <form onSubmit={handleSearchSubmit} className="header-search-form">
            <input
              type="text"
              className="header-search-input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="header-search-btn" title="Search">
              🔍
            </button>
          </form>
        )}

        {/* Right Header Actions */}
        <div className="header-actions">
          {/* Day / Night Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Day Mode" : "Switch to Night Mode"}
          >
            {theme === "dark" ? "☀️ Day" : "🌙 Night"}
          </button>

          {/* Customer Wishlist & Cart */}
          {activeRole === "customer" && (
            <>
              <Link href="/customer/wishlist" className="header-action-icon" title="Wishlist">
                ♡
                {wishlistCount > 0 && (
                  <span className="header-action-badge">{wishlistCount}</span>
                )}
              </Link>

              <Link href="/customer/cart" className="header-action-icon" title="Cart">
                🛒
                {itemCount > 0 && (
                  <span className="header-action-badge">{itemCount}</span>
                )}
              </Link>
            </>
          )}

          {/* Profile Dropdown */}
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
                  href="/customer/profile"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  My account / My Profile
                </Link>
                <Link
                  href="/customer/bookings"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  My Orders
                </Link>
                <Link
                  href="/customer/settings"
                  className="profile-dropdown-item"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Settings
                </Link>
                <div className="profile-dropdown-divider" />
                <button
                  className="profile-dropdown-item logout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    signOut({ callbackUrl: "/customer" });
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="role-switcher">
            <div className="role-toggle" role="radiogroup" aria-label="Role switcher">
              <button
                role="radio"
                aria-checked={activeRole === "customer"}
                onClick={() => handleRoleToggle("customer")}
                className={`role-btn ${activeRole === "customer" ? "role-btn-active" : ""}`}
              >
                Customer
              </button>
              <button
                role="radio"
                aria-checked={activeRole === "admin" || activeRole === "vendor"}
                onClick={() => handleRoleToggle("admin")}
                className={`role-btn ${activeRole === "admin" || activeRole === "vendor" ? "role-btn-active" : ""}`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
