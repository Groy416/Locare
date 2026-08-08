"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CustomerSignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          role: "customer",
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Registration failed.");
      } else {
        const registeredEmail = formData.email.toLowerCase().trim();
        setSuccess("Account created successfully! Redirecting to login...");
        setTimeout(() => router.push(`/auth/login?email=${encodeURIComponent(registeredEmail)}&registered=true`), 1200);
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
          <h2 className="auth-title">Sign-up Page</h2>
          <p className="auth-subtitle">Create a new customer account</p>
        </div>

        {error && (
          <div className="auth-error-badge" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span>{error}</span>
            {error.includes("already exists") && (
              <Link
                href={`/auth/login?email=${encodeURIComponent(formData.email.trim().toLowerCase())}`}
                style={{
                  color: "#ffffff",
                  textDecoration: "underline",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  marginTop: 4,
                }}
              >
                Click here to Log In with this email ➔
              </Link>
            )}
          </div>
        )}
        {success && <div className="auth-success-badge">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="form-input"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="form-input"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email ID
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                style={{ paddingRight: "85px" }}
                placeholder="6-12 chars, 1 upper, 1 lower, 1 special (@, #, $)"
                value={formData.password}
                onChange={handleChange}
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

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                className="form-input"
                style={{ paddingRight: "85px" }}
                value={formData.confirmPassword}
                onChange={handleChange}
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

          <div className="password-rules-box">
            <div className="rules-title">Password requirements:</div>
            <ul>
              <li>Length between 6 and 12 characters</li>
              <li>At least one uppercase letter (A-Z)</li>
              <li>At least one lowercase letter (a-z)</li>
              <li>At least one special character (@, $, #, ...)</li>
            </ul>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <div className="auth-footer-links">
            <Link href="/auth/vendor-signup" className="auth-link-accent">
              Become a vendor
            </Link>
            <div style={{ marginTop: 8 }}>
              <span>Already have an account? </span>
              <Link href="/auth/login" className="auth-link-bold">
                Log In
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
