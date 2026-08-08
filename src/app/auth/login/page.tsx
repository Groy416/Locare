"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect");

  const [email, setEmail] = useState("customer@locare.com");
  const [password, setPassword] = useState("customer123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const performLogin = async (loginEmail: string, loginPass: string, fallbackTarget: string) => {
    setError("");
    setLoading(true);

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPass = loginPass.trim();

    try {
      const res = await signIn("credentials", {
        email: cleanEmail,
        password: cleanPass,
        redirect: false,
      });

      setLoading(false);

      if (res?.error) {
        setError("Invalid User ID or Password.");
      } else {
        const target = redirectTarget || fallbackTarget;
        window.location.href = target;
      }
    } catch {
      setLoading(false);
      setError("An unexpected error occurred during login.");
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const fallbackPath = cleanEmail.includes("customer") ? "/customer" : "/admin";
    await performLogin(email, password, fallbackPath);
  };

  const handleRoleSelect = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError("");
  };

  return (
    <div className="auth-shell">
      <div className="auth-card animate-fade-in" style={{ maxWidth: 480 }}>
        <div className="auth-header">
          <div className="auth-logo">Locare</div>
          <h2 className="auth-title">Log In to Your Account</h2>
          <p className="auth-subtitle">Sign in to access Locare ERP & Customer Catalog</p>
        </div>

        {error && <div className="auth-error-badge">{error}</div>}

        {/* Role Quick Selection Preset Buttons */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, display: "block", marginBottom: 8, textTransform: "uppercase" }}>
            PRE-FILL DEMO ACCOUNT CREDENTIALS:
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <button
              type="button"
              className={`btn btn-sm ${email === "customer@locare.com" ? "btn-primary" : "btn-ghost"}`}
              style={{ fontWeight: 700 }}
              onClick={() => handleRoleSelect("customer@locare.com", "customer123")}
            >
              👤 Customer
            </button>

            <button
              type="button"
              className={`btn btn-sm ${email === "vendor@locare.com" ? "btn-primary" : "btn-ghost"}`}
              style={{ fontWeight: 700 }}
              onClick={() => handleRoleSelect("vendor@locare.com", "vendor123")}
            >
              🏢 Vendor
            </button>

            <button
              type="button"
              className={`btn btn-sm ${email === "admin@locare.com" ? "btn-primary" : "btn-ghost"}`}
              style={{ fontWeight: 700 }}
              onClick={() => handleRoleSelect("admin@locare.com", "admin123")}
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, height: 1, background: "var(--border)", margin: "16px 0" }} />

        <form onSubmit={handleCustomSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Login ID (Email)
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="customer@locare.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            <span>Do not have an account? </span>
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
    <Suspense fallback={<div className="auth-shell"><p>Loading Login...</p></div>}>
      <LoginContent />
    </Suspense>
  );
}
