"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect");

  const [email, setEmail] = useState("customer@locare.com");
  const [password, setPassword] = useState("customer123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    const res = await signIn("credentials", {
      email: cleanEmail,
      password: cleanPassword,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid User ID or Password. Please check your credentials.");
    } else {
      const session = await getSession();
      const userRole = (session?.user as { role?: string })?.role;

      if (redirectTarget) {
        router.push(redirectTarget);
      } else if (userRole === "admin" || userRole === "vendor") {
        router.push("/admin");
      } else {
        router.push("/customer");
      }
    }
  };

  const handleQuickSignIn = async (userEmail: string, userPass: string, targetPath: string) => {
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email: userEmail,
      password: userPass,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setError(`Quick login failed for ${userEmail}`);
    } else {
      router.push(targetPath);
    }
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

        {/* Direct One-Click Sign-In Options */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <button
            type="button"
            className="btn btn-primary btn-block btn-lg"
            style={{ background: "linear-gradient(135deg, #5B8731, #7CCC19)", fontWeight: 700 }}
            onClick={() => handleQuickSignIn("customer@locare.com", "customer123", "/customer")}
            disabled={loading}
          >
            👤 Sign In as Customer ➔ Customer Portal
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-block"
            style={{ border: "1px solid var(--border)", background: "var(--surface)", fontWeight: 700 }}
            onClick={() => handleQuickSignIn("vendor@locare.com", "vendor123", "/admin")}
            disabled={loading}
          >
            🏢 Sign In as Vendor ➔ Vendor ERP Dashboard
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-block"
            onClick={() => handleQuickSignIn("admin@locare.com", "admin123", "/admin")}
            disabled={loading}
          >
            🛡️ Sign In as Admin ➔ Admin System
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>OR ENTER YOUR CREDENTIALS</span>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
        </div>

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
