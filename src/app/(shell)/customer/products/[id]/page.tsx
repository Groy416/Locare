"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { products as fallbackProducts, type Product } from "@/lib/data";
import { useCart, calculateRentalUnits, formatRentalUnit } from "@/lib/cart-context";
import ProductIcon from "@/components/ProductIcon";

interface ResolvedAttributeValue {
  attribute: string;
  value: string;
}

interface DBVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  attributeValues: ResolvedAttributeValue[];
}

interface DBProduct extends Omit<Product, "variants"> {
  images?: { id: string; url: string }[];
  variants?: DBVariant[];
  colors?: string[];
}

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const productId = params.id as string;

  const [dbProduct, setDbProduct] = useState<DBProduct | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [rentalStart, setRentalStart] = useState(getTodayString());
  const [rentalEnd, setRentalEnd] = useState(getTomorrowString());
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Variant selection state
  const [selectedAttributeValues, setSelectedAttributeValues] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Fetch product from API
  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setDbProduct(data);
          if (data.imageUrl) setSelectedImage(data.imageUrl);
          else if (data.images && data.images.length > 0) setSelectedImage(data.images[0].url);
        } else {
          // Fallback to in-memory data
          const found = fallbackProducts.find((p) => p.id === productId);
          if (found) setDbProduct(found as unknown as DBProduct);
        }
      })
      .catch(() => {
        const found = fallbackProducts.find((p) => p.id === productId);
        if (found) setDbProduct(found as unknown as DBProduct);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const product = dbProduct;

  // Group attributes for picker (e.g. Color -> ["Red", "Blue", "Black"])
  const attributeGroups = useMemo(() => {
    if (!product || !product.variants || !Array.isArray(product.variants)) return {};

    const groups: Record<string, Set<string>> = {};
    for (const variant of product.variants as DBVariant[]) {
      if (variant.attributeValues && Array.isArray(variant.attributeValues)) {
        for (const av of variant.attributeValues) {
          const attrName = av.attribute || "Option";
          if (!groups[attrName]) groups[attrName] = new Set();
          groups[attrName].add(av.value);
        }
      }
    }

    const result: Record<string, string[]> = {};
    for (const [k, v] of Object.entries(groups)) {
      result[k] = Array.from(v);
    }
    return result;
  }, [product]);

  // Find active variant matching selected attributes
  const activeVariant = useMemo(() => {
    if (!product || !product.variants || !Array.isArray(product.variants)) return null;

    const selectedEntries = Object.entries(selectedAttributeValues);
    if (selectedEntries.length === 0) return null;

    return (product.variants as DBVariant[]).find((v) => {
      if (!v.attributeValues) return false;
      return selectedEntries.every(([attr, val]) =>
        v.attributeValues.some(
          (av) => av.attribute?.toLowerCase() === attr.toLowerCase() && av.value === val
        )
      );
    });
  }, [product, selectedAttributeValues]);

  // Active Price & Stock
  const activePrice = activeVariant ? activeVariant.price : product?.price || 0;
  const activeStock = activeVariant ? activeVariant.stock : product?.inStock ?? 0;

  // Computed Cost
  const costBreakdown = useMemo(() => {
    if (!product) return null;
    const units = calculateRentalUnits(rentalStart, rentalEnd, product.rentalUnit);
    const rentalCost = activePrice * units * quantity;
    const depositTotal = product.securityDeposit * quantity;
    const grandTotal = rentalCost + depositTotal;

    return {
      units,
      rentalCost,
      depositTotal,
      grandTotal,
      unitLabel: formatRentalUnit(product.rentalUnit, units),
    };
  }, [product, activePrice, rentalStart, rentalEnd, quantity]);

  if (loading) {
    return (
      <div className="page-shell animate-fade-in">
        <div style={{ padding: "60px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading product details...
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-shell animate-fade-in">
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-text">Product not found</p>
          <Link href="/customer" className="btn btn-primary" style={{ marginTop: 16 }}>
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!costBreakdown) return;

    addItem({
      product: {
        ...product,
        price: activePrice,
      } as unknown as Product,
      quantity,
      rentalStart,
      rentalEnd,
      rentalUnits: costBreakdown.units,
      rentalCost: costBreakdown.rentalCost,
      depositTotal: costBreakdown.depositTotal,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleExpressCheckout = () => {
    handleAddToCart();
    router.push("/customer/checkout");
  };

  const isOutOfStock = activeStock === 0;
  const mainImgSrc = selectedImage || (product as { imageUrl?: string; image?: string }).imageUrl || product.image;

  return (
    <div className="page-shell animate-fade-in">
      <nav className="breadcrumb">
        <Link href="/customer" className="breadcrumb-link">
          ← Back to Products
        </Link>
      </nav>

      <div className="detail-layout">
        {/* Left: Product Media & Enlarged Image Display */}
        <div className="detail-left">
          <div className="card product-enlarged-card" style={{ padding: 24, textAlign: "center" }}>
            {mainImgSrc && (mainImgSrc.startsWith("/") || mainImgSrc.startsWith("http")) && !mainImgSrc.includes("placeholder") ? (
              <img
                src={mainImgSrc}
                alt={product.name}
                style={{
                  maxHeight: 320,
                  maxWidth: "100%",
                  objectFit: "contain",
                  borderRadius: "var(--radius-md)",
                }}
              />
            ) : (
              <ProductIcon category={product.category} size="lg" />
            )}

            {/* Thumbnail selector if multiple images exist */}
            {product.images && product.images.length > 0 && (
              <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 16 }}>
                {product.images.map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt="Thumbnail"
                    style={{
                      width: 54,
                      height: 54,
                      objectFit: "cover",
                      borderRadius: 6,
                      cursor: "pointer",
                      border: selectedImage === img.url ? "2px solid var(--primary)" : "1px solid var(--border)",
                    }}
                    onClick={() => setSelectedImage(img.url)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="detail-info" style={{ marginTop: 20 }}>
            <span className="product-category">
              {product.brand || product.category} • {product.rentalUnit.toUpperCase()} RENTAL
            </span>
            <h1 className="detail-title">{product.name}</h1>
            <p className="detail-description">{product.description}</p>

            <div className="detail-specs">
              <div className="detail-spec">
                <span className="detail-spec-label">Base Rate</span>
                <span className="detail-spec-value">
                  ${activePrice} / per {product.rentalUnit}
                </span>
              </div>
              <div className="detail-spec">
                <span className="detail-spec-label">Security Deposit</span>
                <span className="detail-spec-value">${product.securityDeposit}</span>
              </div>
              <div className="detail-spec">
                <span className="detail-spec-label">Stock Status</span>
                <span
                  className="detail-spec-value"
                  style={{ color: !isOutOfStock ? "var(--success)" : "var(--danger)", fontWeight: isOutOfStock ? 800 : 600 }}
                >
                  {!isOutOfStock ? `${activeStock} Available` : "SOLD OUT"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking & Dynamic Variant Attribute Selection */}
        <div className="detail-right">
          <div className="booking-card">
            <h2 className="booking-card-title">Configure Rental Options</h2>

            {/* ─── Dynamic Attribute & Color Swatches Picker ─────────── */}
            {Object.keys(attributeGroups).length > 0 && (
              <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {Object.entries(attributeGroups).map(([attrName, values]) => (
                  <div key={attrName} className="form-group">
                    <label className="form-label" style={{ fontWeight: 700 }}>
                      Select {attrName}:
                    </label>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {values.map((val) => {
                        const isSelected = selectedAttributeValues[attrName] === val;
                        const isColorAttr = attrName.toLowerCase() === "color";

                        return (
                          <button
                            key={val}
                            type="button"
                            className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-ghost"}`}
                            style={{
                              borderRadius: isColorAttr ? "var(--radius-full)" : undefined,
                              fontWeight: 600,
                            }}
                            onClick={() =>
                              setSelectedAttributeValues((prev) => ({
                                ...prev,
                                [attrName]: val,
                              }))
                            }
                          >
                            {isColorAttr && "🎨 "}
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {activeVariant && (
                  <div
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      background: "var(--bg-elevated)",
                      fontSize: "0.82rem",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    SKU: <strong>{activeVariant.sku}</strong> • Price: ${activeVariant.price} • Stock: {activeVariant.stock}
                  </div>
                )}
              </div>
            )}

            {/* Date Pickers */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="rental-start">
                  Start Date
                </label>
                <input
                  id="rental-start"
                  type="date"
                  className="form-input"
                  value={rentalStart}
                  min={getTodayString()}
                  onChange={(e) => setRentalStart(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rental-end">
                  End Date
                </label>
                <input
                  id="rental-end"
                  type="date"
                  className="form-input"
                  value={rentalEnd}
                  min={rentalStart}
                  onChange={(e) => setRentalEnd(e.target.value)}
                />
              </div>
            </div>

            {costBreakdown && (
              <div className="duration-badge">
                📅 Duration: {costBreakdown.unitLabel}
              </div>
            )}

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <div className="quantity-control">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  min={1}
                  max={activeStock}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(activeStock || 1, parseInt(e.target.value) || 1)))
                  }
                />
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity((q) => Math.min(activeStock, q + 1))}
                  disabled={quantity >= activeStock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Cost Breakdown */}
            {costBreakdown && (
              <div className="cost-breakdown">
                <div className="cost-line">
                  <span className="cost-line-label">Rental Charges</span>
                  <span className="cost-line-amount">${costBreakdown.rentalCost.toLocaleString()}</span>
                </div>

                <div className="cost-line cost-line-deposit">
                  <span className="cost-line-label">
                    Security Deposit
                    <span className="cost-line-detail">🔒 Refundable</span>
                  </span>
                  <span className="cost-line-amount">${costBreakdown.depositTotal.toLocaleString()}</span>
                </div>

                <div className="cost-total">
                  <span>Total Due</span>
                  <span className="cost-total-amount">${costBreakdown.grandTotal.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              <button
                className={`btn btn-primary btn-block btn-lg ${addedToCart ? "btn-success-flash" : ""}`}
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                style={{ opacity: isOutOfStock ? 0.6 : 1, cursor: isOutOfStock ? "not-allowed" : "pointer" }}
              >
                {isOutOfStock
                  ? "🔴 SOLD OUT"
                  : addedToCart
                  ? "✓ Added to Cart!"
                  : "Add to Cart"}
              </button>

              <button
                className="btn btn-ghost btn-block"
                onClick={handleExpressCheckout}
                disabled={isOutOfStock}
                style={{ opacity: isOutOfStock ? 0.5 : 1, cursor: isOutOfStock ? "not-allowed" : "pointer" }}
              >
                {isOutOfStock ? "SOLD OUT" : "⚡ Express Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
