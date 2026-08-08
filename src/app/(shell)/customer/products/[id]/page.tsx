"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { products, type Product } from "@/lib/data";
import { useCart, calculateRentalUnits, formatRentalUnit } from "@/lib/cart-context";
import ProductIcon from "@/components/ProductIcon";

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
  const product = products.find((p) => p.id === productId);

  // Form State
  const [rentalStart, setRentalStart] = useState(getTodayString());
  const [rentalEnd, setRentalEnd] = useState(getTomorrowString());
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Configure Variant Modal state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedVariantOpts, setSelectedVariantOpts] = useState<Record<string, string>>({});

  // Computed Cost
  const costBreakdown = useMemo(() => {
    if (!product) return null;
    const units = calculateRentalUnits(rentalStart, rentalEnd, product.rentalUnit);
    const rentalCost = product.price * units * quantity;
    const depositTotal = product.securityDeposit * quantity;
    const grandTotal = rentalCost + depositTotal;

    return {
      units,
      rentalCost,
      depositTotal,
      grandTotal,
      unitLabel: formatRentalUnit(product.rentalUnit, units),
    };
  }, [product, rentalStart, rentalEnd, quantity]);

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

  // Handle Add to Cart
  const handleAddToCartClick = () => {
    if (product.variants && product.variants.length > 0 && Object.keys(selectedVariantOpts).length === 0) {
      // Open Configure modal pop-up per Image 4 wireframe
      setShowConfigModal(true);
    } else {
      executeAddToCart();
    }
  };

  const executeAddToCart = () => {
    if (!costBreakdown) return;

    addItem({
      product,
      quantity,
      rentalStart,
      rentalEnd,
      rentalUnits: costBreakdown.units,
      rentalCost: costBreakdown.rentalCost,
      depositTotal: costBreakdown.depositTotal,
    });

    setShowConfigModal(false);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  // Express Checkout button directly routes to checkout
  const handleExpressCheckout = () => {
    if (!costBreakdown) return;
    executeAddToCart();
    router.push("/customer/checkout");
  };

  const isOutOfStock = product.inStock === 0;

  return (
    <div className="page-shell animate-fade-in">
      <nav className="breadcrumb">
        <Link href="/customer" className="breadcrumb-link">
          ← Back to Products
        </Link>
      </nav>

      <div className="detail-layout">
        {/* Left: Product Media & Specs */}
        <div className="detail-left">
          <ProductIcon category={product.category} size="lg" />

          <div className="detail-info">
            <span className="product-category">{product.brand} • {product.category}</span>
            <h1 className="detail-title">{product.name}</h1>
            <p className="detail-description">{product.description}</p>

            <div className="detail-specs">
              <div className="detail-spec">
                <span className="detail-spec-label">Rental Rate</span>
                <span className="detail-spec-value">
                  ${product.price} / per {product.rentalUnit}
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
                  style={{ color: !isOutOfStock ? "var(--success)" : "var(--danger)" }}
                >
                  {!isOutOfStock ? `${product.inStock} Available` : "Out of Stock"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Booking Configuration Form (Image 4 Wireframe) */}
        <div className="detail-right">
          <div className="booking-card">
            <h2 className="booking-card-title">Configure Rental Period</h2>

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
                  max={product.inStock}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(product.inStock, parseInt(e.target.value) || 1)))
                  }
                />
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity((q) => Math.min(product.inStock, q + 1))}
                  disabled={quantity >= product.inStock}
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

            {/* Action Buttons: Add to Cart & Express Checkout (Image 4 Wireframe) */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                className={`btn btn-primary btn-block btn-lg ${addedToCart ? "btn-success-flash" : ""}`}
                onClick={handleAddToCartClick}
                disabled={isOutOfStock}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : addedToCart
                  ? "✓ Added to Cart!"
                  : "Add to Cart"}
              </button>

              <button
                className="btn btn-ghost btn-block"
                onClick={handleExpressCheckout}
                disabled={isOutOfStock}
              >
                ⚡ Express Checkout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Configure Variant Modal (Image 4 Wireframe Pop-Up Dialog) ─────── */}
      {showConfigModal && product.variants && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">Configure Product Options</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowConfigModal(false)}
              >
                ✕
              </button>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Please choose your preferred variant options for <strong>{product.name}</strong> before adding to cart.
            </p>

            {product.variants.map((v) => (
              <div key={v.id} className="form-group">
                <label className="form-label">{v.name}</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {v.options.map((opt) => {
                    const isSelected = selectedVariantOpts[v.id] === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={`btn ${isSelected ? "btn-primary" : "btn-ghost"} btn-sm`}
                        onClick={() =>
                          setSelectedVariantOpts((prev) => ({
                            ...prev,
                            [v.id]: opt,
                          }))
                        }
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <button
                className="btn btn-primary btn-block"
                onClick={executeAddToCart}
              >
                Confirm & Add to Cart
              </button>

              <button
                className="btn btn-ghost"
                onClick={() => setShowConfigModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
