"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRole } from "@/lib/role-context";
import { useCart } from "@/lib/cart-context";

export default function Header() {
  const { data: session } = useSession();
  const { role, setRole } = useRole();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [wishlistCount] = useState(2); // Wireframe wishlist counter

  const activeRole = (session?.user as { role?: string })?.role || role;

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
        {/* Logo matching Wireframe "Your Logo" */}
        <Link href={activeRole === "admin" ? "/admin" : "/customer"} className="logo">
          <div className="logo-badge">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <span className="logo-text">Your Logo</span>
        </Link>

        {/* Wireframe Header Links: Products, Terms & Condition, About us, Contact Us */}
        <nav className="header-nav">
          {activeRole === "admin" ? (
            <>
              <Link
                href="/admin"
                className={`nav-link ${pathname === "/admin" ? "nav-link-active" : ""}`}
              >
                Dashboard
              </Link>
              <Link
                href="/admin/rentals"
                className={`nav-link ${pathname === "/admin/rentals" ? "nav-link-active" : ""}`}
              >
                Rentals
              </Link>
              <Link
                href="/admin/returns"
                className={`nav-link ${pathname === "/admin/returns" ? "nav-link-active" : ""}`}
              >
                Returns
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/customer"
                className={`nav-link ${pathname === "/customer" ? "nav-link-active" : ""}`}
              >
                Products
              </Link>
              <Link href="/customer/terms" className="nav-link">
                Terms & Condition
              </Link>
              <Link href="/customer/about" className="nav-link">
                About us
              </Link>
              <Link href="/customer/contact" className="nav-link">
                Contact Us
              </Link>
            </>
          )}
        </nav>

        {/* Wireframe Search Bar with Search Icon Button */}
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

        {/* Right Wireframe Icons: Wishlist, Cart, Profile Avatar & Dropdown */}
        <div className="header-actions">
          {/* Wishlist Icon */}
          <Link href="/customer/wishlist" className="header-action-icon" title="Wishlist">
            ♡
            {wishlistCount > 0 && (
              <span className="header-action-badge">{wishlistCount}</span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link href="/customer/cart" className="header-action-icon" title="Cart">
            🛒
            {itemCount > 0 && (
              <span className="header-action-badge">{itemCount}</span>
            )}
          </Link>

          {/* User Profile Avatar with Dropdown */}
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
                  <strong>{session?.user?.name || "Customer User"}</strong>
                  <small>{session?.user?.email || "customer@locare.com"}</small>
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

          {/* Role Switcher Toggle */}
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
                aria-checked={activeRole === "admin"}
                onClick={() => handleRoleToggle("admin")}
                className={`role-btn ${activeRole === "admin" ? "role-btn-active" : ""}`}
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
