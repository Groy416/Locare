"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "AV Equipment & Electronics",
  "Cleaning Equipment",
  "Heavy Equipment",
  "Access Equipment",
  "Construction",
  "Events & Furniture",
  "Power Equipment",
];

export default function VendorSignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    productCategory: CATEGORIES[0],
    gstNo: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
          role: "vendor",
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.error || "Vendor registration failed.");
      } else {
        const registeredEmail = formData.email.toLowerCase().trim();
        setSuccess("Vendor registered successfully! Redirecting to login...");
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
          <h2 className="auth-title">Vendor Sign-up Page</h2>
          <p className="auth-subtitle">Register your business & rental catalog</p>
        </div>

        {error && <div className="auth-error-badge">{error}</div>}
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
            <label className="form-label" htmlFor="companyName">
              Company Name
            </label>
            <input
              id="companyName"
              name="companyName"
              type="text"
              className="form-input"
              placeholder="e.g. TechRentals Ltd"
              value={formData.companyName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="productCategory">
              Product Category
            </label>
            <select
              id="productCategory"
              name="productCategory"
              className="form-select"
              value={formData.productCategory}
              onChange={handleChange}
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <span className="field-hint">
              Necessary during creation of sale orders and invoices
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="gstNo">
              GST No.
            </label>
            <input
              id="gstNo"
              name="gstNo"
              type="text"
              className="form-input"
              placeholder="e.g. 27AABCU9603R1ZN"
              value={formData.gstNo}
              onChange={handleChange}
              required
            />
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

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-input"
                placeholder="6-12 chars"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? "Registering Vendor..." : "Register"}
          </button>

          <div className="auth-footer-links">
            <span>Already have an account? </span>
            <Link href="/auth/login" className="auth-link-bold">
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
