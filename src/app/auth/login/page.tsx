"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect");
  const emailParam = searchParams.get("email");
  const registeredParam = searchParams.get("registered");

  // "customer" or "admin" — determines redirect after login
  const [roleTab, setRoleTab] = useState<"customer" | "admin">("customer");

  const [email, setEmail] = useState(emailParam || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      const res = await signIn("credentials", {
        email: cleanEmail,
        password: cleanPass,
        redirect: false,
      });

      if (res?.error) {
        setLoading(false);
        setError("Invalid email or password. Please try again.");
        return;
      }

      // Fetch session to get actual role from DB
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      setLoading(false);

      const userRole = session?.user?.role;
      let target: string;

      if (redirectTarget) {
        target = redirectTarget;
      } else if (userRole === "admin" || userRole === "vendor") {
        target = "/admin";
      } else if (userRole === "customer") {
        target = "/customer";
      } else {
        // Fallback to whatever tab they selected
        target = roleTab === "admin" ? "/admin" : "/customer";
      }

      window.location.href = target;
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card animate-fade-in" style={{ maxWidth: 460 }}>
        <div className="auth-header">
          <div className="auth-logo">Locare</div>
          <h2 className="auth-title">Log In to Your Account</h2>
          <p className="auth-subtitle">Sign in to access Locare ERP &amp; Customer Catalog</p>
        </div>

        {registeredParam && (
          <div className="auth-success-badge" style={{ marginBottom: 16 }}>
            ✓ Account created! Please log in with your credentials.
          </div>
        )}

        {error && <div className="auth-error-badge">{error}</div>}

        {/* Role Tab Selector */}
        <div style={{ marginBottom: 24 }}>
          <label style={{
            fontSize: "0.72rem", color: "var(--text-muted)", fontWeight: 700,
            display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em"
          }}>
            I am logging in as:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <button
              type="button"
              onClick={() => setRoleTab("customer")}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: roleTab === "customer" ? "2px solid var(--primary)" : "2px solid var(--border)",
                background: roleTab === "customer" ? "var(--primary)" : "transparent",
                color: roleTab === "customer" ? "#fff" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              👤 Customer
            </button>
            <button
              type="button"
              onClick={() => setRoleTab("admin")}
              style={{
                padding: "10px 16px",
                borderRadius: "10px",
                border: roleTab === "admin" ? "2px solid var(--primary)" : "2px solid var(--border)",
                background: roleTab === "admin" ? "var(--primary)" : "transparent",
                color: roleTab === "admin" ? "#fff" : "var(--text-muted)",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              🛡️ Admin / Vendor
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                style={{ paddingRight: "85px" }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "8px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "6px",
                  padding: "4px 8px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--text)",
                  cursor: "pointer",
                }}
              >
                {showPassword ? "🙈 Hide" : "👁️ Show"}
              </button>
            </div>
          </div>

          <div className="auth-links-row">
            <Link href="/auth/reset-password" className="auth-link">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Log In & Continue"}
          </button>

          <div className="auth-footer-links">
            <span>Don&apos;t have an account? </span>
            <Link href="/auth/signup" className="auth-link-bold">
              Register Here
            </Link>
            <div style={{ marginTop: 8 }}>
              <Link href="/auth/vendor-signup" className="auth-link-accent">
                Become a Vendor ➔
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-shell"><p>Loading...</p></div>}>
      <LoginContent />
    </Suspense>
  );
}
