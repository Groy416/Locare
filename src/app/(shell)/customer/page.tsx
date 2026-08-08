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

  // Extract unique brands
  const brands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (
        initialSearch &&
        !product.name.toLowerCase().includes(initialSearch.toLowerCase()) &&
        !product.category.toLowerCase().includes(initialSearch.toLowerCase())
      ) {
        return false;
      }
      if (selectedBrand !== "all" && product.brand !== selectedBrand) return false;
      if (product.price > maxPrice) return false;
      if (selectedDuration !== "all") {
        if (selectedDuration.includes("Month") && product.rentalUnit !== "month") return false;
        if (selectedDuration.includes("Year") && product.rentalUnit !== "month") return false;
        if (selectedDuration.includes("Day") && product.rentalUnit !== "day") return false;
      }
      if (selectedColor !== "all") {
        if (!product.colorSwatches) return false;
        const colorHexMap: Record<string, string> = {
          Blue: "#2563eb",
          "Master Gold": "#f59e0b",
          Teal: "#0d9488",
          Charcoal: "#334155",
          "Dark Wood": "#78350f",
        };
        const targetHex = colorHexMap[selectedColor];
        if (targetHex && !product.colorSwatches.includes(targetHex)) return false;
      }
      return true;
    });
  }, [initialSearch, selectedBrand, selectedColor, selectedDuration, maxPrice]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

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

  return (
    <div className="page-shell animate-fade-in">
      <div className="catalog-layout-grid">
        {/* ─── Left Sidebar Filters (Image 1 Wireframe) ─────────────────── */}
        <aside className="catalog-sidebar">
          <div className="sidebar-header" style={{ marginBottom: 12 }}>
            <h2 className="filter-title" style={{ fontSize: "0.85rem", color: "var(--primary-light)" }}>
              Filter Specification
            </h2>
          </div>

          {/* Brand Filter */}
          <div className="filter-group">
            <label className="filter-title">Brand Manufacturer</label>
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
            <label className="filter-title">Color Swatches</label>
            <div className="color-swatches-grid">
              {[
                { name: "all", hex: "transparent" },
                { name: "Blue", hex: "#2563eb" },
                { name: "Master Gold", hex: "#f59e0b" },
                { name: "Teal", hex: "#0d9488" },
                { name: "Charcoal", hex: "#334155" },
                { name: "Dark Wood", hex: "#78350f" },
              ].map((c) => (
                <button
                  key={c.name}
                  className={`color-swatch-btn ${selectedColor === c.name ? "selected" : ""}`}
                  style={{
                    backgroundColor: c.hex === "transparent" ? "#1e293b" : c.hex,
                    border: c.hex === "transparent" ? "1px solid var(--border)" : undefined,
                  }}
                  onClick={() => {
                    setSelectedColor(c.name);
                    setCurrentPage(1);
                  }}
                  title={c.name === "all" ? "Show All Colors" : c.name}
                />
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="filter-group">
            <label className="filter-title">Rental Commitment</label>
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
            <label className="filter-title">Monthly Price Cap</label>
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

          {(selectedBrand !== "all" || selectedColor !== "all" || selectedDuration !== "all" || maxPrice < 10000) && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ marginTop: 8 }}
              onClick={() => {
                setSelectedBrand("all");
                setSelectedColor("all");
                setSelectedDuration("all");
                setMaxPrice(10000);
                setCurrentPage(1);
              }}
            >
              Reset Filters
            </button>
          )}
        </aside>

        {/* ─── Main Technical Product Grid ────────────────────────────────── */}
        <main>
          <div className="catalog-header">
            <div>
              <h1 className="page-title">Equipment Catalog</h1>
              <p className="page-subtitle">
                Select equipment line items to configure duration, security deposit, and checkout.
              </p>
            </div>
            <div className="catalog-stats">
              <span className="catalog-stat">
                Showing <strong>{paginatedProducts.length}</strong> of {filteredProducts.length} items
              </span>
            </div>
          </div>

          {/* Product Grid */}
          <div className="card-grid stagger-children">
            {paginatedProducts.map((product, idx) => {
              const isOutOfStock = product.inStock === 0;
              const isWishlisted = wishlistSet.has(product.id);
              const skuCode = `REF-${product.id.slice(0, 6).toUpperCase()}`;

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

                      {/* Technical Top-Left Out of Stock Badge (Fixes text collision!) */}
                      {isOutOfStock && (
                        <div className="out-of-stock-tech-badge">
                          🚫 UNAVAILABLE
                        </div>
                      )}

                      {/* Wishlist toggle icon button ♡ */}
                      <button
                        className="btn btn-ghost btn-sm wishlist-tech-btn"
                        onClick={(e) => toggleWishlist(e, product.id)}
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
                          Config: {product.sizeVariantNote}
                        </div>
                      )}

                      {/* Rate per Unit */}
                      <div className="product-price-row" style={{ marginTop: 12 }}>
                        <div className="product-price">
                          ${product.price}
                          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                            {" "}
                            / {product.rentalUnit}
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
                          {!isOutOfStock ? `• ${product.inStock} in stock` : "Out of stock"}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>

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
    <Suspense fallback={<div className="page-shell"><p>Loading equipment catalog...</p></div>}>
      <CatalogContent />
    </Suspense>
  );
}
