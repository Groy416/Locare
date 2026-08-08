"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/customer";

  const [email, setEmail] = useState("customer@locare.com");
  const [password, setPassword] = useState("customer123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid User ID or Password.");
    } else {
      router.push(redirectTarget);
    }
  };

  const handleQuickSignIn = async (userEmail: string, userPass: string, targetPath: string) => {
    setLoading(true);
    await signIn("credentials", {
      email: userEmail,
      password: userPass,
      redirect: false,
    });
    setLoading(false);
    router.push(targetPath);
  };

  return (
    <div className="auth-shell">
      <div className="auth-card animate-fade-in" style={{ maxWidth: 460 }}>
        <div className="auth-header">
          <div className="auth-logo">Locare</div>
          <h2 className="auth-title">Log In to Your Account</h2>
          <p className="auth-subtitle">Step 2: Sign in to access Locare Home & Catalog</p>
        </div>

        {error && <div className="auth-error-badge">{error}</div>}

        {/* Quick Demo Sign-In Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <button
            className="btn btn-primary btn-block btn-lg"
            style={{ background: "linear-gradient(135deg, #5B8731, #7CCC19)", fontWeight: 700 }}
            onClick={() => handleQuickSignIn("customer@locare.com", "customer123", redirectTarget)}
            disabled={loading}
          >
            👤 Sign In as Customer → Main Home
          </button>

          <button
            className="btn btn-ghost btn-block"
            onClick={() => handleQuickSignIn("admin@locare.com", "admin123", "/admin")}
            disabled={loading}
          >
            🛡️ Sign In as Vendor / Admin ERP
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700 }}>OR CUSTOM CREDENTIALS</span>
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
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="auth-links-row">
            <Link href="/auth/reset-password" className="auth-link">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Log In & Continue to Home"}
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
