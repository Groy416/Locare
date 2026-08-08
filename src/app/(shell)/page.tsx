"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

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
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [started, target, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ── Pixel Art Product Sprites (inline SVG, 32x32 grid) ── */
function PixelSprite({ type, size = 48 }: { type: string; size?: number }) {
  const sprites: Record<string, { bg: string; pixels: string }> = {
    sofa: {
      bg: "#5B8731",
      pixels: `
        <rect x="4" y="14" width="24" height="10" rx="2" fill="#7CCC19"/>
        <rect x="6" y="10" width="20" height="6" rx="1" fill="#A8E66A"/>
        <rect x="2" y="14" width="4" height="12" rx="1" fill="#5B8731"/>
        <rect x="26" y="14" width="4" height="12" rx="1" fill="#5B8731"/>
        <rect x="6" y="24" width="3" height="4" rx="1" fill="#3D6B1E"/>
        <rect x="23" y="24" width="3" height="4" rx="1" fill="#3D6B1E"/>
        <rect x="14" y="12" width="4" height="2" rx="0.5" fill="#E8F5D6" opacity="0.6"/>
      `
    },
    tv: {
      bg: "#06b6d4",
      pixels: `
        <rect x="4" y="6" width="24" height="16" rx="2" fill="#0e7490"/>
        <rect x="6" y="8" width="20" height="12" rx="1" fill="#22d3ee"/>
        <rect x="8" y="10" width="6" height="4" fill="#a5f3fc" opacity="0.6"/>
        <rect x="12" y="22" width="8" height="2" rx="0.5" fill="#0891b2"/>
        <rect x="10" y="24" width="12" height="2" rx="1" fill="#06b6d4"/>
        <circle cx="26" cy="10" r="1" fill="#67e8f9"/>
      `
    },
    laptop: {
      bg: "#38bdf8",
      pixels: `
        <rect x="6" y="8" width="20" height="14" rx="2" fill="#0284c7"/>
        <rect x="8" y="10" width="16" height="10" rx="1" fill="#38bdf8"/>
        <rect x="10" y="12" width="5" height="3" fill="#bae6fd" opacity="0.7"/>
        <rect x="10" y="16" width="12" height="1" fill="#e0f2fe" opacity="0.5"/>
        <rect x="4" y="22" width="24" height="3" rx="1" fill="#0369a1"/>
        <rect x="13" y="23" width="6" height="1" rx="0.5" fill="#38bdf8"/>
      `
    },
    gamepad: {
      bg: "#ec4899",
      pixels: `
        <rect x="6" y="10" width="20" height="12" rx="6" fill="#db2777"/>
        <rect x="10" y="12" width="4" height="4" rx="0.5" fill="#f472b6"/>
        <rect x="11" y="11" width="2" height="6" fill="#fce7f3" opacity="0.7"/>
        <rect x="9" y="13" width="6" height="2" fill="#fce7f3" opacity="0.7"/>
        <circle cx="22" cy="13" r="1.5" fill="#f9a8d4"/>
        <circle cx="20" cy="15" r="1.5" fill="#f9a8d4"/>
        <circle cx="24" cy="15" r="1.5" fill="#f9a8d4"/>
        <circle cx="22" cy="17" r="1.5" fill="#f9a8d4"/>
        <rect x="14" y="16" width="4" height="1.5" rx="0.75" fill="#831843" opacity="0.5"/>
      `
    },
    camera: {
      bg: "#f59e0b",
      pixels: `
        <rect x="6" y="10" width="20" height="14" rx="2" fill="#d97706"/>
        <rect x="10" y="6" width="8" height="5" rx="1" fill="#b45309"/>
        <circle cx="16" cy="17" r="5" fill="#fbbf24"/>
        <circle cx="16" cy="17" r="3" fill="#78350f"/>
        <circle cx="16" cy="17" r="1.5" fill="#fde68a"/>
        <rect x="22" y="12" width="3" height="2" rx="0.5" fill="#92400e"/>
        <circle cx="8" cy="12" r="1" fill="#fcd34d"/>
      `
    },
    speaker: {
      bg: "#10b981",
      pixels: `
        <rect x="8" y="4" width="16" height="24" rx="3" fill="#047857"/>
        <circle cx="16" cy="12" r="4" fill="#34d399"/>
        <circle cx="16" cy="12" r="2" fill="#065f46"/>
        <circle cx="16" cy="22" r="3" fill="#34d399"/>
        <circle cx="16" cy="22" r="1.5" fill="#065f46"/>
        <rect x="12" y="5" width="8" height="2" rx="1" fill="#6ee7b7" opacity="0.4"/>
      `
    },
    desk: {
      bg: "#f97316",
      pixels: `
        <rect x="4" y="10" width="24" height="3" rx="1" fill="#ea580c"/>
        <rect x="6" y="7" width="6" height="4" rx="1" fill="#fdba74" opacity="0.6"/>
        <rect x="6" y="13" width="3" height="12" fill="#c2410c"/>
        <rect x="23" y="13" width="3" height="12" fill="#c2410c"/>
        <rect x="6" y="22" width="20" height="2" rx="0.5" fill="#9a3412" opacity="0.5"/>
        <rect x="14" y="8" width="8" height="2" rx="0.5" fill="#fb923c" opacity="0.4"/>
      `
    },
    chair: {
      bg: "#ef4444",
      pixels: `
        <rect x="10" y="4" width="12" height="14" rx="2" fill="#dc2626"/>
        <rect x="8" y="18" width="16" height="4" rx="2" fill="#b91c1c"/>
        <rect x="10" y="22" width="3" height="4" fill="#991b1b"/>
        <rect x="19" y="22" width="3" height="4" fill="#991b1b"/>
        <rect x="12" y="6" width="8" height="4" rx="1" fill="#fca5a5" opacity="0.3"/>
        <rect x="14" y="26" width="4" height="2" rx="1" fill="#7f1d1d"/>
      `
    },
  };

  const key = type.toLowerCase();
  const sprite = sprites[key] || sprites.sofa;

  return (
    <div className="px-sprite" style={{ width: size, height: size }}>
      <svg viewBox="0 0 32 32" width={size} height={size} style={{ imageRendering: "pixelated" }}>
        <defs>
          <filter id={`px-shadow-${key}`}>
            <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor={sprite.bg} floodOpacity="0.4" />
          </filter>
        </defs>
        <g filter={`url(#px-shadow-${key})`} dangerouslySetInnerHTML={{ __html: sprite.pixels }} />
      </svg>
    </div>
  );
}

/* ── Floating pixel particles ── */
function PixelParticles() {
  return (
    <div className="px-particles" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="px-particle"
          style={{
            left: `${8 + (i * 7.5) % 90}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${6 + (i % 4) * 2}s`,
            width: `${4 + (i % 3) * 2}px`,
            height: `${4 + (i % 3) * 2}px`,
            background: ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#22d3ee', '#a78bfa'][(i % 6)],
          }}
        />
      ))}
    </div>
  );
}

/* ── Marquee data ── */
const marqueeProducts = [
  { name: "Standing Desk Pro", sprite: "desk", price: "$35/mo" },
  { name: "4K Ultra HD TV 65\"", sprite: "tv", price: "$25/day" },
  { name: "MacBook Pro M4", sprite: "laptop", price: "$28/day" },
  { name: "PS5 Console Bundle", sprite: "gamepad", price: "$5/hr" },
  { name: "Canon EOS R5", sprite: "camera", price: "$40/day" },
  { name: "Studio Monitor", sprite: "speaker", price: "$15/day" },
  { name: "Comfort Sofa", sprite: "sofa", price: "$45/mo" },
  { name: "Gaming Chair", sprite: "chair", price: "$22/day" },
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
    { id: "prod-001", name: "3-Seater Comfort Sofa", sprite: "sofa", brand: "Ashley", price: "$45", unit: "month", deposit: "$150", color: "#5B8731" },
    { id: "prod-004", name: "Smart 4K Ultra HD LED TV", sprite: "tv", brand: "Sony", price: "$25", unit: "day", deposit: "$300", color: "#06b6d4" },
    { id: "prod-006", name: "Pro Laptop 15.6\" SSD", sprite: "laptop", brand: "Dell", price: "$20", unit: "day", deposit: "$250", color: "#38bdf8" },
    { id: "prod-007", name: "PlayStation 5 Bundle", sprite: "gamepad", brand: "Sony", price: "$5", unit: "hour", deposit: "$400", color: "#ec4899" },
  ];

  return (
    <div className="landing-root px-landing">
      {/* ───── HERO ───── */}
      <section className="lp-hero" ref={hero.ref}>
        <div className="lp-hero__bg">
          <div className="lp-hero__orb lp-hero__orb--1" />
          <div className="lp-hero__orb lp-hero__orb--2" />
          <div className="lp-hero__orb lp-hero__orb--3" />
          <div className="px-grid-bg" />
          <PixelParticles />
        </div>

        <div className={`page-shell lp-hero__inner ${hero.visible ? "lp-reveal" : "lp-hidden"}`}>
          {/* Badge */}
          <div className="lp-badge px-badge" style={{ transitionDelay: "100ms" }}>
            <span className="lp-badge__dot px-dot" />
            <span>▸ EQUIPMENT RENTAL & ERP PLATFORM</span>
          </div>

          {/* Title */}
          <h1 className="lp-hero__title" style={{ transitionDelay: "250ms" }}>
            Rent Anything.<br />
            <span className="lp-gradient-text px-gradient">Manage Everything with Locare.</span>
          </h1>

          {/* Subtitle */}
          <p className="lp-hero__sub" style={{ transitionDelay: "400ms" }}>
            Browse premium furniture, IT hardware, AV gear & heavy machinery with
            automated deposit tracking, real-time availability, and instant return settlements.
          </p>

          {/* CTAs */}
          <div className="lp-hero__ctas" style={{ transitionDelay: "550ms" }}>
            <Link href="/auth/login?redirect=/customer" className="lp-btn lp-btn--primary px-btn">
              <span>▶ Get Started</span>
            </Link>
            <Link href="/auth/login?redirect=/admin" className="lp-btn lp-btn--glass px-btn">
              <span>◈ Admin ERP Demo</span>
            </Link>
          </div>

          {/* Pixel Art Hero Showcase */}
          <div className="px-hero-showcase" style={{ transitionDelay: "650ms" }}>
            <div className="px-hero-sprite px-float-1"><PixelSprite type="sofa" size={64} /></div>
            <div className="px-hero-sprite px-float-2"><PixelSprite type="tv" size={72} /></div>
            <div className="px-hero-sprite px-float-3"><PixelSprite type="laptop" size={56} /></div>
            <div className="px-hero-sprite px-float-4"><PixelSprite type="gamepad" size={52} /></div>
            <div className="px-hero-sprite px-float-5"><PixelSprite type="camera" size={48} /></div>
          </div>

          {/* Stats */}
          <div className="lp-stats px-stats" style={{ transitionDelay: "800ms" }}>
            <div className="lp-stat">
              <div className="lp-stat__value"><AnimatedCounter target={2400000} prefix="$" suffix="+" /></div>
              <div className="lp-stat__label">Deposits Managed</div>
            </div>
            <div className="lp-stat__divider px-divider" />
            <div className="lp-stat">
              <div className="lp-stat__value"><AnimatedCounter target={18500} suffix="+" /></div>
              <div className="lp-stat__label">Items Rented</div>
            </div>
            <div className="lp-stat__divider px-divider" />
            <div className="lp-stat">
              <div className="lp-stat__value"><AnimatedCounter target={99} suffix=".8%" /></div>
              <div className="lp-stat__label">On-Time Returns</div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── PRODUCT MARQUEE ───── */}
      <div className="lp-marquee-wrap px-marquee-wrap">
        <div className="lp-marquee">
          <div className="lp-marquee__track">
            {[...marqueeProducts, ...marqueeProducts].map((p, i) => (
              <div key={i} className="lp-marquee__item px-marquee-item">
                <PixelSprite type={p.sprite} size={28} />
                <span className="lp-marquee__name">{p.name}</span>
                <span className="lp-marquee__price px-price-tag">{p.price}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ───── FEATURES BENTO ───── */}
      <section className="lp-section" ref={features.ref}>
        <div className={`page-shell ${features.visible ? "lp-reveal" : "lp-hidden"}`}>
          <div className="lp-section__head">
            <span className="lp-eyebrow px-eyebrow">▸ BUILT FOR SCALE</span>
            <h2 className="lp-section__title">Everything You Need to Rent & Manage</h2>
            <p className="lp-section__desc">
              Locare bridges customer rentals with enterprise-grade ERP workflows in one fluid interface.
            </p>

            <div className="lp-tabs px-tabs" style={{ transitionDelay: "200ms" }}>
              <button className={`lp-tabs__btn px-tab ${activeTab === "customer" ? "lp-tabs__btn--active" : ""}`} onClick={() => switchTab("customer")}>
                ◇ Customer
              </button>
              <button className={`lp-tabs__btn px-tab ${activeTab === "erp" ? "lp-tabs__btn--active" : ""}`} onClick={() => switchTab("erp")}>
                ◈ ERP & Admin
              </button>
            </div>
          </div>

          <div className={`lp-bento ${tabAnimating ? "lp-bento--exit" : "lp-bento--enter"}`}>
            {activeTab === "customer" ? (
              <>
                <div className="lp-bento__card lp-bento__card--wide px-card">
                  <div className="px-card-icon">
                    <PixelSprite type="sofa" size={40} />
                  </div>
                  <h3>Express Single-Click Checkout</h3>
                  <p>Rent equipment in under 60 seconds with automated address validation and instant order reservation.</p>
                  <span className="lp-chip px-chip">▸ Instant Reservation</span>
                </div>
                <div className="lp-bento__card px-card">
                  <div className="px-card-icon">
                    <PixelSprite type="camera" size={36} />
                  </div>
                  <h3>Transparent Deposit Escrow</h3>
                  <p>Security deposits locked upfront, 100% refunded automatically upon return verification.</p>
                </div>
                <div className="lp-bento__card px-card">
                  <div className="px-card-icon">
                    <PixelSprite type="speaker" size={36} />
                  </div>
                  <h3>Flexible Rental Periods</h3>
                  <p>Choose hourly, daily, weekly, or multi-year terms with dynamic rate calculations.</p>
                </div>
                <div className="lp-bento__card lp-bento__card--wide px-card">
                  <div className="px-card-icon">
                    <PixelSprite type="desk" size={40} />
                  </div>
                  <h3>Jobsite Delivery or Pickup</h3>
                  <p>Free jobsite delivery or instant collection at Central Depot Warehouse with live address sync.</p>
                </div>
              </>
            ) : (
              <>
                <div className="lp-bento__card lp-bento__card--wide px-card">
                  <div className="px-card-icon">
                    <PixelSprite type="laptop" size={40} />
                  </div>
                  <h3>Quotation & Order Pipeline</h3>
                  <p>Manage quotations, convert drafts into confirmed rental orders, track asset lifecycle from booking to return.</p>
                  <span className="lp-chip px-chip">▸ ERP Workflow</span>
                </div>
                <div className="lp-bento__card px-card">
                  <div className="px-card-icon">
                    <PixelSprite type="tv" size={36} />
                  </div>
                  <h3>Automated Return & Settlement</h3>
                  <p>Process returns with automatic late-fee calculations and deposit deduction logic.</p>
                </div>
                <div className="lp-bento__card px-card">
                  <div className="px-card-icon">
                    <PixelSprite type="gamepad" size={36} />
                  </div>
                  <h3>Visual Schedule & Kanban</h3>
                  <p>Drag-and-drop rental orders across status stages with calendar availability views.</p>
                </div>
                <div className="lp-bento__card lp-bento__card--wide px-card">
                  <div className="px-card-icon">
                    <PixelSprite type="chair" size={40} />
                  </div>
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
              <span className="lp-eyebrow px-eyebrow">▸ FEATURED CATALOG</span>
              <h2 className="lp-section__title">Popular Equipment</h2>
            </div>
            <Link href="/auth/login?redirect=/customer" className="lp-btn lp-btn--ghost lp-btn--sm px-btn">
              View Full Catalog →
            </Link>
          </div>

          <div className="lp-product-grid">
            {featuredItems.map((item, idx) => (
              <Link key={item.id} href="/auth/login?redirect=/customer" className="lp-product px-product-card" style={{ transitionDelay: `${idx * 100 + 150}ms` }}>
                <div className="lp-product__visual px-product-visual" style={{ borderBottom: `3px solid ${item.color}` }}>
                  <PixelSprite type={item.sprite} size={80} />
                  <div className="lp-product__shine" />
                </div>
                <div className="lp-product__body">
                  <div className="lp-product__meta">
                    <span className="lp-product__sku">REF-{item.id.slice(0, 6).toUpperCase()}</span>
                    <span className="lp-product__brand" style={{ color: item.color }}>{item.brand}</span>
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
            <span className="lp-eyebrow px-eyebrow">▸ 3-STEP PROCESS</span>
            <h2 className="lp-section__title">How Locare Works</h2>
          </div>

          <div className="lp-steps">
            {[
              { n: "01", title: "Browse & Configure", desc: "Explore our catalog, choose rental duration and configure variant options.", sprite: "tv" },
              { n: "02", title: "Reserve & Checkout", desc: "Secure your reservation with transparent deposit holds and select delivery.", sprite: "laptop" },
              { n: "03", title: "Return & Settle", desc: "Return equipment at the end of the term and receive instant deposit settlement.", sprite: "sofa" },
            ].map((s, i) => (
              <div key={s.n} className="lp-step px-step" style={{ transitionDelay: `${i * 150 + 150}ms` }}>
                <div className="px-step-header">
                  <div className="lp-step__num">{s.n}</div>
                  <PixelSprite type={s.sprite} size={36} />
                </div>
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
          <div className="lp-cta-card px-cta">
            <div className="lp-cta-card__glow" />
            <div className="px-cta-sprites">
              <PixelSprite type="sofa" size={44} />
              <PixelSprite type="tv" size={44} />
              <PixelSprite type="laptop" size={44} />
              <PixelSprite type="gamepad" size={44} />
            </div>
            <h2>Ready to Get Started?</h2>
            <p>Start browsing our equipment catalog or access the admin ERP dashboard today.</p>
            <div className="lp-cta-card__btns">
              <Link href="/auth/login?redirect=/customer" className="lp-btn lp-btn--primary lp-btn--lg px-btn">
                ▶ Start Renting Now
              </Link>
              <Link href="/auth/login?redirect=/admin" className="lp-btn lp-btn--glass px-btn">
                ◈ Open ERP Dashboard
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
                <div className="logo-badge px-logo-badge">L</div>
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
