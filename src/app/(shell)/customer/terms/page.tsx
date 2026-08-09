"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

const sectionAccents = ["#5BC8F5", "#F5E642", "#86EFAC", "#C4B5FD", "#FDBA74"];

export default function TermsAndConditionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "rental" | "deposits" | "latefees" | "cancellation">("all");

  const termsSections = [
    {
      id: "rental", category: "rental",
      title: "1. Rental Agreement & Duration Terms",
      icon: "📋", accent: "#5BC8F5",
      content: [
        "All rentals booked through Locare are subject to availability and formal order confirmation.",
        "The rental period begins on the agreed 'Rental Start Date' and concludes at the 'Rental End Date' specified in your booking confirmation.",
        "Customers must inspect all items immediately upon pickup or delivery and report any pre-existing damage within 2 hours of receipt.",
        "Rental items are charged per rental unit (Hourly, Daily, Weekly) as displayed on the product catalog.",
      ],
    },
    {
      id: "deposits", category: "deposits",
      title: "2. Security Deposit & Refund Policy",
      icon: "🔒", accent: "#F5E642",
      content: [
        "A refundable security deposit is collected at checkout for every rental product to protect against loss or severe damage.",
        "Security deposits are held securely in escrow during the active rental period.",
        "Upon successful return inspection, 100% of the deposit is automatically refunded within 24 to 48 business hours.",
        "Any applicable late fees or repair charges will be transparently deducted from the security deposit, with remaining balances refunded.",
      ],
    },
    {
      id: "latefees", category: "latefees",
      title: "3. Late Return Fines & Grace Period",
      icon: "⚠️", accent: "#FDBA74",
      content: [
        "Items must be returned by 8:00 PM on the scheduled Rental End Date.",
        "A standard 1-day grace period is extended to all customers for unforeseen delays.",
        "After the grace period expires, a late fine (default ₹15 / $15 per day) will accumulate automatically until the item is processed in Admin Returns.",
        "If an item is unreturned past 14 days without communication, it will be marked as unrecovered and the full deposit will be forfeited.",
      ],
    },
    {
      id: "cancellation", category: "cancellation",
      title: "4. Cancellation & Booking Modifications",
      icon: "🔄", accent: "#86EFAC",
      content: [
        "Bookings cancelled at least 24 hours prior to the Rental Start Date receive a 100% full refund.",
        "Cancellations made within 24 hours of start time may incur a 15% restocking fee.",
        "Order modifications (e.g. extending rental duration) can be requested through customer support or Admin Order Details prior to return date.",
      ],
    },
  ];

  const filteredSections = termsSections.filter((s) => {
    const matchTab = activeTab === "all" || s.category === activeTab;
    const matchSearch = searchTerm === "" ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.content.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTab && matchSearch;
  });

  const tabs = [
    { id: "all", label: "All Policies" },
    { id: "rental", label: "Rental Terms" },
    { id: "deposits", label: "Deposits" },
    { id: "latefees", label: "Late Fines" },
    { id: "cancellation", label: "Cancellations" },
  ];

  return (
    <div className="static-page">
      <Link href="/customer" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: 28 }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Products
      </Link>

      {/* Hero */}
      <div className="static-hero">
        <div className="accent-chip" style={{ marginBottom: 20 }}>📄 Legal Document</div>
        <h1 className="static-hero-title">
          Terms &amp;<br />
          <span className="static-hero-accent">Conditions.</span>
        </h1>
        <p className="static-hero-sub">
          Last updated: August 2026 · Official Locare Rental Service Agreement
        </p>
      </div>

      {/* Filter bar */}
      <div style={{
        background: "var(--bg)",
        border: "var(--border-thin)",
        borderRadius: 18, padding: "16px 20px",
        marginBottom: 20,
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: 12,
        boxShadow: "var(--shadow)",
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`filter-pill ${activeTab === tab.id ? "filter-pill-active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div style={{ position: "relative" }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "var(--text-muted)", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 14px 8px 34px",
              border: "1.5px solid rgba(13,13,13,0.2)",
              borderRadius: 99,
              fontSize: "0.8rem",
              fontWeight: 500,
              background: "var(--bg-alt)",
              color: "var(--text)",
              outline: "none",
              width: 200,
            }}
          />
        </div>
      </div>

      {/* Sections */}
      {filteredSections.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🔍</span>
          <h3 className="empty-state-title">No Policies Found</h3>
          <p className="empty-state-sub">Try adjusting your search or clearing the filter.</p>
          <button onClick={() => { setSearchTerm(""); setActiveTab("all"); }} className="btn btn-yellow">
            Reset Filters
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filteredSections.map((section) => (
            <div key={section.id} className="static-section" style={{ borderLeft: `4px solid ${section.accent}` }}>
              <div className="static-section-title">
                <span className="section-num" style={{ background: section.accent, fontSize: "0.9rem" }}>{section.icon}</span>
                {section.title}
              </div>
              <ul style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {section.content.map((point, idx) => (
                  <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: section.accent,
                      border: "1.5px solid #0D0D0D",
                      flexShrink: 0, marginTop: 7,
                    }} />
                    <span className="static-body-text" style={{ margin: 0 }}>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Footer CTA */}
      <div style={{
        marginTop: 28, background: "var(--color-dark)",
        border: "var(--border-thin)", borderRadius: 18, padding: "24px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 16, boxShadow: "var(--shadow-lg)",
      }}>
        <div>
          <h4 style={{ color: "#fff", fontWeight: 800, fontSize: "1rem", marginBottom: 4 }}>
            Questions about our policies?
          </h4>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem" }}>
            Our support team is available daily to assist you.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => window.print()} className="btn btn-light btn-sm">🖨️ Print Policy</button>
          <Link href="/customer/contact" className="btn btn-yellow btn-sm">Contact Support →</Link>
        </div>
      </div>
    </div>
  );
}
