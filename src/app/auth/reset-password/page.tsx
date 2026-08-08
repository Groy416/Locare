"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Password reset failed.");
      } else {
        setMessage(data.message || "The password reset link has been sent to your email.");
      }
    } catch {
      setLoading(false);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card animate-fade-in">
        <div className="auth-header">
          <div className="auth-logo">Locare</div>
          <h2 className="auth-title">Reset Password</h2>
          <p className="auth-subtitle">Verify email and receive reset link</p>
        </div>

        {error && <div className="auth-error-badge">{error}</div>}
        {message && <div className="auth-success-badge">{message}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="reset-email">
              Enter Email ID:
            </label>
            <input
              id="reset-email"
              type="email"
              className="form-input"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <span className="field-hint">
              Note: The system will verify whether the entered email exists.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Submit"}
          </button>

          <div className="auth-footer-links">
            <Link href="/auth/login" className="auth-link-bold">
              ← Back to Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
