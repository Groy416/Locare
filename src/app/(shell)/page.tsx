"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ProductIcon from "@/components/ProductIcon";

/* ── Intersection Observer hook for scroll-triggered animations ── */
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ── Animated counter that counts up on mount ── */
function AnimatedCounter({ target, suffix = "", prefix = "", duration = 2000 }: {
  target: number; suffix?: string; prefix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ── Floating product marquee data ── */
const marqueeProducts = [
  { name: "Standing Desk Pro", category: "Furniture", price: "$35/mo" },
  { name: "4K Ultra HD TV 65\"", category: "Electronics", price: "$25/day" },
  { name: "MacBook Pro M4", category: "Computers", price: "$28/day" },
  { name: "PS5 Console Bundle", category: "Gaming", price: "$5/hr" },
  { name: "Canon EOS R5 Kit", category: "Cameras", price: "$40/day" },
  { name: "Studio Monitor Pair", category: "Audio", price: "$15/day" },
  { name: "8-Seat Dining Set", category: "Furniture", price: "$60/mo" },
  { name: "Dell XPS 15 Laptop", category: "Computers", price: "$22/day" },
];

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"customer" | "erp">("customer");
  const [tabAnimating, setTabAnimating] = useState(false);

  const hero = useInView(0.1);
  const features = useInView(0.1);
  const catalog = useInView(0.1);
  const steps = useInView(0.1);
  const cta = useInView(0.1);

  const switchTab = useCallback((tab: "customer" | "erp") => {
    if (tab === activeTab) return;
    setTabAnimating(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTabAnimating(false);
    }, 280);
  }, [activeTab]);

  const featuredItems = [
    { id: "prod-001", name: "3-Seater Comfort Sofa", category: "Furniture", brand: "Ashley", price: "$45", unit: "month", deposit: "$150" },
    { id: "prod-004", name: "Smart 4K Ultra HD LED TV", category: "Electronics", brand: "Sony", price: "$25", unit: "day", deposit: "$300" },
    { id: "prod-006", name: "Pro Laptop 15.6\" SSD", category: "Computers", brand: "Dell", price: "$20", unit: "day", deposit: "$250" },
    { id: "prod-007", name: "PlayStation 5 Console Bundle", category: "Gaming", brand: "Sony", price: "$5", unit: "hour", deposit: "$400" },
  ];

  return (
    <div className="landing-root">
      {/* ───── HERO ───── */}
      <section className="lp-hero" ref={hero.ref}>
        <div className="lp-hero__bg">
          <div className="lp-hero__orb lp-hero__orb--1" />
          <div className="lp-hero__orb lp-hero__orb--2" />
          <div className="lp-hero__orb lp-hero__orb--3" />
          <div className="lp-hero__grid" />
          <div className="lp-hero__noise" />
        </div>

        <div className={`page-shell lp-hero__inner ${hero.visible ? "lp-reveal" : "lp-hidden"}`}>
          {/* Badge */}
          <div className="lp-badge" style={{ transitionDelay: "100ms" }}>
            <span className="lp-badge__dot" />
            <span>EQUIPMENT RENTAL & ERP PLATFORM</span>
          </div>

          {/* Title */}
          <h1 className="lp-hero__title" style={{ transitionDelay: "250ms" }}>
            Rent Anything.<br />
            <span className="lp-gradient-text">Manage Everything with Locare.</span>
          </h1>

          {/* Subtitle */}
          <p className="lp-hero__sub" style={{ transitionDelay: "400ms" }}>
            Browse premium furniture, IT hardware, AV gear & heavy machinery with
            automated deposit tracking, real-time availability, and instant return settlements.
          </p>

          {/* CTAs */}
          <div className="lp-hero__ctas" style={{ transitionDelay: "550ms" }}>
            <Link href="/auth/login?redirect=/customer" className="lp-btn lp-btn--primary">
              <span>Get Started</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Link>
            <Link href="/auth/login?redirect=/admin" className="lp-btn lp-btn--glass">
              <span>Admin ERP Demo</span>
            </Link>
          </div>

          {/* Stats */}
          <div className="lp-stats" style={{ transitionDelay: "700ms" }}>
            <div className="lp-stat">
              <div className="lp-stat__value"><AnimatedCounter target={2400000} prefix="$" suffix="+" /></div>
              <div className="lp-stat__label">Deposits Managed</div>
            </div>
            <div className="lp-stat__divider" />
            <div className="lp-stat">
              <div className="lp-stat__value"><AnimatedCounter target={18500} suffix="+" /></div>
              <div className="lp-stat__label">Items Rented</div>
            </div>
            <div className="lp-stat__divider" />
            <div className="lp-stat">
              <div className="lp-stat__value"><AnimatedCounter target={99} suffix=".8%" /></div>
              <div className="lp-stat__label">On-Time Returns</div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── PRODUCT MARQUEE ───── */}
      <div className="lp-marquee-wrap">
        <div className="lp-marquee">
          <div className="lp-marquee__track">
            {[...marqueeProducts, ...marqueeProducts].map((p, i) => (
              <div key={i} className="lp-marquee__item">
                <ProductIcon category={p.category} size="xs" />
                <span className="lp-marquee__name">{p.name}</span>
                <span className="lp-marquee__price">{p.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───── FEATURES BENTO ───── */}
      <section className="lp-section" ref={features.ref}>
        <div className={`page-shell ${features.visible ? "lp-reveal" : "lp-hidden"}`}>
          <div className="lp-section__head">
            <span className="lp-eyebrow">BUILT FOR SCALE</span>
            <h2 className="lp-section__title">Everything You Need to Rent & Manage</h2>
            <p className="lp-section__desc">
              Locare bridges customer rentals with enterprise-grade ERP workflows in one fluid interface.
            </p>

            <div className="lp-tabs" style={{ transitionDelay: "200ms" }}>
              <button className={`lp-tabs__btn ${activeTab === "customer" ? "lp-tabs__btn--active" : ""}`} onClick={() => switchTab("customer")}>
                Customer
              </button>
              <button className={`lp-tabs__btn ${activeTab === "erp" ? "lp-tabs__btn--active" : ""}`} onClick={() => switchTab("erp")}>
                ERP & Admin
              </button>
            </div>
          </div>

          <div className={`lp-bento ${tabAnimating ? "lp-bento--exit" : "lp-bento--enter"}`}>
            {activeTab === "customer" ? (
              <>
                <div className="lp-bento__card lp-bento__card--wide">
                  <div className="lp-bento__icon">⚡</div>
                  <h3>Express Single-Click Checkout</h3>
                  <p>Rent equipment in under 60 seconds with automated address validation and instant order reservation.</p>
                  <span className="lp-chip">Instant Reservation</span>
                </div>
                <div className="lp-bento__card">
                  <div className="lp-bento__icon">🔒</div>
                  <h3>Transparent Deposit Escrow</h3>
                  <p>Security deposits locked upfront, 100% refunded automatically upon return verification.</p>
                </div>
                <div className="lp-bento__card">
                  <div className="lp-bento__icon">⏱️</div>
                  <h3>Flexible Rental Periods</h3>
                  <p>Choose hourly, daily, weekly, or multi-year terms with dynamic rate calculations.</p>
                </div>
                <div className="lp-bento__card lp-bento__card--wide">
                  <div className="lp-bento__icon">🚚</div>
                  <h3>Jobsite Delivery or Pickup</h3>
                  <p>Free jobsite delivery or instant collection at Central Depot Warehouse with live address sync.</p>
                </div>
              </>
            ) : (
              <>
                <div className="lp-bento__card lp-bento__card--wide">
                  <div className="lp-bento__icon">📊</div>
                  <h3>Quotation & Order Pipeline</h3>
                  <p>Manage quotations, convert drafts into confirmed rental orders, track asset lifecycle from booking to return.</p>
                  <span className="lp-chip">ERP Workflow</span>
                </div>
                <div className="lp-bento__card">
                  <div className="lp-bento__icon">🔄</div>
                  <h3>Automated Return & Settlement</h3>
                  <p>Process returns with automatic late-fee calculations and deposit deduction logic.</p>
                </div>
                <div className="lp-bento__card">
                  <div className="lp-bento__icon">📅</div>
                  <h3>Visual Schedule & Kanban</h3>
                  <p>Drag-and-drop rental orders across status stages with calendar availability views.</p>
                </div>
                <div className="lp-bento__card lp-bento__card--wide">
                  <div className="lp-bento__icon">🧾</div>
                  <h3>Invoicing & Financial Audits</h3>
                  <p>Generate printable invoice receipts and full revenue ledger reports.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ───── FEATURED CATALOG ───── */}
      <section className="lp-section lp-section--alt" ref={catalog.ref}>
        <div className={`page-shell ${catalog.visible ? "lp-reveal" : "lp-hidden"}`}>
          <div className="lp-section__head lp-section__head--row">
            <div>
              <span className="lp-eyebrow">FEATURED CATALOG</span>
              <h2 className="lp-section__title">Popular Equipment</h2>
            </div>
            <Link href="/auth/login?redirect=/customer" className="lp-btn lp-btn--ghost lp-btn--sm">
              View Full Catalog →
            </Link>
          </div>

          <div className="lp-product-grid">
            {featuredItems.map((item, idx) => (
              <Link key={item.id} href="/auth/login?redirect=/customer" className="lp-product" style={{ transitionDelay: `${idx * 100 + 150}ms` }}>
                <div className="lp-product__visual">
                  <ProductIcon category={item.category} size="sm" />
                  <div className="lp-product__shine" />
                </div>
                <div className="lp-product__body">
                  <div className="lp-product__meta">
                    <span className="lp-product__sku">REF-{item.id.slice(0, 6).toUpperCase()}</span>
                    <span className="lp-product__brand">{item.brand}</span>
                  </div>
                  <h3 className="lp-product__name">{item.name}</h3>
                  <div className="lp-product__foot">
                    <span className="lp-product__price">{item.price}<small> / {item.unit}</small></span>
                    <span className="lp-product__deposit">🔒 {item.deposit}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section className="lp-section" ref={steps.ref}>
        <div className={`page-shell ${steps.visible ? "lp-reveal" : "lp-hidden"}`}>
          <div className="lp-section__head">
            <span className="lp-eyebrow">3-STEP PROCESS</span>
            <h2 className="lp-section__title">How Locare Works</h2>
          </div>

          <div className="lp-steps">
            {[
              { n: "01", title: "Browse & Configure", desc: "Explore our catalog, choose rental duration and configure variant options." },
              { n: "02", title: "Reserve & Checkout", desc: "Secure your reservation with transparent deposit holds and select delivery." },
              { n: "03", title: "Return & Settle", desc: "Return equipment at the end of the term and receive instant deposit settlement." },
            ].map((s, i) => (
              <div key={s.n} className="lp-step" style={{ transitionDelay: `${i * 150 + 150}ms` }}>
                <div className="lp-step__num">{s.n}</div>
                <div className="lp-step__connector" />
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="lp-section lp-section--cta" ref={cta.ref}>
        <div className={`page-shell ${cta.visible ? "lp-reveal" : "lp-hidden"}`}>
          <div className="lp-cta-card">
            <div className="lp-cta-card__glow" />
            <h2>Ready to Get Started?</h2>
            <p>Start browsing our equipment catalog or access the admin ERP dashboard today.</p>
            <div className="lp-cta-card__btns">
              <Link href="/auth/login?redirect=/customer" className="lp-btn lp-btn--primary lp-btn--lg">
                Start Renting Now →
              </Link>
              <Link href="/auth/login?redirect=/admin" className="lp-btn lp-btn--glass">
                Open ERP Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="lp-footer">
        <div className="page-shell">
          <div className="lp-footer__grid">
            <div className="lp-footer__brand">
              <div className="logo" style={{ marginBottom: 12 }}>
                <div className="logo-badge">L</div>
                <span className="logo-text">Locare</span>
              </div>
              <p>Next-generation equipment rental management & ERP platform.</p>
            </div>
            <div className="lp-footer__col">
              <h4>Platform</h4>
              <Link href="/auth/login?redirect=/customer">Customer Catalog</Link>
              <Link href="/auth/login?redirect=/customer/wishlist">Wishlist</Link>
              <Link href="/auth/login?redirect=/customer/cart">Shopping Cart</Link>
            </div>
            <div className="lp-footer__col">
              <h4>ERP Solution</h4>
              <Link href="/auth/login?redirect=/admin">Orders Dashboard</Link>
              <Link href="/auth/login?redirect=/admin/rentals">Rentals</Link>
              <Link href="/auth/login?redirect=/admin/returns">Returns</Link>
            </div>
            <div className="lp-footer__col">
              <h4>Company</h4>
              <Link href="/customer/about">About Us</Link>
              <Link href="/customer/terms">Terms</Link>
              <Link href="/customer/contact">Contact</Link>
            </div>
          </div>
          <div className="lp-footer__bottom">
            <span>© {new Date().getFullYear()} Locare Systems Inc.</span>
            <span>Built for high-performance equipment rentals.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
