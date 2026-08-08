"use client";

import { useState } from "react";
import Link from "next/link";
import ProductIcon from "@/components/ProductIcon";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"customer" | "erp">("customer");

  const featuredItems = [
    {
      id: "prod-001",
      name: "3-Seater Comfort Sofa",
      category: "Furniture",
      brand: "Ashley",
      price: "$45",
      unit: "month",
      deposit: "$150",
    },
    {
      id: "prod-004",
      name: "Smart 4K Ultra HD LED TV",
      category: "Electronics",
      brand: "Sony",
      price: "$25",
      unit: "day",
      deposit: "$300",
    },
    {
      id: "prod-006",
      name: "Pro Laptop 15.6 inch SSD",
      category: "Computers",
      brand: "Dell",
      price: "$20",
      unit: "day",
      deposit: "$250",
    },
    {
      id: "prod-007",
      name: "PlayStation 5 Console Bundle",
      category: "Gaming",
      brand: "Sony",
      price: "$5",
      unit: "hour",
      deposit: "$400",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased overflow-x-hidden">
      {/* ─── Hero Section with Glow Animation & Dynamic Visuals ─────────────── */}
      <section className="hero-landing-section">
        <div className="hero-landing-bg">
          <div className="hero-glow hero-glow-1" />
          <div className="hero-glow hero-glow-2" />
          <div className="hero-grid-pattern" />
        </div>

        <div className="page-shell hero-landing-content">
          <div className="hero-pill-badge animate-fade-in">
            <span className="badge-pulse" />
            <span>NEXT-GEN RENTAL & ERP PLATFORM</span>
          </div>

          <h1 className="hero-landing-title animate-fade-in">
            Rent Anything. <br />
            <span className="hero-gradient-text">Manage Seamlessly with Locare.</span>
          </h1>

          <p className="hero-landing-subtitle animate-fade-in">
            The unified equipment rental ecosystem. Browse premium furniture, IT hardware, AV gear, & heavy machinery with automated deposit tracking, real-time availability, and instant return settlements.
          </p>

          <div className="hero-landing-ctas animate-fade-in">
            <Link href="/customer" className="btn btn-primary btn-lg hero-btn-glow">
              Explore Equipment Catalog →
            </Link>
            <Link href="/admin" className="btn btn-ghost btn-lg hero-btn-glass">
              🛡️ Launch Admin ERP Demo
            </Link>
          </div>

          {/* Interactive Stat Cards Grid */}
          <div className="hero-stats-grid stagger-children">
            <div className="hero-stat-card card">
              <div className="stat-icon">🔒</div>
              <div className="stat-number">$2.4M+</div>
              <div className="stat-label">Security Deposits Held & Auto-Refunded</div>
            </div>

            <div className="hero-stat-card card">
              <div className="stat-icon">📦</div>
              <div className="stat-number">18,500+</div>
              <div className="stat-label">Equipment Items Rented Successfully</div>
            </div>

            <div className="hero-stat-card card">
              <div className="stat-icon">⚡</div>
              <div className="stat-number">99.8%</div>
              <div className="stat-label">On-Time Depot & Jobsite Return Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Interactive Feature Bento Grid Section ─────────────────────────── */}
      <section className="landing-section">
        <div className="page-shell">
          <div className="section-header center">
            <span className="section-eyebrow">BUILT FOR SCALE</span>
            <h2 className="section-title">Everything You Need to Rent & Manage</h2>
            <p className="section-description">
              Locare bridges customer rentals with enterprise-grade ERP workflows in one fluid interface.
            </p>

            {/* Toggle Switch between Customer & ERP Features */}
            <div className="landing-tab-toggle" style={{ marginTop: 24 }}>
              <button
                className={`tab-toggle-btn ${activeTab === "customer" ? "active" : ""}`}
                onClick={() => setActiveTab("customer")}
              >
                👤 Customer Experience
              </button>
              <button
                className={`tab-toggle-btn ${activeTab === "erp" ? "active" : ""}`}
                onClick={() => setActiveTab("erp")}
              >
                🛡️ ERP & Asset Management
              </button>
            </div>
          </div>

          {activeTab === "customer" ? (
            <div className="bento-grid stagger-children">
              <div className="bento-card bento-card-lg card">
                <div className="bento-icon">⚡</div>
                <h3>Express Single-Click Checkout</h3>
                <p>
                  Rent equipment in under 60 seconds with automated address validation, demo card processing, and instant order reservation ID generation (SO00010).
                </p>
                <div className="bento-tag">Instant Reservation</div>
              </div>

              <div className="bento-card card">
                <div className="bento-icon">🔒</div>
                <h3>Transparent Deposit Escrow</h3>
                <p>
                  Security deposits are locked transparently upfront and 100% refunded automatically upon item return verification.
                </p>
              </div>

              <div className="bento-card card">
                <div className="bento-icon">⏱️</div>
                <h3>Flexible Rental Periods</h3>
                <p>
                  Choose hourly, daily, weekly, or multi-year terms with dynamic rate calculations.
                </p>
              </div>

              <div className="bento-card bento-card-lg card">
                <div className="bento-icon">🚚</div>
                <h3>Jobsite Delivery or Store Pickup</h3>
                <p>
                  Select free jobsite delivery or collect instantly at Central Depot Warehouse with live address sync.
                </p>
              </div>
            </div>
          ) : (
            <div className="bento-grid stagger-children">
              <div className="bento-card bento-card-lg card">
                <div className="bento-icon">📊</div>
                <h3>Odoo-Style Quotation & Order Pipeline</h3>
                <p>
                  Manage quotations, convert drafts into confirmed rental orders, and track asset lifecycle from booking to return.
                </p>
                <div className="bento-tag">ERP Workflow</div>
              </div>

              <div className="bento-card card">
                <div className="bento-icon">🔄</div>
                <h3>Automated Return & Settlement</h3>
                <p>
                  Process equipment returns with automatic late-fee calculations ($15/day after grace period) and deposit deduction.
                </p>
              </div>

              <div className="bento-card card">
                <div className="bento-icon">📅</div>
                <h3>Visual Schedule & Kanban Board</h3>
                <p>
                  Drag-and-drop rental orders across status stages with calendar availability views.
                </p>
              </div>

              <div className="bento-card bento-card-lg card">
                <div className="bento-icon">🧾</div>
                <h3>Invoicing & Financial Audits</h3>
                <p>
                  Generate printable invoice receipts with PDF print media queries and full revenue ledger reports.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── Featured Catalog Showcase ────────────────────────────────────── */}
      <section className="landing-section bg-surface-elevated">
        <div className="page-shell">
          <div className="section-header">
            <div>
              <span className="section-eyebrow">FEATURED CATALOG</span>
              <h2 className="section-title">Popular Equipment Ready for Instant Booking</h2>
            </div>
            <Link href="/customer" className="btn btn-ghost btn-sm">
              View Full Catalog →
            </Link>
          </div>

          <div className="card-grid stagger-children">
            {featuredItems.map((item) => (
              <Link
                key={item.id}
                href={`/customer/products/${item.id}`}
                className="product-card-link"
              >
                <article className="card product-card technical-card">
                  <ProductIcon category={item.category} size="sm" />
                  <div className="product-card-body">
                    <div className="product-header-line">
                      <span className="sku-mono">REF-{item.id.slice(0, 6).toUpperCase()}</span>
                      <span className="brand-tag">{item.brand}</span>
                    </div>
                    <h3 className="product-name">{item.name}</h3>
                    <div className="product-price-row" style={{ marginTop: 12 }}>
                      <div className="product-price">
                        {item.price}
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                          {" "}
                          / per {item.unit}
                        </span>
                      </div>
                    </div>
                    <div className="product-meta" style={{ marginTop: 10 }}>
                      <span className="product-deposit-badge">
                        🔒 {item.deposit} deposit
                      </span>
                      <span className="product-stock in-stock">• Ready to Book</span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3-Step How It Works Section ──────────────────────────────────── */}
      <section className="landing-section">
        <div className="page-shell">
          <div className="section-header center">
            <span className="section-eyebrow">SIMPLE 3-STEP PROCESS</span>
            <h2 className="section-title">How Locare Works</h2>
          </div>

          <div className="steps-grid stagger-children">
            <div className="step-card card">
              <div className="step-number">01</div>
              <h3>Browse & Configure</h3>
              <p>
                Explore our catalog, choose rental duration (hour, day, month), and configure variant options.
              </p>
            </div>

            <div className="step-card card">
              <div className="step-number">02</div>
              <h3>Reserve & Checkout</h3>
              <p>
                Secure your reservation with transparent deposit holds and select jobsite delivery or store pickup.
              </p>
            </div>

            <div className="step-card card">
              <div className="step-number">03</div>
              <h3>Return & Settle</h3>
              <p>
                Return equipment at the end of the term and receive 100% instant security deposit settlement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Call to Action Banner ────────────────────────────────────────── */}
      <section className="landing-cta-section">
        <div className="page-shell">
          <div className="landing-cta-card card">
            <div className="landing-cta-content">
              <h2>Ready to Rent Equipment or Manage Your Fleet?</h2>
              <p>
                Start browsing our equipment catalog or access the admin ERP dashboard today.
              </p>
              <div className="landing-cta-buttons">
                <Link href="/customer" className="btn btn-primary btn-lg hero-btn-glow">
                  Start Renting Now →
                </Link>
                <Link href="/admin" className="btn btn-ghost btn-lg">
                  Open ERP Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="page-shell">
          <div className="footer-inner">
            <div className="footer-col">
              <div className="logo" style={{ marginBottom: 12 }}>
                <div className="logo-badge">L</div>
                <span className="logo-text">Locare</span>
              </div>
              <p className="footer-tagline">
                Next-generation equipment rental management & ERP platform.
              </p>
            </div>

            <div className="footer-col">
              <h4>Platform</h4>
              <Link href="/customer">Customer Catalog</Link>
              <Link href="/customer/wishlist">Wishlist</Link>
              <Link href="/customer/cart">Shopping Cart</Link>
              <Link href="/customer/checkout">Checkout</Link>
            </div>

            <div className="footer-col">
              <h4>ERP Solution</h4>
              <Link href="/admin">Orders Dashboard</Link>
              <Link href="/admin/rentals">Rentals</Link>
              <Link href="/admin/returns">Returns Processing</Link>
              <Link href="/admin/invoices">Invoicing</Link>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <Link href="/customer/about">About Us</Link>
              <Link href="/customer/terms">Terms & Conditions</Link>
              <Link href="/customer/contact">Contact Us</Link>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Locare Systems Inc. All rights reserved.</span>
            <span>Built for high-performance equipment rentals & ERP automation.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
