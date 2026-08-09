"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin, Clock, Send, CheckCircle } from "lucide-react";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "General Inquiry", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 800);
  };

  const contacts = [
    { icon: "📞", title: "Support Hotline", detail: "+91 (800) 562-2731", sub: "Mon – Sat: 8 AM – 8 PM EST", accent: "#5BC8F5" },
    { icon: "✉️", title: "Email Support", detail: "support@locare.com", sub: "Response within 2 business hours", accent: "#86EFAC" },
    { icon: "📍", title: "Headquarters", detail: "Locare Enterprise Towers, Suite 402", sub: "Tech Park Boulevard, Innovation Hub", accent: "#F5E642" },
    { icon: "🕐", title: "Business Hours", detail: "8:00 AM – 8:00 PM Daily", sub: "Automated Returns 24/7", accent: "#C4B5FD" },
  ];

  return (
    <div className="static-page">
      <Link href="/customer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 28 }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
      </Link>

      {/* Hero */}
      <div className="static-hero">
        <div className="accent-chip" style={{ background: "#5BC8F5", marginBottom: 20 }}>📬 Get In Touch</div>
        <h1 className="static-hero-title">
          We'd Love to<br />
          <span className="static-hero-accent">Hear From You.</span>
        </h1>
        <p className="static-hero-sub">
          Have a question about renting, returns, or our ERP platform? Our support team is here to help.
        </p>
      </div>

      {/* Contact cards */}
      <div className="contact-grid">
        {contacts.map((c) => (
          <div key={c.title} className="contact-card">
            <div style={{
              width: 48, height: 48, background: c.accent,
              border: "1.5px solid #0D0D0D", borderRadius: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.4rem", margin: "0 auto 14px",
            }}>{c.icon}</div>
            <h3 style={{ fontSize: "0.85rem", fontWeight: 800, marginBottom: 6 }}>{c.title}</h3>
            <p style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: 2 }}>{c.detail}</p>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Contact Form */}
      <div className="static-section">
        <div className="static-section-title">
          <span className="section-num">✍</span>
          Send Us a Message
        </div>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>✅</div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 900, marginBottom: 8 }}>Message Sent!</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              We'll get back to you at <strong>{formData.email}</strong> within 2 business hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text" required className="form-input"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Email Address *</label>
                <input
                  type="email" required className="form-input"
                  placeholder="john@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={formData.subject}
                onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
              >
                <option>General Inquiry</option>
                <option>Rental Support</option>
                <option>Return & Deposit</option>
                <option>ERP / Admin Access</option>
                <option>Billing & Payments</option>
                <option>Technical Issue</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Message *</label>
              <textarea
                required rows={5} className="form-textarea"
                placeholder="Describe your question or issue in detail..."
                value={formData.message}
                onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
              />
            </div>

            <button
              type="submit"
              className="btn btn-yellow"
              disabled={loading}
              style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8 }}
            >
              {loading ? "Sending..." : (<><Send className="w-4 h-4" /> Send Message</>)}
            </button>
          </form>
        )}
      </div>

      {/* FAQ quick-links */}
      <div className="static-section">
        <div className="static-section-title">
          <span className="section-num" style={{ background: "#86EFAC" }}>?</span>
          Quick FAQ
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
          {[
            { q: "How do I return a rented item?", a: "Go to My Rentals, click the item, and select Return. Our system auto-calculates any late fees." },
            { q: "When does my security deposit come back?", a: "Within 24 hours after our team marks your return as verified and damage-free." },
            { q: "Can I extend my rental period?", a: "Yes! Contact support before the return date and we'll adjust the duration with updated pricing." },
          ].map((faq, i) => (
            <div key={i} style={{ padding: "14px 16px", border: "1.5px solid rgba(13,13,13,0.1)", borderRadius: 10 }}>
              <p style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: 4 }}>{faq.q}</p>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
