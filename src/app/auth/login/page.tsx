"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
      router.push("/admin");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo">Locare</div>
          <h2 className="auth-title">Log In</h2>
          <p className="auth-subtitle">Access your Rental ERP & Catalog</p>
        </div>

        {error && <div className="auth-error-badge">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Login ID (Email)
            </label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="admin@locare.com"
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
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Log In"}
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
