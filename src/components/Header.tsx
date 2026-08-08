"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRole } from "@/lib/role-context";
import { useCart } from "@/lib/cart-context";
import { useTheme } from "@/lib/theme-context";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Sun,
  Moon,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Package,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  LayoutDashboard,
  Boxes,
} from "lucide-react";

const customerNav = [
  { href: "/customer", label: "Products", icon: Boxes },
  { href: "/customer/terms", label: "Terms & Condition", icon: ShieldCheck },
  { href: "/customer/about", label: "About us", icon: Sparkles },
  { href: "/customer/contact", label: "Contact Us", icon: User },
];

const adminNav = [
  { href: "/admin", label: "Orders", icon: LayoutDashboard },
  { href: "/admin/schedule", label: "Schedule", icon: Calendar },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
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

  const getWishlistCount = () => {
    if (typeof window === "undefined") return 0;
    try {
      const stored = localStorage.getItem("locare_wishlist");
      return stored ? (JSON.parse(stored) as number[]).length : 0;
    } catch { return 0; }
  };
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    setWishlistCount(getWishlistCount());
    const onUpdate = () => setWishlistCount(getWishlistCount());
    window.addEventListener("wishlist-updated", onUpdate);
    return () => window.removeEventListener("wishlist-updated", onUpdate);
  }, []);

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
    <header className="header backdrop-blur-xl border-b border-slate-800/60 sticky top-0 z-50 bg-slate-950/80 transition-colors duration-300">
      <div className="header-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href={activeRole === "customer" ? "/customer" : "/admin"} className="logo flex items-center gap-3 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-lime-500 to-teal-400 p-[2px] shadow-lg shadow-lime-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-lime-400 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-lime-400 bg-clip-text text-transparent">
              Locare
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-lime-500 uppercase -mt-1">
              Rental ERP
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="header-nav hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/admin" && pathname.startsWith("/admin/orders"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-lime-500 to-emerald-600 text-slate-950 shadow-md shadow-lime-500/20 font-bold"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Search Bar */}
        {activeRole === "customer" && (
          <form onSubmit={handleSearchSubmit} className="header-search-form relative flex items-center flex-1 max-w-md mx-2 sm:mx-4">
            <div className="relative w-full flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none transition-colors" />
              <input
                type="text"
                className="w-full h-10 bg-slate-900/90 text-xs sm:text-sm text-slate-100 placeholder-slate-400 rounded-full pl-10 pr-14 border border-slate-800 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/30 transition-all shadow-inner"
                placeholder="Search equipment, gear & tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                  title="Clear search"
                >
                  ✕
                </button>
              ) : (
                <button
                  type="submit"
                  className="absolute right-2 text-[10px] font-mono font-semibold text-slate-300 bg-slate-800/90 hover:bg-slate-700 px-2 py-1 rounded-full border border-slate-700 transition-colors"
                >
                  Search
                </button>
              )}
            </div>
          </form>
        )}

        {/* Right Header Actions */}
        <div className="header-actions flex items-center gap-3">
          {/* Day / Night Theme Toggle */}
          <button
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-medium"
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to Day Mode" : "Switch to Night Mode"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* Customer Wishlist & Cart */}
          {activeRole === "customer" && (
            <div className="flex items-center gap-2">
              <Link href="/customer/wishlist" className="relative p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/30 transition-all">
                <Heart className="w-4 h-4" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-rose-500 rounded-full px-1 shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/customer/cart" className="relative p-2 rounded-xl bg-gradient-to-r from-lime-500/10 to-emerald-500/10 border border-lime-500/30 text-lime-400 hover:bg-lime-500/20 transition-all">
                <ShoppingCart className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[20px] h-[20px] text-[10px] font-bold text-slate-950 bg-lime-400 rounded-full px-1 shadow-md shadow-lime-400/40 animate-pulse">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          )}

          {/* Profile Dropdown */}
          <div className="profile-dropdown-wrapper relative">
            <button
              className="profile-avatar-btn flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all text-left"
              onClick={() => setShowProfileMenu((prev) => !prev)}
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-lime-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold text-xs shadow-sm">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown-menu absolute right-0 mt-2 w-56 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                  <p className="text-xs font-bold text-slate-100 truncate">{session?.user?.name || "User Account"}</p>
                  <p className="text-[11px] text-slate-400 truncate">{session?.user?.email || "user@locare.com"}</p>
                </div>
                
                <Link
                  href="/customer/profile"
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  My Account Profile
                </Link>
                <Link
                  href="/customer/bookings"
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Package className="w-3.5 h-3.5 text-slate-400" />
                  My Rental Orders
                </Link>
                <Link
                  href="/customer/settings"
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Settings
                </Link>

                <div className="my-1 border-t border-slate-800/80" />

                <button
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all text-left"
                  onClick={() => {
                    setShowProfileMenu(false);
                    signOut({ callbackUrl: "/customer" });
                  }}
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Role Switcher Pill */}
          <div className="role-switcher bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center">
            <button
              onClick={() => handleRoleToggle("customer")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeRole === "customer"
                  ? "bg-slate-800 text-lime-400 shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => handleRoleToggle("admin")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeRole === "admin" || activeRole === "vendor"
                  ? "bg-slate-800 text-teal-400 shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

