"use client";

import Link from "next/link";
import { ArrowLeft, Zap, Shield, Layers, RefreshCw, Boxes, Award } from "lucide-react";

const accentColors = ["#5BC8F5", "#F5E642", "#86EFAC", "#C4B5FD", "#FDBA74", "#FDA4AF"];

export default function AboutUsPage() {
  const metrics = [
    { label: "Rentals Fulfilled", value: "10,000+", icon: "📦", accent: "#5BC8F5" },
    { label: "On-Time Fulfillment", value: "99.8%", icon: "⏱️", accent: "#86EFAC" },
    { label: "Verified Vendors", value: "500+", icon: "🛡️", accent: "#F5E642" },
    { label: "Customer Satisfaction", value: "4.9 / 5", icon: "⭐", accent: "#C4B5FD" },
  ];

  const features = [
    { title: "Real-Time Inventory Tracking", desc: "Automatic stock updates upon booking checkout and live auto-restoration upon return.", icon: "⚡", accent: "#5BC8F5" },
    { title: "Automated Late Fine Engine", desc: "Smart calculation engine with daily late rates, grace periods, and deposit settlements.", icon: "🔄", accent: "#F5E642" },
    { title: "Category-Aware Variants & Filters", desc: "Dynamic color swatch filters for Clothing, Electronics, and Furniture with live variant syncing.", icon: "🎨", accent: "#86EFAC" },
    { title: "Enterprise ERP Workflow", desc: "Full lifecycle management from Quotation to Sale Order confirmation, Pickup, and Invoicing.", icon: "📊", accent: "#C4B5FD" },
  ];

  const team = [
    { name: "Sarah Chen", role: "Head of Product Strategy", avatar: "👩‍💼", accent: "#5BC8F5" },
    { name: "Mark Wood", role: "Lead ERP & Logistics Architect", avatar: "👨‍💻", accent: "#F5E642" },
    { name: "Garima Roy", role: "Customer Operations Director", avatar: "👩‍🔬", accent: "#86EFAC" },
  ];

  return (
    <div className="static-page">
      {/* Back link */}
      <Link href="/customer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 28 }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
      </Link>

      {/* Hero */}
      <div className="static-hero">
        <div className="accent-chip" style={{ marginBottom: 20 }}>
          ✦ About Locare Enterprise
        </div>
        <h1 className="static-hero-title">
          Revolutionizing<br />
          <span className="static-hero-accent">Rental</span> ERP.
        </h1>
        <p className="static-hero-sub">
          Locare is the next-generation Equipment Rental &amp; Management ERP platform designed for
          seamless multi-category product rentals, automated deposit settlements, and dynamic variant fulfillment.
        </p>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 20 }}>
        {metrics.map((m) => (
          <div key={m.label} className="card" style={{ textAlign: "center", padding: "24px 16px", background: m.accent }}>
            <div style={{ fontSize: "2rem", marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Mission & Vision */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div className="static-section">
          <div className="static-section-title">
            <span className="section-num">M</span>
            Our Mission
          </div>
          <p className="static-body-text">
            To empower vendors, businesses, and customers with a frictionless, highly-automated rental ecosystem
            that eliminates manual inventory errors, simplifies billing, and guarantees 100% transparent deposit refunds.
          </p>
        </div>
        <div className="static-section" style={{ borderLeft: "4px solid #5BC8F5" }}>
          <div className="static-section-title">
            <span className="section-num" style={{ background: "#5BC8F5" }}>V</span>
            Our Vision
          </div>
          <p className="static-body-text">
            To become the global standard in rental resource management by pioneering smart ERP workflows,
            automated late fine logic, and real-time category variant synchronization.
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="static-section" style={{ marginBottom: 20 }}>
        <div className="static-section-title" style={{ marginBottom: 20 }}>
          <span className="section-num" style={{ background: "#F5E642" }}>★</span>
          Platform Capabilities
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {features.map((f, i) => (
            <div key={f.title} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{
                width: 44, height: 44, flexShrink: 0,
                background: f.accent, border: "1.5px solid #0D0D0D",
                borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem"
              }}>{f.icon}</div>
              <div>
                <h3 style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: 4 }}>{f.title}</h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <div className="static-section" style={{ marginBottom: 20 }}>
        <div className="static-section-title">
          <span className="section-num" style={{ background: "#C4B5FD" }}>👥</span>
          Leadership Team
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14, marginTop: 16 }}>
          {team.map((m) => (
            <div key={m.name} style={{
              background: m.accent, border: "1.5px solid #0D0D0D",
              borderRadius: 14, padding: "20px 16px", textAlign: "center",
              boxShadow: "3px 3px 0 #0D0D0D",
            }}>
              <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>{m.avatar}</div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem", marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, opacity: 0.7 }}>{m.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: "var(--color-dark)", border: "var(--border-thin)",
        borderRadius: 20, padding: "32px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 20, boxShadow: "var(--shadow-lg)",
      }}>
        <div>
          <h3 style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", marginBottom: 4 }}>Ready to experience Locare?</h3>
          <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>Explore our product catalog or get in touch today.</p>
        </div>
        <Link href="/customer" className="btn btn-yellow">Browse Catalog →</Link>
      </div>
    </div>
  );
}
