"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { products, type Product } from "@/lib/data";
import ProductIcon from "@/components/ProductIcon";

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [currentPage, setCurrentPage] = useState(1);
  const [wishlistSet, setWishlistSet] = useState<Set<string>>(new Set(["prod-001", "prod-004"]));

  const pageSize = 6;

  // Extract unique brands from products dataset
  const brands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand).filter(Boolean))) as string[];
  }, []);

  // Real-time product filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search Query Filter
      if (
        initialSearch &&
        !product.name.toLowerCase().includes(initialSearch.toLowerCase()) &&
        !product.category.toLowerCase().includes(initialSearch.toLowerCase()) &&
        !(product.brand && product.brand.toLowerCase().includes(initialSearch.toLowerCase()))
      ) {
        return false;
      }

      // Brand Filter
      if (selectedBrand !== "all" && product.brand !== selectedBrand) {
        return false;
      }

      // Price Cap Filter (e.g. $4,960 slider)
      if (product.price > maxPrice) {
        return false;
      }

      // Duration / Commitment Filter
      if (selectedDuration !== "all") {
        if (selectedDuration.includes("Month") && product.rentalUnit !== "month") return false;
        if (selectedDuration.includes("Year") && product.rentalUnit !== "month") return false;
        if (selectedDuration.includes("Day") && product.rentalUnit !== "day") return false;
      }

      // Color Swatches Filter
      if (selectedColor !== "all") {
        if (!product.colorSwatches || product.colorSwatches.length === 0) return false;

        const colorMap: Record<string, string[]> = {
          Blue: ["#2563eb", "#0284c7", "#3b82f6"],
          "Master Gold": ["#f59e0b", "#eab308", "#d97706"],
          Teal: ["#0d9488", "#14b8a6", "#2dd4bf"],
          Charcoal: ["#334155", "#475569", "#1e293b"],
          "Dark Wood": ["#78350f", "#451a03"],
        };

        const targetHexes = colorMap[selectedColor] || [];
        const hasColorMatch = product.colorSwatches.some((hex) => targetHexes.includes(hex));
        if (!hasColorMatch) return false;
      }

      return true;
    });
  }, [initialSearch, selectedBrand, selectedColor, selectedDuration, maxPrice]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistSet((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const handleResetFilters = () => {
    setSelectedBrand("all");
    setSelectedColor("all");
    setSelectedDuration("all");
    setMaxPrice(10000);
    setCurrentPage(1);
  };

  return (
    <div className="page-shell animate-fade-in">
      <div className="catalog-layout-grid">
        {/* ─── Left Sidebar Filters (Image 1 Wireframe) ─────────────────── */}
        <aside className="catalog-sidebar">
          <div className="sidebar-header" style={{ marginBottom: 12 }}>
            <h2 className="filter-title" style={{ fontSize: "0.85rem", color: "var(--primary-light)" }}>
              FILTER SPECIFICATION
            </h2>
          </div>

          {/* Brand Filter */}
          <div className="filter-group">
            <label className="filter-title">BRAND MANUFACTURER</label>
            <select
              className="filter-select"
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Manufacturers</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Color Filter Swatches */}
          <div className="filter-group">
            <label className="filter-title">COLOR SWATCHES</label>
            <div className="color-swatches-grid">
              {[
                { name: "all", hex: "transparent", label: "All Colors" },
                { name: "Blue", hex: "#2563eb", label: "Blue" },
                { name: "Master Gold", hex: "#f59e0b", label: "Master Gold" },
                { name: "Teal", hex: "#0d9488", label: "Teal" },
                { name: "Charcoal", hex: "#334155", label: "Charcoal" },
                { name: "Dark Wood", hex: "#78350f", label: "Dark Wood" },
              ].map((c) => (
                <button
                  key={c.name}
                  className={`color-swatch-btn ${selectedColor === c.name ? "selected" : ""}`}
                  style={{
                    backgroundColor: c.hex === "transparent" ? "var(--bg-elevated)" : c.hex,
                    border: c.hex === "transparent" ? "1px solid var(--border)" : undefined,
                  }}
                  onClick={() => {
                    setSelectedColor(c.name);
                    setCurrentPage(1);
                  }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="filter-group">
            <label className="filter-title">RENTAL COMMITMENT</label>
            <select
              className="filter-select"
              value={selectedDuration}
              onChange={(e) => {
                setSelectedDuration(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Commitments</option>
              <option value="1 Month">1 Month</option>
              <option value="6 Month">6 Month</option>
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
              <option value="3 Years">3 Years</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="filter-group">
            <label className="filter-title">MONTHLY PRICE CAP</label>
            <div className="price-range-slider">
              <input
                type="range"
                className="price-range-input"
                min={10}
                max={10000}
                step={10}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
              />
              <div className="price-range-labels">
                <span>$10</span>
                <strong style={{ color: "var(--primary-light)" }}>Up to ${maxPrice.toLocaleString()}</strong>
                <span>$10k</span>
              </div>
            </div>
          </div>

          {/* Reset Filters Button */}
          <button
            className="btn btn-ghost btn-sm btn-block"
            style={{ marginTop: 8 }}
            onClick={handleResetFilters}
          >
            Reset Filters
          </button>
        </aside>

        {/* ─── Main Technical Product Grid ────────────────────────────────── */}
        <main>
          <div className="catalog-header">
            <div>
              <h1 className="page-title">Products</h1>
              <p className="page-subtitle">
                Explore our catalog — click any item to configure duration and rental options.
              </p>
            </div>
            <div className="catalog-stats">
              <span className="catalog-stat">
                Showing <strong>{filteredProducts.length}</strong> items
              </span>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-state card" style={{ padding: 40, textAlign: "center" }}>
              <div className="empty-state-icon">🔍</div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "12px 0 6px" }}>No Products Found</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                No equipment items matched your selected filters or price range (${maxPrice.toLocaleString()}).
              </p>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 16 }}
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="card-grid stagger-children">
              {paginatedProducts.map((product) => {
                const isOutOfStock = product.inStock === 0;
                const isWishlisted = wishlistSet.has(String(product.id));
                const skuCode = `REF-${String(product.id).slice(0, 6).toUpperCase()}`;

                return (
                  <Link
                    key={product.id}
                    href={`/customer/products/${product.id}`}
                    className="product-card-link"
                  >
                    <article className="card product-card technical-card">
                      {/* Image Container with Non-Colliding Badges */}
                      <div style={{ position: "relative" }}>
                        <ProductIcon category={product.category} size="sm" />

                        {/* Technical Top-Left Out of Stock Badge */}
                        {isOutOfStock && (
                          <div className="out-of-stock-tech-badge">
                            🚫 UNAVAILABLE
                          </div>
                        )}

                        {/* Wishlist toggle icon button ♡ */}
                        <button
                          className="btn btn-ghost btn-sm wishlist-tech-btn"
                          onClick={(e) => toggleWishlist(e, String(product.id))}
                          title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                        >
                          {isWishlisted ? "♥" : "♡"}
                        </button>
                      </div>

                      {/* Card Body */}
                      <div className="product-card-body">
                        <div className="product-header-line">
                          <span className="sku-mono">{skuCode}</span>
                          <span className="brand-tag">{product.brand || product.category}</span>
                        </div>

                        <h3 className="product-name">{product.name}</h3>

                        {/* Color Swatches */}
                        {product.colorSwatches && (
                          <div className="product-card-swatches">
                            {product.colorSwatches.map((hex, sIdx) => (
                              <span
                                key={sIdx}
                                className="card-swatch-dot"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                        )}

                        {/* Variant note */}
                        {product.sizeVariantNote && (
                          <div className="product-variant-note">
                            Note: {product.sizeVariantNote}
                          </div>
                        )}

                        {/* Rate per Unit */}
                        <div className="product-price-row" style={{ marginTop: 12 }}>
                          <div className="product-price">
                            ${product.price}
                            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                              {" "}
                              / per {product.rentalUnit}
                            </span>
                          </div>
                        </div>

                        {/* Technical Deposit & Stock Row */}
                        <div className="product-meta" style={{ marginTop: 10 }}>
                          <span className="product-deposit-badge">
                            🔒 ${product.securityDeposit} deposit
                          </span>
                          <span
                            className={`product-stock ${
                              !isOutOfStock ? "in-stock" : "out-of-stock"
                            }`}
                          >
                            {!isOutOfStock ? `${product.inStock} in stock` : "Unavailable"}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Wireframe Pagination Controls (< 1 2 ... >) */}
          {totalPages > 1 && (
            <div className="pagination-wrapper">
              <button
                className="page-num-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  className={`page-num-btn ${currentPage === pageNum ? "active" : ""}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              ))}
              <button
                className="page-num-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
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
