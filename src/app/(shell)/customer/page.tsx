"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { products, type Product } from "@/lib/data";
import ProductIcon from "@/components/ProductIcon";

export default function CustomerCatalogPage() {
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedColor, setSelectedColor] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState("all");
  const [maxPrice, setMaxPrice] = useState(10000);
  const [currentPage, setCurrentPage] = useState(1);

  // Extract unique brands
  const brands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand).filter(Boolean)));
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedBrand !== "all" && product.brand !== selectedBrand) return false;
      if (product.price > maxPrice) return false;
      if (selectedDuration !== "all") {
        if (selectedDuration.includes("Month") && product.rentalUnit !== "month") return false;
        if (selectedDuration.includes("Year") && product.rentalUnit !== "month") return false;
      }
      return true;
    });
  }, [selectedBrand, selectedDuration, maxPrice]);

  return (
    <div className="page-shell animate-fade-in">
      <div className="catalog-layout-grid">
        {/* ─── Left Sidebar Filters (Matching Image 1 Wireframe) ─────────── */}
        <aside className="catalog-sidebar">
          {/* Brand Filter */}
          <div className="filter-group">
            <label className="filter-title">Brand</label>
            <select
              className="filter-select"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="all">All Brands</option>
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
                { name: "All", hex: "transparent" },
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
                  onClick={() => setSelectedColor(c.name)}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="filter-group">
            <label className="filter-title">Duration</label>
            <select
              className="filter-select"
              value={selectedDuration}
              onChange={(e) => setSelectedDuration(e.target.value)}
            >
              <option value="all">All Duration</option>
              <option value="1 Month">1 Month</option>
              <option value="6 Month">6 Month</option>
              <option value="1 Year">1 Year</option>
              <option value="2 Years">2 Years</option>
              <option value="3 Years">3 Years</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="filter-group">
            <label className="filter-title">Price Range</label>
            <div className="price-range-slider">
              <input
                type="range"
                className="price-range-input"
                min={10}
                max={10000}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
              <div className="price-range-labels">
                <span>$10</span>
                <strong>Up to ${maxPrice.toLocaleString()}</strong>
                <span>$10,000</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ─── Main Product Grid (Matching Image 1 Wireframe) ────────────── */}
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
                <strong>{filteredProducts.length}</strong> items found
              </span>
            </div>
          </div>

          {/* Product Grid */}
          <div className="card-grid stagger-children">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.inStock === 0;

              return (
                <Link
                  key={product.id}
                  href={`/customer/products/${product.id}`}
                  className="product-card-link"
                >
                  <article className="card product-card">
                    {/* Image Placeholder with Out of Stock overlay if inStock === 0 */}
                    <div style={{ position: "relative" }}>
                      <ProductIcon category={product.category} size="sm" />
                      {isOutOfStock && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0,0,0,0.75)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "var(--text-secondary)",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            borderRadius: "var(--radius-md)",
                          }}
                        >
                          Out of stock
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="product-card-body">
                      <span className="product-category">{product.brand || product.category}</span>
                      <h3 className="product-name">{product.name}</h3>

                      {/* Wireframe Color Swatches under image */}
                      {product.colorSwatches && (
                        <div className="product-card-swatches">
                          {product.colorSwatches.map((hex, idx) => (
                            <span
                              key={idx}
                              className="card-swatch-dot"
                              style={{ backgroundColor: hex }}
                            />
                          ))}
                        </div>
                      )}

                      {/* Wireframe Variant note (e.g. 36, 42 & 55 inch TV) */}
                      {product.sizeVariantNote && (
                        <div className="product-variant-note">
                          Note: {product.sizeVariantNote}
                        </div>
                      )}

                      {/* Rate per Unit format (e.g. $xx / per Month) */}
                      <div className="product-price-row">
                        <div className="product-price">
                          ${product.price}
                          <span> / per {product.rentalUnit}</span>
                        </div>
                      </div>

                      {/* Security Deposit Badge & Stock */}
                      <div className="product-meta">
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

          {/* Wireframe Pagination Controls (< 1 2 ... >) */}
          <div className="pagination-wrapper">
            <button
              className="page-num-btn"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            <button
              className={`page-num-btn ${currentPage === 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(1)}
            >
              1
            </button>
            <button
              className={`page-num-btn ${currentPage === 2 ? "active" : ""}`}
              onClick={() => setCurrentPage(2)}
            >
              2
            </button>
            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>...</span>
            <button
              className="page-num-btn"
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              &gt;
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
