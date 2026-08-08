"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductIcon from "@/components/ProductIcon";

interface AttributeValueRef {
  id: string;
  value: string;
  attribute: {
    id: string;
    name: string;
  };
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
  const [wishlistSet, setWishlistSet] = useState<Set<number>>(() => {
    if (typeof window === "undefined") return new Set<number>();
    try {
      const stored = localStorage.getItem("locare_wishlist");
      return stored ? new Set<number>(JSON.parse(stored) as number[]) : new Set<number>();
    } catch {
      return new Set<number>();
    }
  });

  const pageSize = 9;

  // Fetch real products from /api/products
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProductsList(data);
        }
      })
      .catch((err) => console.error("Error loading catalog products:", err))
      .finally(() => setLoading(false));
  }, []);

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(productsList.map((p) => p.category).filter(Boolean)));
  }, [productsList]);

  // Extract unique brands dynamically from products & variants
  const brands = useMemo(() => {
    const brandSet = new Set<string>();
    productsList.forEach((p) => {
      if (p.brand) brandSet.add(p.brand);
      if (p.variants) {
        p.variants.forEach((v) => {
          v.attributeValues?.forEach((av) => {
            if (av.attributeValue?.attribute?.name?.toLowerCase() === "brand") {
              brandSet.add(av.attributeValue.value);
            }
          });
        });
      }
    });
    return Array.from(brandSet);
  }, [productsList]);

  // Extract distinct active colors dynamically from DB variants (Prompt 1 requirement)
  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();
    productsList.forEach((p) => {
      if (p.variants) {
        p.variants.forEach((v) => {
          v.attributeValues?.forEach((av) => {
            if (av.attributeValue?.attribute?.name?.toLowerCase() === "color") {
              colorSet.add(av.attributeValue.value);
            }
          });
        });
      }
    });
    return Array.from(colorSet);
  }, [productsList]);

  // Map color names dynamically to swatch hexes
  const getColorHex = (colorName: string) => {
    const name = colorName.toLowerCase();
    if (name.includes("red")) return "#ef4444";
    if (name.includes("blue")) return "#2563eb";
    if (name.includes("black")) return "#18181b";
    if (name.includes("white")) return "#ffffff";
    if (name.includes("green")) return "#10b981";
    if (name.includes("yellow")) return "#eab308";
    if (name.includes("pink")) return "#ec4899";
    if (name.includes("purple")) return "#8b5cf6";
    if (name.includes("brown")) return "#78350f";
    if (name.includes("silver")) return "#94a3b8";
    if (name.includes("gray") || name.includes("grey")) return "#64748b";
    if (name.includes("beige")) return "#d4b996";
    if (name.includes("walnut")) return "#451a03";
    return "#84cc16"; // default vibrant accent
  };

  // Real-time product filtering logic
  const filteredProducts = useMemo(() => {
    return productsList.filter((product) => {
      // Search Filter
      if (
        initialSearch &&
        !product.name.toLowerCase().includes(initialSearch.toLowerCase()) &&
        !product.category.toLowerCase().includes(initialSearch.toLowerCase())
      ) {
        return false;
      }

      // Category Filter
      if (selectedCategory !== "all" && product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Brand Filter
      if (selectedBrand !== "all") {
        const hasBrandMatch =
          product.brand?.toLowerCase() === selectedBrand.toLowerCase() ||
          product.variants?.some((v) =>
            v.attributeValues?.some(
              (av) =>
                av.attributeValue?.attribute?.name?.toLowerCase() === "brand" &&
                av.attributeValue?.value?.toLowerCase() === selectedBrand.toLowerCase()
            )
          );
        if (!hasBrandMatch) return false;
      }

      // Price Cap Filter
      if (product.price > maxPrice) {
        return false;
      }

      // Duration Filter
      if (selectedDuration !== "all") {
        if (selectedDuration === "day" && product.rentalUnit !== "day") return false;
        if (selectedDuration === "week" && product.rentalUnit !== "week") return false;
        if (selectedDuration === "hour" && product.rentalUnit !== "hour") return false;
      }

      // Color Swatches Filter
      if (selectedColor !== "all") {
        const hasColorMatch = product.variants?.some((v) =>
          v.attributeValues?.some(
            (av) =>
              av.attributeValue?.attribute?.name?.toLowerCase() === "color" &&
              av.attributeValue?.value?.toLowerCase() === selectedColor.toLowerCase()
          )
        );
        if (!hasColorMatch) return false;
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
    e.preventDefault();
    e.stopPropagation();
    setWishlistSet((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      // Persist to localStorage
      try {
        localStorage.setItem("locare_wishlist", JSON.stringify(Array.from(next)));
        // Notify header badge
        window.dispatchEvent(new Event("wishlist-updated"));
      } catch {}
      return next;
    });
  };

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedColor("all");
    setSelectedDuration("all");
    setMaxPrice(10000);
    setCurrentPage(1);
  };

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
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          {brands.length > 0 && (
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
          )}

          {/* Dynamic Color Filter Swatches */}
          <div className="filter-group">
            <label className="filter-title">COLOR SWATCHES (LIVE DB SYNC)</label>
            <div className="color-swatches-grid flex flex-wrap gap-2">
              <button
                className={`color-swatch-btn ${selectedColor === "all" ? "selected" : ""}`}
                style={{
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: "50%",
                  width: "28px",
                  height: "28px",
                  fontSize: "10px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => {
                  setSelectedColor("all");
                  setCurrentPage(1);
                }}
                title="All Colors"
              >
                ALL
              </button>

              {availableColors.map((colorName) => {
                const hex = getColorHex(colorName);
                const isSelected = selectedColor.toLowerCase() === colorName.toLowerCase();
                return (
                  <button
                    key={colorName}
                    className={`color-swatch-btn ${isSelected ? "selected" : ""}`}
                    style={{
                      backgroundColor: hex,
                      border: isSelected ? "2px solid #84cc16" : "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "50%",
                      width: "28px",
                      height: "28px",
                      cursor: "pointer",
                      transition: "transform 0.15s ease",
                      transform: isSelected ? "scale(1.15)" : "scale(1)",
                    }}
                    onClick={() => {
                      setSelectedColor(colorName);
                      setCurrentPage(1);
                    }}
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
              onChange={(e) => {
                setSelectedDuration(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Commitments</option>
              <option value="day">Daily (per Day)</option>
              <option value="week">Weekly (per Week)</option>
              <option value="hour">Hourly (per Hour)</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="filter-group">
            <label className="filter-title">MAX RENTAL RATE (₹ / $)</label>
            <div className="price-range-slider">
              <input
                type="range"
                className="price-range-input"
                min={5}
                max={2000}
                step={5}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
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
                Explore equipment & items — filter by category, brand, and live color swatches.
              </p>
            </div>
            <div className="catalog-stats">
              <span className="catalog-stat">
                Showing <strong>{filteredProducts.length}</strong> items
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
                const isWishlisted = wishlistSet.has(product.id);
                const skuCode = `REF-${String(product.id).padStart(4, "0")}`;

                // Extract product colors for card display
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
                  <Link
                    key={product.id}
                    href={`/customer/products/${product.id}`}
                    className="product-card-link"
                  >
                    <article className="card product-card technical-card">
                      <div style={{ position: "relative" }}>
                        <ProductIcon category={product.category} size="sm" />

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

                        {/* Live Color Swatches on Card */}
                        {uniqueCardColors.length > 0 && (
                          <div className="product-card-swatches flex gap-1.5 my-2">
                            {uniqueCardColors.map((colorName, sIdx) => (
                              <span
                                key={sIdx}
                                className="card-swatch-dot"
                                style={{
                                  backgroundColor: getColorHex(colorName),
                                  width: "12px",
                                  height: "12px",
                                  borderRadius: "50%",
                                  display: "inline-block",
                                  border: "1px solid rgba(255,255,255,0.3)",
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
                              {" "}
                              / per {product.rentalUnit}
                            </span>
                          </div>
                        </div>

                        <div className="product-meta" style={{ marginTop: 10 }}>
                          <span className="product-deposit-badge">
                            🔒 ₹{product.securityDeposit} deposit
                          </span>
                          <span
                            className={`product-stock ${
                              !isOutOfStock ? "in-stock" : "out-of-stock"
                            }`}
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
