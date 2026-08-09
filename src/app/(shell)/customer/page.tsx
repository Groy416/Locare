"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductIcon from "@/components/ProductIcon";
import { SlidersHorizontal, Heart, Search, RotateCcw } from "lucide-react";

interface AttributeValueRef {
  id: string;
  value: string;
  attribute: { id: string; name: string };
}
interface VariantAttributeValueJoin { attributeValue: AttributeValueRef; }
interface Variant { id: string; sku: string; price: number; stock: number; attributeValues: VariantAttributeValueJoin[]; }
interface ProductItem {
  id: number; name: string; description: string; category: string;
  image: string; imageUrl?: string | null; rentalUnit: string;
  price: number; securityDeposit: number; inStock: number; brand?: string; variants?: Variant[];
}

const accentColors = ["#5BC8F5", "#F5E642", "#86EFAC", "#C4B5FD", "#FDBA74", "#FDA4AF"];

function getAccent(id: number): string {
  return accentColors[id % accentColors.length];
}

function getColorHex(colorName: string): string {
  const n = colorName.toLowerCase();
  if (n.includes("red")) return "#FDA4AF";
  if (n.includes("blue")) return "#5BC8F5";
  if (n.includes("black")) return "#0D0D0D";
  if (n.includes("white")) return "#F5F4EF";
  if (n.includes("green")) return "#86EFAC";
  if (n.includes("yellow")) return "#F5E642";
  if (n.includes("pink")) return "#FDA4AF";
  if (n.includes("purple")) return "#C4B5FD";
  if (n.includes("brown")) return "#FDBA74";
  if (n.includes("silver")) return "#E2E8F0";
  if (n.includes("gray") || n.includes("grey")) return "#9CA3AF";
  if (n.includes("beige")) return "#F5F0E8";
  if (n.includes("walnut")) return "#92400E";
  return "#86EFAC";
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [wishlistSet, setWishlistSet] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set<number>();
    try {
      const stored = localStorage.getItem("locare_wishlist");
      return stored ? new Set<number>(JSON.parse(stored) as number[]) : new Set<number>();
    } catch { return new Set<number>(); }
  });

  const pageSize = 9;

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setProductsList(data); })
      .catch((e) => console.error("Catalog load error:", e))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() =>
    Array.from(new Set(productsList.map((p) => p.category).filter(Boolean))), [productsList]);

  const brands = useMemo(() => {
    const s = new Set<string>();
    productsList.forEach((p) => {
      if (p.brand) s.add(p.brand);
      p.variants?.forEach((v) => v.attributeValues?.forEach((av) => {
        if (av.attributeValue?.attribute?.name?.toLowerCase() === "brand") s.add(av.attributeValue.value);
      }));
    });
    return Array.from(s);
  }, [productsList]);

  const availableColors = useMemo(() => {
    const s = new Set<string>();
    productsList.forEach((p) => p.variants?.forEach((v) => v.attributeValues?.forEach((av) => {
      if (av.attributeValue?.attribute?.name?.toLowerCase() === "color") s.add(av.attributeValue.value);
    })));
    return Array.from(s);
  }, [productsList]);

  const filteredProducts = useMemo(() => {
    return productsList.filter((p) => {
      if (initialSearch && !p.name.toLowerCase().includes(initialSearch.toLowerCase()) &&
        !p.category.toLowerCase().includes(initialSearch.toLowerCase())) return false;
      if (selectedCategory !== "all" && p.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
      if (selectedBrand !== "all") {
        const match = p.brand?.toLowerCase() === selectedBrand.toLowerCase() ||
          p.variants?.some((v) => v.attributeValues?.some((av) =>
            av.attributeValue?.attribute?.name?.toLowerCase() === "brand" &&
            av.attributeValue?.value?.toLowerCase() === selectedBrand.toLowerCase()));
        if (!match) return false;
      }
      if (p.price > maxPrice) return false;
      if (selectedDuration !== "all") {
        if (selectedDuration === "day" && p.rentalUnit !== "day") return false;
        if (selectedDuration === "week" && p.rentalUnit !== "week") return false;
        if (selectedDuration === "hour" && p.rentalUnit !== "hour") return false;
      }
      if (selectedColor !== "all") {
        const match = p.variants?.some((v) => v.attributeValues?.some((av) =>
          av.attributeValue?.attribute?.name?.toLowerCase() === "color" &&
          av.attributeValue?.value?.toLowerCase() === selectedColor.toLowerCase()));
        if (!match) return false;
      }
      return true;
    });
  }, [productsList, initialSearch, selectedCategory, selectedBrand, selectedColor, selectedDuration, maxPrice]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const toggleWishlist = (e: React.MouseEvent, productId: number) => {
    e.preventDefault(); e.stopPropagation();
    setWishlistSet((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      try {
        localStorage.setItem("locare_wishlist", JSON.stringify(Array.from(next)));
        window.dispatchEvent(new Event("wishlist-updated"));
      } catch {}
      return next;
    });
  };

  const resetFilters = () => {
    setSelectedCategory("all"); setSelectedBrand("all"); setSelectedColor("all");
    setSelectedDuration("all"); setMaxPrice(10000); setCurrentPage(1);
  };

  return (
    <div className="page-shell">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">
            {initialSearch ? `Results for "${initialSearch}" — ` : ""}
            Showing <strong>{filteredProducts.length}</strong> item{filteredProducts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => setSidebarOpen((p) => !p)}
          className="btn btn-light btn-sm"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {sidebarOpen ? "Hide" : "Show"} Filters
        </button>
      </div>

      <div className="catalog-layout" style={{ gridTemplateColumns: sidebarOpen ? "260px 1fr" : "1fr" }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="catalog-sidebar">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                Filters
              </span>
              <button
                onClick={resetFilters}
                style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Category */}
            <div className="catalog-sidebar-section">
              <p className="catalog-sidebar-title">Category</p>
              <button
                className={`catalog-filter-option ${selectedCategory === "all" ? "catalog-filter-option-active" : ""}`}
                onClick={() => { setSelectedCategory("all"); setCurrentPage(1); }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: selectedCategory === "all" ? "var(--color-dark)" : "rgba(13,13,13,0.2)", flexShrink: 0 }} />
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  className={`catalog-filter-option ${selectedCategory === c ? "catalog-filter-option-active" : ""}`}
                  onClick={() => { setSelectedCategory(c); setCurrentPage(1); }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: selectedCategory === c ? "var(--color-dark)" : "rgba(13,13,13,0.2)", flexShrink: 0 }} />
                  {c}
                </button>
              ))}
            </div>

            {/* Brand */}
            {brands.length > 0 && (
              <div className="catalog-sidebar-section">
                <p className="catalog-sidebar-title">Brand</p>
                <select
                  className="form-select"
                  style={{ fontSize: "0.8rem" }}
                  value={selectedBrand}
                  onChange={(e) => { setSelectedBrand(e.target.value); setCurrentPage(1); }}
                >
                  <option value="all">All Brands</option>
                  {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}

            {/* Colors */}
            <div className="catalog-sidebar-section">
              <p className="catalog-sidebar-title">Color</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <button
                  onClick={() => { setSelectedColor("all"); setCurrentPage(1); }}
                  style={{
                    width: 28, height: 28, borderRadius: "50%",
                    border: selectedColor === "all" ? "2px solid var(--color-dark)" : "1.5px solid rgba(13,13,13,0.2)",
                    background: "var(--bg-alt)", fontSize: 9, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", color: "var(--text)",
                    transform: selectedColor === "all" ? "scale(1.15)" : "scale(1)",
                    transition: "transform 150ms",
                  }}
                  title="All Colors"
                >ALL</button>
                {availableColors.map((colorName) => {
                  const hex = getColorHex(colorName);
                  const isSel = selectedColor.toLowerCase() === colorName.toLowerCase();
                  return (
                    <button
                      key={colorName}
                      onClick={() => { setSelectedColor(colorName); setCurrentPage(1); }}
                      style={{
                        width: 28, height: 28, borderRadius: "50%",
                        background: hex,
                        border: isSel ? "2.5px solid var(--color-dark)" : "1.5px solid rgba(13,13,13,0.2)",
                        cursor: "pointer",
                        transform: isSel ? "scale(1.18)" : "scale(1)",
                        transition: "transform 150ms, box-shadow 150ms",
                        boxShadow: isSel ? "var(--shadow-sm)" : "none",
                      }}
                      title={colorName}
                    />
                  );
                })}
              </div>
            </div>

            {/* Duration */}
            <div className="catalog-sidebar-section">
              <p className="catalog-sidebar-title">Rental Unit</p>
              <select
                className="form-select"
                style={{ fontSize: "0.8rem" }}
                value={selectedDuration}
                onChange={(e) => { setSelectedDuration(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Units</option>
                <option value="day">Daily (per Day)</option>
                <option value="week">Weekly (per Week)</option>
                <option value="hour">Hourly (per Hour)</option>
              </select>
            </div>

            {/* Price Slider */}
            <div className="catalog-sidebar-section">
              <p className="catalog-sidebar-title">Max Price</p>
              <input
                type="range"
                min={5} max={2000} step={5}
                value={maxPrice}
                onChange={(e) => { setMaxPrice(Number(e.target.value)); setCurrentPage(1); }}
                style={{ width: "100%", accentColor: "var(--color-dark)" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>₹5</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 800 }}>Up to ₹{maxPrice.toLocaleString()}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>₹2k</span>
              </div>
            </div>
          </aside>
        )}

        {/* Product Grid */}
        <main>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ border: "1.5px solid #0D0D0D", borderRadius: 18, overflow: "hidden", boxShadow: "4px 4px 0 #0D0D0D" }}>
                  <div className="skeleton" style={{ width: "100%", aspectRatio: "4/3" }} />
                  <div style={{ padding: 16 }}>
                    <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 8, borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 18, width: "85%", marginBottom: 12, borderRadius: 4 }} />
                    <div className="skeleton" style={{ height: 14, width: "40%", borderRadius: 4 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🔍</span>
              <h3 className="empty-state-title">No Products Found</h3>
              <p className="empty-state-sub">
                No items matched your filters{maxPrice < 2000 ? ` with a max price of ₹${maxPrice.toLocaleString()}` : ""}.
              </p>
              <button className="btn btn-yellow" onClick={resetFilters}>Reset Filters</button>
            </div>
          ) : (
            <div className="catalog-grid">
              {paginatedProducts.map((product) => {
                const isOutOfStock = product.inStock === 0;
                const isWishlisted = wishlistSet.has(product.id);
                const accent = getAccent(product.id);
                const skuCode = `REF-${String(product.id).padStart(4, "0")}`;

                const cardColors: string[] = [];
                product.variants?.forEach((v) => v.attributeValues?.forEach((av) => {
                  if (av.attributeValue?.attribute?.name?.toLowerCase() === "color")
                    cardColors.push(av.attributeValue.value);
                }));
                const uniqueColors = Array.from(new Set(cardColors));

                return (
                  <Link key={product.id} href={`/customer/products/${product.id}`} style={{ textDecoration: "none" }}>
                    <article className="product-card">
                      {/* Image */}
                      <div className="product-image" style={{ background: accent + "22" }}>
                        <ProductIcon category={product.category} size="sm" />
                        {isOutOfStock && (
                          <div style={{
                            position: "absolute", top: 10, left: 10,
                            background: "#FDA4AF", border: "1.5px solid #0D0D0D",
                            borderRadius: 99, padding: "2px 10px",
                            fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.05em",
                          }}>SOLD OUT</div>
                        )}
                        <button
                          onClick={(e) => toggleWishlist(e, product.id)}
                          style={{
                            position: "absolute", top: 10, right: 10,
                            width: 32, height: 32,
                            background: isWishlisted ? "#FDA4AF" : "var(--bg)",
                            border: "1.5px solid #0D0D0D",
                            borderRadius: 99,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", fontSize: "0.85rem",
                            boxShadow: "2px 2px 0 #0D0D0D",
                            transition: "all 150ms",
                          }}
                          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          {isWishlisted ? "♥" : "♡"}
                        </button>
                      </div>

                      {/* Body */}
                      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>
                            {skuCode}
                          </span>
                          <span style={{
                            background: accent, border: "1.5px solid #0D0D0D",
                            borderRadius: 99, padding: "1px 8px",
                            fontSize: "0.62rem", fontWeight: 800,
                          }}>
                            {product.category}
                          </span>
                        </div>

                        <h3 className="product-name" style={{ lineClamp: 2 }}>{product.name}</h3>
                        {product.brand && (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>{product.brand}</span>
                        )}

                        {/* Color swatches */}
                        {uniqueColors.length > 0 && (
                          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 2 }}>
                            {uniqueColors.map((c, i) => (
                              <span
                                key={i}
                                title={c}
                                style={{
                                  width: 12, height: 12, borderRadius: "50%",
                                  background: getColorHex(c),
                                  border: "1.5px solid rgba(13,13,13,0.3)",
                                  display: "inline-block",
                                }}
                              />
                            ))}
                          </div>
                        )}

                        {/* Price row */}
                        <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid rgba(13,13,13,0.07)" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 6 }}>
                            <span className="product-price">
                              ₹{product.price}
                              <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)" }}>&nbsp;/ {product.rentalUnit}</span>
                            </span>
                            <span style={{
                              fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)",
                              display: "flex", alignItems: "center", gap: 3,
                            }}>
                              🔒 ₹{product.securityDeposit}
                            </span>
                          </div>
                          <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{
                              fontSize: "0.68rem", fontWeight: 700,
                              background: !isOutOfStock ? "var(--green)" : "#FDA4AF",
                              border: "1.5px solid #0D0D0D",
                              borderRadius: 99, padding: "1px 8px",
                            }}>
                              {!isOutOfStock ? `${product.inStock} in stock` : "Sold Out"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32, flexWrap: "wrap" }}>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-light btn-sm"
                style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
              >←</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setCurrentPage(n)}
                  className={`btn btn-sm ${currentPage === n ? "btn-dark" : "btn-light"}`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-light btn-sm"
                style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
              >→</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CustomerCatalogPage() {
  return (
    <Suspense fallback={
      <div className="page-shell">
        <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Loading catalog...</div>
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
