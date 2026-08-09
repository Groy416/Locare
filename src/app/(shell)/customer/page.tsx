"use client";

import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductIcon from "@/components/ProductIcon";

interface AttributeValueRef {
  id: string;
  value: string;
  attribute: { id: string; name: string };
}

interface VariantAttributeValueJoin {
  attributeValue: AttributeValueRef;
}

interface Variant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  attributeValues: VariantAttributeValueJoin[];
}

interface ProductItem {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  imageUrl?: string | null;
  rentalUnit: string;
  price: number;
  securityDeposit: number;
  inStock: number;
  brand?: string;
  variants?: Variant[];
}

interface PagedResponse {
  products: ProductItem[];
  totalCount: number;
  page: number;
  totalPages: number;
}

const PAGE_LIMIT = 20;

// ─── Static filter options (used across all pages for sidebar) ────────────────
const STATIC_CATEGORIES = ["Clothing", "Footwear", "Electronics", "Furniture"];
const STATIC_BRANDS      = ["Zara", "Levis", "Mango", "H&M", "Nike", "Adidas", "Puma", "Reebok", "Sony", "JBL", "Boat", "DJI", "N/A"];
const STATIC_COLORS      = ["Red", "Blue", "Black", "White", "Green", "Yellow", "Silver", "Space Gray", "Brown", "Beige", "Walnut"];

function getColorHex(colorName: string): string {
  const n = colorName.toLowerCase();
  if (n.includes("red"))    return "#ef4444";
  if (n.includes("blue"))   return "#2563eb";
  if (n.includes("black"))  return "#18181b";
  if (n.includes("white"))  return "#ffffff";
  if (n.includes("green"))  return "#10b981";
  if (n.includes("yellow")) return "#eab308";
  if (n.includes("pink"))   return "#ec4899";
  if (n.includes("purple")) return "#8b5cf6";
  if (n.includes("brown"))  return "#78350f";
  if (n.includes("silver")) return "#94a3b8";
  if (n.includes("gray") || n.includes("grey")) return "#64748b";
  if (n.includes("beige"))  return "#d4b996";
  if (n.includes("walnut")) return "#451a03";
  if (n.includes("space"))  return "#475569";
  return "#84cc16";
}

// Build URL for paginated API fetch
function buildApiUrl(page: number): string {
  return `/api/products?page=${page}&limit=${PAGE_LIMIT}`;
}

function CatalogContent() {
  const searchParams  = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  // ── Filter state ──────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand,    setSelectedBrand]    = useState("all");
  const [selectedColor,    setSelectedColor]    = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [maxPrice,         setMaxPrice]         = useState(10000);

  // ── Server-side pagination state ──────────────────────────────────────────
  const [currentPage,  setCurrentPage]  = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalCount,   setTotalCount]   = useState(0);
  const [loading,      setLoading]      = useState(true);

  // Page cache: Map<pageNumber, ProductItem[]>
  const pageCache = useRef<Map<number, ProductItem[]>>(new Map());
  const [displayedProducts, setDisplayedProducts] = useState<ProductItem[]>([]);

  // ── Wishlist ──────────────────────────────────────────────────────────────
  const [wishlistSet, setWishlistSet] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set<number>();
    try {
      const stored = localStorage.getItem("locare_wishlist");
      return stored ? new Set<number>(JSON.parse(stored) as number[]) : new Set<number>();
    } catch { return new Set<number>(); }
  });

  // ── Fetch a single page ───────────────────────────────────────────────────
  const fetchPage = (page: number) => {
    // Cache hit — render instantly
    if (pageCache.current.has(page)) {
      console.log(`[catalog] Cache HIT for page ${page}`);
      setDisplayedProducts(pageCache.current.get(page)!);
      setCurrentPage(page);
      setLoading(false);
      return;
    }

    console.log(`[catalog] Cache MISS — fetching page ${page}`);
    setLoading(true);
    fetch(buildApiUrl(page))
      .then((res) => res.json())
      .then((data: PagedResponse) => {
        if (data && Array.isArray(data.products)) {
          pageCache.current.set(page, data.products);
          setDisplayedProducts(data.products);
          setCurrentPage(page);
          setTotalPages(data.totalPages ?? 1);
          setTotalCount(data.totalCount ?? 0);
        }
      })
      .catch((err) => console.error("Error loading catalog:", err))
      .finally(() => setLoading(false));
  };

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    // Clear cache when filters change
    pageCache.current.clear();
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedBrand, selectedColor, selectedDuration, maxPrice, initialSearch]);

  // ── Client-side filter on displayed products ──────────────────────────────
  // (filters narrow down the current page's products locally)
  const filteredProducts = useMemo(() => {
    return displayedProducts.filter((product) => {
      // Search
      if (
        initialSearch &&
        !product.name.toLowerCase().includes(initialSearch.toLowerCase()) &&
        !product.category.toLowerCase().includes(initialSearch.toLowerCase())
      ) return false;

      // Category
      if (selectedCategory !== "all" && product.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;

      // Brand
      if (selectedBrand !== "all") {
        const hasBrand =
          product.brand?.toLowerCase() === selectedBrand.toLowerCase() ||
          product.variants?.some((v) =>
            v.attributeValues?.some(
              (av) =>
                av.attributeValue?.attribute?.name?.toLowerCase() === "brand" &&
                av.attributeValue?.value?.toLowerCase() === selectedBrand.toLowerCase()
            )
          );
        if (!hasBrand) return false;
      }

      // Price
      if (product.price > maxPrice) return false;

      // Duration
      if (selectedDuration !== "all") {
        if (selectedDuration === "day"  && product.rentalUnit !== "day")  return false;
        if (selectedDuration === "week" && product.rentalUnit !== "week") return false;
        if (selectedDuration === "hour" && product.rentalUnit !== "hour") return false;
      }

      // Color
      if (selectedColor !== "all") {
        const hasColor = product.variants?.some((v) =>
          v.attributeValues?.some(
            (av) =>
              av.attributeValue?.attribute?.name?.toLowerCase() === "color" &&
              av.attributeValue?.value?.toLowerCase() === selectedColor.toLowerCase()
          )
        );
        if (!hasColor) return false;
      }

      return true;
    });
  }, [displayedProducts, initialSearch, selectedCategory, selectedBrand, selectedColor, selectedDuration, maxPrice]);

  // ── Wishlist helpers ──────────────────────────────────────────────────────
  const toggleWishlist = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistSet((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId); else next.add(productId);
      try {
        localStorage.setItem("locare_wishlist", JSON.stringify(Array.from(next)));
        window.dispatchEvent(new Event("wishlist-updated"));
      } catch {}
      return next;
    });
  };

  // ── Filter reset ──────────────────────────────────────────────────────────
  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedColor("all");
    setSelectedDuration("all");
    setMaxPrice(10000);
    // fetchPage(1) will be triggered by the useEffect watching filter state
  };

  // ── Page navigation ───────────────────────────────────────────────────────
  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    fetchPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate compact page number list  (1 … prev cur next … last)
  const pageNumbers = useMemo(() => {
    const delta = 2;
    const range: (number | "…")[] = [];
    let prev = 0;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        if (prev && i - prev > 1) range.push("…");
        range.push(i);
        prev = i;
      }
    }
    return range;
  }, [totalPages, currentPage]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="page-shell animate-fade-in">
      <div className="catalog-layout-grid">
        {/* Left Sidebar Filters */}
        <aside className="catalog-sidebar">
          <div className="sidebar-header" style={{ marginBottom: 12 }}>
            <h2 className="filter-title" style={{ fontSize: "0.85rem", color: "var(--primary-light)" }}>
              FILTER SPECIFICATION
            </h2>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <label className="filter-title">CATEGORY</label>
            <select
              className="filter-select"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); }}
            >
              <option value="all">All Categories</option>
              {STATIC_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div className="filter-group">
            <label className="filter-title">BRAND MANUFACTURER</label>
            <select
              className="filter-select"
              value={selectedBrand}
              onChange={(e) => { setSelectedBrand(e.target.value); }}
            >
              <option value="all">All Manufacturers</option>
              {STATIC_BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Color Swatches */}
          <div className="filter-group">
            <label className="filter-title">COLOR SWATCHES</label>
            <div className="color-swatches-grid flex flex-wrap gap-2">
              <button
                className={`color-swatch-btn ${selectedColor === "all" ? "selected" : ""}`}
                style={{
                  backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border)",
                  borderRadius: "50%", width: "28px", height: "28px",
                  fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                }}
                onClick={() => setSelectedColor("all")}
                title="All Colors"
              >
                ALL
              </button>
              {STATIC_COLORS.map((colorName) => {
                const hex = getColorHex(colorName);
                const isSelected = selectedColor.toLowerCase() === colorName.toLowerCase();
                return (
                  <button
                    key={colorName}
                    className={`color-swatch-btn ${isSelected ? "selected" : ""}`}
                    style={{
                      backgroundColor: hex,
                      border: isSelected ? "2px solid #84cc16" : "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "50%", width: "28px", height: "28px", cursor: "pointer",
                      transition: "transform 0.15s ease",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                    }}
                    onClick={() => setSelectedColor(colorName)}
                    title={colorName}
                  />
                );
              })}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="filter-group">
            <label className="filter-title">RENTAL COMMITMENT</label>
            <select
              className="filter-select"
              value={selectedDuration}
              onChange={(e) => { setSelectedDuration(e.target.value); }}
            >
              <option value="all">All Commitments</option>
              <option value="day">Daily (per Day)</option>
              <option value="week">Weekly (per Week)</option>
              <option value="hour">Hourly (per Hour)</option>
            </select>
          </div>

          {/* Price Slider */}
          <div className="filter-group">
            <label className="filter-title">MAX RENTAL RATE (₹ / $)</label>
            <div className="price-range-slider">
              <input
                type="range"
                className="price-range-input"
                min={5} max={2000} step={5}
                value={maxPrice}
                onChange={(e) => { setMaxPrice(Number(e.target.value)); }}
              />
              <div className="price-range-labels flex justify-between text-xs mt-1 text-slate-400">
                <span>₹5</span>
                <strong style={{ color: "var(--primary-light)" }}>Up to ₹{maxPrice.toLocaleString()}</strong>
                <span>₹2k</span>
              </div>
            </div>
          </div>

          <button
            className="btn btn-ghost btn-sm btn-block"
            style={{ marginTop: 8 }}
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </aside>

        {/* Main Product Grid */}
        <main>
          <div className="catalog-header">
            <div>
              <h1 className="page-title">Product Rental Catalog</h1>
              <p className="page-subtitle">
                {totalCount > 0
                  ? `${totalCount.toLocaleString()} products available — page ${currentPage} of ${totalPages}`
                  : "Explore equipment & items — filter by category, brand, and color."}
              </p>
            </div>
            <div className="catalog-stats">
              <span className="catalog-stat">
                Showing <strong>{filteredProducts.length}</strong>{" "}
                {filteredProducts.length !== displayedProducts.length ? `of ${displayedProducts.length}` : ""} items
              </span>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              Loading rental catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state card" style={{ padding: 40, textAlign: "center" }}>
              <div className="empty-state-icon">🔍</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "12px 0 6px" }}>No Products Found</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                No items matched your selected filters or price cap (₹{maxPrice.toLocaleString()}).
              </p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={handleResetFilters}>
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="card-grid stagger-children">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.inStock === 0;
                const isWishlisted = wishlistSet.has(product.id);
                const skuCode = `REF-${String(product.id).padStart(4, "0")}`;

                const cardColors: string[] = [];
                product.variants?.forEach((v) => {
                  v.attributeValues?.forEach((av) => {
                    if (av.attributeValue?.attribute?.name?.toLowerCase() === "color") {
                      cardColors.push(av.attributeValue.value);
                    }
                  });
                });
                const uniqueCardColors = Array.from(new Set(cardColors));

                return (
                  <Link key={product.id} href={`/customer/products/${product.id}`} className="product-card-link">
                    <article className="card product-card technical-card">
                      <div style={{ position: "relative" }}>
                        {product.imageUrl && product.imageUrl.startsWith("http") ? (
                          <div style={{ width: "100%", height: "140px", overflow: "hidden", borderTopLeftRadius: "var(--radius-md)", borderTopRightRadius: "var(--radius-md)" }}>
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                            />
                          </div>
                        ) : (
                          <ProductIcon category={product.category} size="sm" />
                        )}

                        {isOutOfStock && (
                          <div className="out-of-stock-tech-badge" style={{ background: "#DC2626", color: "#FFFFFF", fontWeight: 800 }}>
                            🔴 SOLD OUT
                          </div>
                        )}

                        <button
                          className="btn btn-ghost btn-sm wishlist-tech-btn"
                          onClick={(e) => toggleWishlist(e, product.id)}
                          title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                        >
                          {isWishlisted ? "♥" : "♡"}
                        </button>
                      </div>

                      <div className="product-card-body">
                        <div className="product-header-line">
                          <span className="sku-mono">{skuCode}</span>
                          <span className="brand-tag">{product.category}</span>
                        </div>

                        <h3 className="product-name">{product.name}</h3>

                        {uniqueCardColors.length > 0 && (
                          <div className="product-card-swatches flex gap-1.5 my-2">
                            {uniqueCardColors.map((colorName, sIdx) => (
                              <span
                                key={sIdx}
                                className="card-swatch-dot"
                                style={{
                                  backgroundColor: getColorHex(colorName),
                                  width: "12px", height: "12px", borderRadius: "50%",
                                  display: "inline-block", border: "1px solid rgba(255,255,255,0.3)",
                                }}
                                title={colorName}
                              />
                            ))}
                          </div>
                        )}

                        <div className="product-price-row" style={{ marginTop: 12 }}>
                          <div className="product-price">
                            ₹{product.price}
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                              {" "}/ per {product.rentalUnit}
                            </span>
                          </div>
                        </div>

                        <div className="product-meta" style={{ marginTop: 10 }}>
                          <span className="product-deposit-badge">🔒 ₹{product.securityDeposit} deposit</span>
                          <span
                            className={`product-stock ${!isOutOfStock ? "in-stock" : "out-of-stock"}`}
                            style={{ fontWeight: isOutOfStock ? 800 : 600 }}
                          >
                            {!isOutOfStock ? `${product.inStock} in stock` : "SOLD OUT"}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <button
                className="page-num-btn"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {pageNumbers.map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} style={{ padding: "0 6px", color: "var(--text-muted)" }}>…</span>
                ) : (
                  <button
                    key={p}
                    className={`page-num-btn ${currentPage === p ? "active" : ""}`}
                    onClick={() => goToPage(p as number)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="page-num-btn"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>

              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: 8 }}>
                {totalCount.toLocaleString()} total
              </span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CustomerCatalogPage() {
  return (
    <Suspense fallback={<div className="page-shell"><p>Loading catalog...</p></div>}>
      <CatalogContent />
    </Suspense>
  );
}
