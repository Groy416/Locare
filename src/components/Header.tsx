"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRole } from "@/lib/role-context";
import { useCart } from "@/lib/cart-context";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  ChevronDown,
  LogOut,
  Package,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  LayoutDashboard,
  Boxes,
  Shield,
  Menu,
  X,
} from "lucide-react";

const customerNav = [
  { href: "/customer",         label: "Products",        accent: "blue" },
  { href: "/customer/terms",   label: "Terms",           accent: "green" },
  { href: "/customer/about",   label: "About",           accent: "yellow" },
  { href: "/customer/contact", label: "Contact",         accent: "violet" },
];

const adminNav = [
  { href: "/admin",              label: "Orders",    accent: "blue" },
  { href: "/admin/schedule",     label: "Schedule",  accent: "green" },
  { href: "/admin/products",     label: "Products",  accent: "yellow" },
  { href: "/admin/reports",      label: "Reports",   accent: "orange" },
  { href: "/admin/settings",     label: "Settings",  accent: "violet" },
];

export default function Header() {
  const { data: session } = useSession();
  const { role, setRole } = useRole();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const getWishlistCount = () => {
    if (typeof window === "undefined") return 0;
    try {
      const stored = localStorage.getItem("locare_wishlist");
      return stored ? (JSON.parse(stored) as number[]).length : 0;
    } catch { return 0; }
  };

  useEffect(() => {
    setWishlistCount(getWishlistCount());
    const onUpdate = () => setWishlistCount(getWishlistCount());
    window.addEventListener("wishlist-updated", onUpdate);
    return () => window.removeEventListener("wishlist-updated", onUpdate);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".profile-dropdown-wrapper")) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeRole = (session?.user as { role?: string })?.role || role;
  const navItems = activeRole === "admin" || activeRole === "vendor" ? adminNav : customerNav;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/customer?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileMenu(false);
    }
  };

  const handleRoleToggle = (targetRole: "admin" | "customer") => {
    setRole(targetRole);
    if (targetRole === "admin") {
      signIn("credentials", { email: "admin@locare.com", password: "admin123", redirect: false });
      router.push("/admin");
    } else {
      signIn("credentials", { email: "customer@locare.com", password: "customer123", redirect: false });
      router.push("/customer");
    }
  };

  const isAdmin = activeRole === "admin" || activeRole === "vendor";
  const userInitial = session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U";

  return (
    <header className="header">
      <div className="header-inner">

        {/* ── Logo ── */}
        <Link href={isAdmin ? "/admin" : "/customer"} className="logo" style={{ flexShrink: 0 }}>
          <div className="logo-mark">L</div>
          <span style={{ fontWeight: 900, fontSize: "1.3rem", letterSpacing: "-0.04em" }}>Locare</span>
        </Link>

        {/* ── Pill Navigation (desktop) ── */}
        <nav className="header-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href === "/admin" && pathname.startsWith("/admin/orders"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-pill nav-pill-${item.accent} ${isActive ? "nav-pill-active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Search (customer only) ── */}
        {activeRole === "customer" && (
          <form onSubmit={handleSearchSubmit} className="header-search-form" role="search">
            <div style={{ position: "relative", width: "100%" }}>
              <Search
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                className="w-4 h-4 text-gray-400"
              />
              <input
                type="text"
                className="header-search-input"
                placeholder="Search equipment, gear & tools…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    width: 22, height: 22, borderRadius: "50%", border: "1.5px solid rgba(13,13,13,0.2)",
                    background: "var(--bg-alt)", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "var(--text-muted)", cursor: "pointer",
                  }}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </form>
        )}

        {/* ── Right Actions ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>

          {/* Wishlist & Cart */}
          {activeRole === "customer" && (
            <>
              <Link href="/customer/wishlist" className="header-icon-btn" aria-label="Wishlist">
                <Heart className="w-4 h-4" />
                {wishlistCount > 0 && (
                  <span style={{
                    position: "absolute", top: -6, right: -6,
                    background: "var(--rose)",
                    border: "1.5px solid var(--color-dark)",
                    color: "var(--color-dark)",
                    borderRadius: "99px",
                    minWidth: 18, height: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, padding: "0 3px",
                  }}>
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/customer/cart" className="header-icon-btn" aria-label="Cart">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span style={{
                    position: "absolute", top: -6, right: -6,
                    background: "var(--yellow)",
                    border: "1.5px solid var(--color-dark)",
                    color: "var(--color-dark)",
                    borderRadius: "99px",
                    minWidth: 18, height: 18,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, padding: "0 3px",
                  }}>
                    {itemCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* Profile Dropdown */}
          <div className="profile-dropdown-wrapper" style={{ position: "relative" }}>
            <button
              className="profile-avatar-btn"
              onClick={() => setShowProfileMenu((p) => !p)}
              aria-expanded={showProfileMenu}
              aria-haspopup="true"
              aria-label="Account menu"
            >
              <div className="profile-avatar">{userInitial}</div>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)", maxWidth: 72, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {session?.user?.name?.split(" ")[0] || "Account"}
              </span>
              <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--text-muted)", flexShrink: 0 }} />
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown-menu">
                <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid rgba(13,13,13,0.08)", marginBottom: 4 }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--text)", marginBottom: 1 }}>
                    {session?.user?.name || "User Account"}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    {session?.user?.email || "user@locare.com"}
                  </p>
                </div>

                <Link href="/customer/profile" className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
                  <User className="w-3.5 h-3.5" /> My Profile
                </Link>
                <Link href="/customer/bookings" className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
                  <Package className="w-3.5 h-3.5" /> My Rentals
                </Link>
                <Link href="/customer/settings" className="profile-menu-item" onClick={() => setShowProfileMenu(false)}>
                  <Settings className="w-3.5 h-3.5" /> Settings
                </Link>

                <div className="divider" />

                <button
                  className="profile-menu-item profile-menu-item-danger"
                  onClick={() => { setShowProfileMenu(false); signOut({ callbackUrl: "/customer" }); }}
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="role-switcher">
            <button
              className={`role-btn ${activeRole === "customer" ? "role-btn-active" : ""}`}
              onClick={() => handleRoleToggle("customer")}
              aria-pressed={activeRole === "customer"}
            >
              Customer
            </button>
            <button
              className={`role-btn ${isAdmin ? "role-btn-admin-active" : ""}`}
              onClick={() => handleRoleToggle("admin")}
              aria-pressed={isAdmin}
            >
              Admin
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="header-icon-btn"
            style={{ display: "none" }}
            onClick={() => setShowMobileMenu((p) => !p)}
            aria-label="Toggle menu"
            aria-expanded={showMobileMenu}
            id="mobile-menu-btn"
          >
            {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div style={{
          background: "var(--bg)",
          borderTop: "1.5px solid rgba(13,13,13,0.1)",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-pill ${pathname === item.href ? "nav-pill-active" : ""}`}
              style={{ display: "block", textAlign: "center" }}
              onClick={() => setShowMobileMenu(false)}
            >
              {item.label}
            </Link>
          ))}
          {activeRole === "customer" && (
            <form onSubmit={handleSearchSubmit} style={{ marginTop: 8 }}>
              <div style={{ position: "relative" }}>
                <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", width: 16, height: 16, color: "var(--text-muted)" }} />
                <input
                  type="text"
                  className="header-search-input"
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          )}
        </div>
      )}
    </header>
  );
}
