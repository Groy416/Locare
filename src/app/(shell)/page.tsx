"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Shield,
  Package,
  Clock,
  BarChart3,
  RefreshCcw,
} from "lucide-react";

/* ── Intersection Observer hook ── */
function useInView(threshold = 0.15): [(node: HTMLElement | null) => void, boolean] {
  const [visible, setVisible] = useState(false);
  const setNode = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      const io = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setVisible(true); },
        { threshold, rootMargin: "0px 0px -60px 0px" }
      );
      io.observe(node);
    },
    [threshold]
  );
  return [setNode, visible];
}

/* ── Animated counter ── */
function AnimatedCounter({ target, suffix = "", prefix = "", duration = 2000 }: {
  target: number; suffix?: string; prefix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const [spanEl, setSpanEl] = useState<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!spanEl) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.5 });
    io.observe(spanEl);
    return () => io.disconnect();
  }, [spanEl]);

  useEffect(() => {
    if (!started) return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, target, duration]);

  return <span ref={setSpanEl}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ── Pixel Art Product Sprites ── */
function PixelSprite({ type, size = 48 }: { type: string; size?: number }) {
  const sprites: Record<string, { bg: string; pixels: string }> = {
    sofa: {
      bg: "#5BC8F5",
      pixels: `
        <rect x="4" y="14" width="24" height="10" rx="2" fill="#5BC8F5"/>
        <rect x="6" y="10" width="20" height="6" rx="1" fill="#93DEFA"/>
        <rect x="2" y="14" width="4" height="12" rx="1" fill="#2AA8D5"/>
        <rect x="26" y="14" width="4" height="12" rx="1" fill="#2AA8D5"/>
        <rect x="6" y="24" width="3" height="4" rx="1" fill="#0D0D0D"/>
        <rect x="23" y="24" width="3" height="4" rx="1" fill="#0D0D0D"/>
      `
    },
    tv: {
      bg: "#F5E642",
      pixels: `
        <rect x="4" y="6" width="24" height="16" rx="2" fill="#0D0D0D"/>
        <rect x="6" y="8" width="20" height="12" rx="1" fill="#F5E642"/>
        <rect x="8" y="10" width="6" height="4" fill="#fff" opacity="0.6"/>
        <rect x="12" y="22" width="8" height="2" rx="0.5" fill="#0D0D0D"/>
        <rect x="10" y="24" width="12" height="2" rx="1" fill="#555"/>
        <circle cx="26" cy="10" r="1" fill="#fff"/>
      `
    },
    laptop: {
      bg: "#86EFAC",
      pixels: `
        <rect x="6" y="8" width="20" height="14" rx="2" fill="#0D0D0D"/>
        <rect x="8" y="10" width="16" height="10" rx="1" fill="#86EFAC"/>
        <rect x="10" y="12" width="5" height="3" fill="#fff" opacity="0.7"/>
        <rect x="10" y="16" width="12" height="1" fill="#fff" opacity="0.4"/>
        <rect x="4" y="22" width="24" height="3" rx="1" fill="#0D0D0D"/>
        <rect x="13" y="23" width="6" height="1" rx="0.5" fill="#555"/>
      `
    },
    gamepad: {
      bg: "#C4B5FD",
      pixels: `
        <rect x="6" y="10" width="20" height="12" rx="6" fill="#C4B5FD"/>
        <rect x="10" y="12" width="4" height="4" rx="0.5" fill="#0D0D0D"/>
        <rect x="11" y="11" width="2" height="6" fill="#fff" opacity="0.7"/>
        <rect x="9" y="13" width="6" height="2" fill="#fff" opacity="0.7"/>
        <circle cx="22" cy="13" r="1.5" fill="#7C3AED"/>
        <circle cx="20" cy="15" r="1.5" fill="#7C3AED"/>
        <circle cx="24" cy="15" r="1.5" fill="#7C3AED"/>
        <circle cx="22" cy="17" r="1.5" fill="#7C3AED"/>
      `
    },
    camera: {
      bg: "#FDBA74",
      pixels: `
        <rect x="6" y="10" width="20" height="14" rx="2" fill="#FDBA74"/>
        <rect x="10" y="6" width="8" height="5" rx="1" fill="#EA580C"/>
        <circle cx="16" cy="17" r="5" fill="#0D0D0D"/>
        <circle cx="16" cy="17" r="3" fill="#fff" opacity="0.5"/>
        <circle cx="16" cy="17" r="1.5" fill="#0D0D0D"/>
        <circle cx="8" cy="12" r="1" fill="#fff"/>
      `
    },
    speaker: {
      bg: "#86EFAC",
      pixels: `
        <rect x="8" y="4" width="16" height="24" rx="3" fill="#0D0D0D"/>
        <circle cx="16" cy="12" r="4" fill="#86EFAC"/>
        <circle cx="16" cy="12" r="2" fill="#0D0D0D"/>
        <circle cx="16" cy="22" r="3" fill="#86EFAC"/>
        <circle cx="16" cy="22" r="1.5" fill="#0D0D0D"/>
        <rect x="12" y="5" width="8" height="2" rx="1" fill="#555" opacity="0.5"/>
      `
    },
    desk: {
      bg: "#FDBA74",
      pixels: `
        <rect x="4" y="10" width="24" height="3" rx="1" fill="#FDBA74"/>
        <rect x="6" y="7" width="6" height="4" rx="1" fill="#fff" opacity="0.5"/>
        <rect x="6" y="13" width="3" height="12" fill="#EA580C"/>
        <rect x="23" y="13" width="3" height="12" fill="#EA580C"/>
        <rect x="6" y="22" width="20" height="2" rx="0.5" fill="#0D0D0D" opacity="0.4"/>
      `
    },
    chair: {
      bg: "#FDA4AF",
      pixels: `
        <rect x="10" y="4" width="12" height="14" rx="2" fill="#FDA4AF"/>
        <rect x="8" y="18" width="16" height="4" rx="2" fill="#E11D48"/>
        <rect x="10" y="22" width="3" height="4" fill="#0D0D0D"/>
        <rect x="19" y="22" width="3" height="4" fill="#0D0D0D"/>
        <rect x="12" y="6" width="8" height="4" rx="1" fill="#fff" opacity="0.3"/>
      `
    },
  };

  const key = type.toLowerCase();
  const sprite = sprites[key] || sprites.sofa;

  return (
    <div style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" width={size} height={size} style={{ imageRendering: "pixelated" }}>
        <g dangerouslySetInnerHTML={{ __html: sprite.pixels }} />
      </svg>
    </div>
  );
}

const marqueeProducts = [
  { name: "Standing Desk Pro", sprite: "desk", price: "$35/mo" },
  { name: "4K Ultra HD TV", sprite: "tv", price: "$25/day" },
  { name: "MacBook Pro M4", sprite: "laptop", price: "$28/day" },
  { name: "PS5 Console Bundle", sprite: "gamepad", price: "$5/hr" },
  { name: "Canon EOS R5", sprite: "camera", price: "$40/day" },
  { name: "Studio Monitor", sprite: "speaker", price: "$15/day" },
  { name: "Comfort Sofa", sprite: "sofa", price: "$45/mo" },
  { name: "Gaming Chair", sprite: "chair", price: "$22/day" },
];

const features = [
  { icon: "🛒", title: "Express Checkout", desc: "Rent in under 60 seconds. Automated address validation and instant reservation.", accent: "#5BC8F5", },
  { icon: "🔒", title: "Deposit Escrow", desc: "Security deposits locked upfront, 100% refunded automatically upon verified return.", accent: "#F5E642", },
  { icon: "⏱️", title: "Flexible Periods", desc: "Hourly, daily, weekly, or multi-year terms with dynamic rate calculations.", accent: "#86EFAC", },
  { icon: "📦", title: "ERP Dashboard", desc: "Manage orders, returns, and asset lifecycle from booking to settlement.", accent: "#C4B5FD", },
  { icon: "📊", title: "Revenue Reports", desc: "Full financial ledger, invoices, and overdue fee engine built-in.", accent: "#FDBA74", },
  { icon: "🔄", title: "Auto Return Flow", desc: "Late-fee calculations and deposit deductions handled automatically on return.", accent: "#FDA4AF", },
];

const steps = [
  { n: "01", title: "Browse & Configure", desc: "Explore our catalog, choose rental duration, configure variant options.", sprite: "tv", accent: "#5BC8F5" },
  { n: "02", title: "Reserve & Checkout", desc: "Secure your reservation with transparent deposit holds and select delivery.", sprite: "laptop", accent: "#F5E642" },
  { n: "03", title: "Return & Settle", desc: "Return equipment at the end of the term and receive instant deposit settlement.", sprite: "sofa", accent: "#86EFAC" },
];

const featuredItems = [
  { id: "prod-001", name: "3-Seater Comfort Sofa", sprite: "sofa", brand: "Ashley", price: "$45", unit: "month", deposit: "$150", accent: "#5BC8F5" },
  { id: "prod-004", name: "Smart 4K Ultra HD TV", sprite: "tv", brand: "Sony", price: "$25", unit: "day", deposit: "$300", accent: "#F5E642" },
  { id: "prod-006", name: "Pro Laptop 15.6\" SSD", sprite: "laptop", brand: "Dell", price: "$20", unit: "day", deposit: "$250", accent: "#86EFAC" },
  { id: "prod-007", name: "PlayStation 5 Bundle", sprite: "gamepad", brand: "Sony", price: "$5", unit: "hour", deposit: "$400", accent: "#C4B5FD" },
];

export default function LandingPage() {
  const [heroRef, isHeroVisible] = useInView(0.1);
  const [featuresRef, isFeaturesVisible] = useInView(0.1);
  const [catalogRef, isCatalogVisible] = useInView(0.1);
  const [stepsRef, isStepsVisible] = useInView(0.1);
  const [ctaRef, isCtaVisible] = useInView(0.1);

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        className="lp-hero"
      >
        <div className="lp-hero__bg">
          <div className="lp-hero__blob lp-hero__blob--blue" />
          <div className="lp-hero__blob lp-hero__blob--yellow" />
          <div className="lp-hero__blob lp-hero__blob--violet" />
        </div>
        <div className={`lp-hero__inner ${isHeroVisible ? "lp-reveal" : "lp-hidden"}`}>
          {/* Badge */}
          <div className="lp-badge">
            <Zap className="w-3.5 h-3.5" />
            ENTERPRISE RENTAL &amp; ERP PLATFORM
          </div>

          {/* Title */}
          <h1 className="lp-hero__title">
            Rent Anything.
            <span className="lp-gradient-text"> Manage Everything.</span>
          </h1>

          {/* Subtitle */}
          <p className="lp-hero__sub">
            Browse premium furniture, IT hardware, AV gear &amp; heavy machinery with
            automated deposit tracking, real-time availability, and instant return settlements.
          </p>

          {/* CTAs */}
          <div className="lp-hero__ctas">
            <Link href="/auth/login?redirect=/customer" className="btn btn-yellow btn-lg">
              Customer Storefront <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/login?redirect=/admin" className="btn btn-dark btn-lg">
              Admin ERP Portal
            </Link>
          </div>

          {/* Pixel sprites */}
          <div className="px-hero-showcase">
            {["sofa","tv","laptop","gamepad","camera"].map((t, i) => (
              <div key={t} className={`px-hero-sprite px-float-${i + 1}`}>
                <PixelSprite type={t} size={52} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="lp-stats-bar">
        <div className="lp-stats-bar__inner">
          {[
            { val: 99.4, suffix: "%", label: "On-Time Returns" },
            { val: 100, suffix: "%", label: "Automated Escrow" },
            { val: 24, suffix: "/7", label: "Self-Service" },
            { val: 500, suffix: "+", label: "Products Listed" },
          ].map((s) => (
            <div className="lp-stat" key={s.label}>
              <span className="lp-stat__num">
                <AnimatedCounter target={s.val} suffix={s.suffix} />
              </span>
              <span className="lp-stat__label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MARQUEE ── */}
      <div className="lp-marquee-section">
        <div className="lp-marquee-track">
          {[...marqueeProducts, ...marqueeProducts].map((p, i) => (
            <div key={i} className="lp-marquee-item">
              <PixelSprite type={p.sprite} size={24} />
              <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>{p.name}</span>
              <span style={{
                background: "var(--yellow)", border: "1.5px solid var(--color-dark)",
                borderRadius: "99px", padding: "1px 10px", fontSize: "0.72rem", fontWeight: 800
              }}>{p.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="lp-features" ref={featuresRef}>
        <div className="container">
          <p className="lp-section-label">▸ BUILT FOR SCALE</p>
          <h2 className={`lp-section-title ${isFeaturesVisible ? "lp-reveal" : "lp-hidden"}`}>
            Everything You Need to<br />Rent &amp; Manage
          </h2>
          <div className="lp-features-grid">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="lp-feature-card"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="lp-feature-icon" style={{ background: f.accent }}>
                  <span style={{ fontSize: "1.4rem" }}>{f.icon}</span>
                </div>
                <h3 className="lp-feature-title">{f.title}</h3>
                <p className="lp-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED CATALOG ── */}
      <section style={{ background: "var(--bg-alt)", borderTop: "var(--border-thin)", borderBottom: "var(--border-thin)", padding: "80px 24px" }} ref={catalogRef}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
            <div>
              <p className="lp-section-label">▸ FEATURED CATALOG</p>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, letterSpacing: "-0.04em" }}>
                Popular Equipment
              </h2>
            </div>
            <Link href="/auth/login?redirect=/customer" className="btn btn-dark btn-sm">
              View Full Catalog →
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {featuredItems.map((item, idx) => (
              <Link
                key={item.id}
                href="/auth/login?redirect=/customer"
                className={`product-card ${isCatalogVisible ? "lp-reveal" : "lp-hidden"}`}
                style={{ textDecoration: "none", color: "inherit", transitionDelay: `${idx * 100}ms` }}
              >
                <div className="product-image" style={{ background: item.accent + "22", borderBottom: "1.5px solid #0D0D0D" }}>
                  <div style={{ padding: 32 }}>
                    <PixelSprite type={item.sprite} size={100} />
                  </div>
                </div>
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>
                      {item.brand}
                    </span>
                    <span style={{
                      background: item.accent, border: "1.5px solid #0D0D0D",
                      borderRadius: 99, padding: "1px 8px", fontSize: "0.65rem", fontWeight: 800
                    }}>In Stock</span>
                  </div>
                  <h3 className="product-name" style={{ marginBottom: 12 }}>{item.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span className="product-price">{item.price}<span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)" }}>/{item.unit}</span></span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)" }}>🔒 {item.deposit} deposit</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-steps" ref={stepsRef}>
        <div className="container">
          <p className="lp-section-label">▸ 3-STEP PROCESS</p>
          <h2 className={`lp-section-title ${isStepsVisible ? "lp-reveal" : "lp-hidden"}`}>
            How Locare Works
          </h2>
          <div className="lp-steps-grid">
            {steps.map((s, i) => (
              <div key={s.n} className="lp-step-card" style={{ transitionDelay: `${i * 120}ms` }}>
                <div className="lp-step-num" style={{ background: s.accent }}>
                  {s.n}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <PixelSprite type={s.sprite} size={40} />
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 800, letterSpacing: "-0.02em" }}>{s.title}</h3>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="lp-cta" ref={ctaRef}>
        <div className={`container ${isCtaVisible ? "lp-reveal" : "lp-hidden"}`}>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
            {["sofa","tv","laptop","gamepad"].map((t) => (
              <div key={t} style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: "var(--radius-md)", padding: 12 }}>
                <PixelSprite type={t} size={44} />
              </div>
            ))}
          </div>
          <h2 className="lp-cta__title">
            Ready to Get<br /><span className="lp-cta__accent">Started?</span>
          </h2>
          <p className="lp-cta__sub">
            Start browsing our equipment catalog or access the admin ERP dashboard today.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth/login?redirect=/customer" className="btn btn-yellow btn-lg">
              Start Renting Now <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/login?redirect=/admin" className="btn btn-light btn-lg">
              Open ERP Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "var(--bg)", borderTop: "var(--border-thin)", padding: "48px 24px 24px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "2fr repeat(3, 1fr)", gap: 32, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div className="logo-mark">L</div>
                <span style={{ fontWeight: 900, fontSize: "1.2rem", letterSpacing: "-0.04em" }}>Locare</span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
                Next-generation equipment rental management &amp; ERP platform.
              </p>
            </div>
            {[
              { title: "Platform", links: [{ label: "Customer Catalog", href: "/auth/login?redirect=/customer" }, { label: "Wishlist", href: "/auth/login?redirect=/customer/wishlist" }, { label: "Cart", href: "/auth/login?redirect=/customer/cart" }] },
              { title: "ERP", links: [{ label: "Orders Dashboard", href: "/auth/login?redirect=/admin" }, { label: "Rentals", href: "/auth/login?redirect=/admin/schedule" }, { label: "Returns", href: "/auth/login?redirect=/admin" }] },
              { title: "Company", links: [{ label: "About Us", href: "/customer/about" }, { label: "Terms", href: "/customer/terms" }, { label: "Contact", href: "/customer/contact" }] },
            ].map((col) => (
              <div key={col.title}>
                <h4 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 14 }}>{col.title}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {col.links.map((l) => (
                    <Link key={l.href} href={l.href} style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text)", opacity: 0.7, transition: "opacity 150ms" }}>
                      {l.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(13,13,13,0.08)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>© {new Date().getFullYear()} Locare Systems Inc.</span>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Built for high-performance equipment rentals.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
