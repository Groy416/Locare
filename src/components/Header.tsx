"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole, type Role } from "@/lib/role-context";

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
  const { role, setRole } = useRole();
  const pathname = usePathname();
  const navItems = role === "admin" ? adminNav : customerNav;

  return (
    <header className="header">
      <div className="header-inner">
        {/* Logo */}
        <Link href={role === "admin" ? "/admin" : "/customer"} className="logo">
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
          <span className="logo-text">RentFlow</span>
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
        </nav>

        {/* Role Switcher */}
        <div className="role-switcher">
          <span className="role-label">View as:</span>
          <div className="role-toggle" role="radiogroup" aria-label="Role switcher">
            <RoleButton
              targetRole="customer"
              currentRole={role}
              onClick={() => setRole("customer")}
            />
            <RoleButton
              targetRole="admin"
              currentRole={role}
              onClick={() => setRole("admin")}
            />
            <div
              className="role-toggle-indicator"
              style={{
                transform:
                  role === "admin" ? "translateX(100%)" : "translateX(0)",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Role Button ─────────────────────────────────────────────────────────────

function RoleButton({
  targetRole,
  currentRole,
  onClick,
}: {
  targetRole: Role;
  currentRole: Role;
  onClick: () => void;
}) {
  const isActive = currentRole === targetRole;
  const label = targetRole === "customer" ? "Customer" : "Admin";
  const icon = targetRole === "customer" ? "👤" : "🛡️";

  return (
    <button
      role="radio"
      aria-checked={isActive}
      onClick={onClick}
      className={`role-btn ${isActive ? "role-btn-active" : ""}`}
    >
      <span className="role-btn-icon">{icon}</span>
      {label}
    </button>
  );
}
