"use client";

import { useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { products } from "@/lib/data";
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

function getMinEndDate(startDate: string): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const productId = params.id as string;
  const product = products.find((p) => p.id === productId);

  // ─── Form state ────────────────────────────────────────────────────────
  const [rentalStart, setRentalStart] = useState(getTodayString());
  const [rentalEnd, setRentalEnd] = useState(getTomorrowString());
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // ─── Computed costs ────────────────────────────────────────────────────
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

  // ─── Not found ─────────────────────────────────────────────────────────
  if (!product) {
    return (
      <div className="page-shell animate-fade-in">
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p className="empty-state-text">Product not found</p>
          <Link href="/customer" className="btn btn-primary" style={{ marginTop: 16 }}>
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  // ─── Handlers ──────────────────────────────────────────────────────────
  const handleAddToCart = () => {
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

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleStartDateChange = (val: string) => {
    setRentalStart(val);
    // Ensure end date is after start date
    if (val >= rentalEnd) {
      const d = new Date(val);
      d.setDate(d.getDate() + 1);
      setRentalEnd(d.toISOString().split("T")[0]);
    }
  };

  const maxQuantity = product.inStock;
  const isOutOfStock = product.inStock === 0;

  return (
    <div className="page-shell animate-fade-in">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link href="/customer" className="breadcrumb-link">
          ← Back to Catalog
        </Link>
      </nav>

      <div className="detail-layout">
        {/* ─── Left: Product Info ─────────────────────────────────────── */}
        <div className="detail-left">
          <ProductIcon category={product.category} size="lg" />

          <div className="detail-info">
            <span className="product-category">{product.category}</span>
            <h1 className="detail-title">{product.name}</h1>
            <p className="detail-description">{product.description}</p>

            {/* Quick specs */}
            <div className="detail-specs">
              <div className="detail-spec">
                <span className="detail-spec-label">Rental Rate</span>
                <span className="detail-spec-value">
                  ${product.price}/{product.rentalUnit}
                </span>
              </div>
              <div className="detail-spec">
                <span className="detail-spec-label">Security Deposit</span>
                <span className="detail-spec-value">
                  ${product.securityDeposit}
                </span>
              </div>
              <div className="detail-spec">
                <span className="detail-spec-label">Availability</span>
                <span
                  className="detail-spec-value"
                  style={{
                    color: product.inStock > 0 ? "var(--success)" : "var(--danger)",
                  }}
                >
                  {product.inStock > 0
                    ? `${product.inStock} unit${product.inStock > 1 ? "s" : ""} available`
                    : "Out of stock"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right: Booking Form ────────────────────────────────────── */}
        <div className="detail-right">
          <div className="booking-card">
            <h2 className="booking-card-title">Configure Your Rental</h2>

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
                  onChange={(e) => handleStartDateChange(e.target.value)}
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
                  min={getMinEndDate(rentalStart)}
                  onChange={(e) => setRentalEnd(e.target.value)}
                />
              </div>
            </div>

            {/* Duration display */}
            {costBreakdown && (
              <div className="duration-badge">
                📅 {costBreakdown.unitLabel} rental
              </div>
            )}

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label" htmlFor="quantity">
                Quantity
              </label>
              <div className="quantity-control">
                <button
                  className="quantity-btn"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <input
                  id="quantity"
                  type="number"
                  className="quantity-input"
                  value={quantity}
                  min={1}
                  max={maxQuantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.max(1, Math.min(maxQuantity, parseInt(e.target.value) || 1))
                    )
                  }
                />
                <button
                  className="quantity-btn"
                  onClick={() =>
                    setQuantity((q) => Math.min(maxQuantity, q + 1))
                  }
                  disabled={quantity >= maxQuantity}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* ─── Cost Breakdown ─────────────────────────────────────── */}
            {costBreakdown && (
              <div className="cost-breakdown">
                <div className="cost-breakdown-title">Cost Summary</div>

                {/* Rental Cost */}
                <div className="cost-line">
                  <span className="cost-line-label">
                    Rental Fee
                    <span className="cost-line-detail">
                      ${product.price} × {costBreakdown.unitLabel}
                      {quantity > 1 ? ` × ${quantity}` : ""}
                    </span>
                  </span>
                  <span className="cost-line-amount">
                    ${costBreakdown.rentalCost.toLocaleString()}
                  </span>
                </div>

                {/* Security Deposit */}
                <div className="cost-line cost-line-deposit">
                  <span className="cost-line-label">
                    Security Deposit
                    <span className="cost-line-detail">
                      🔒 Refundable
                      {quantity > 1 ? ` × ${quantity}` : ""}
                    </span>
                  </span>
                  <span className="cost-line-amount">
                    ${costBreakdown.depositTotal.toLocaleString()}
                  </span>
                </div>

                {/* Total */}
                <div className="cost-total">
                  <span>Total Due Now</span>
                  <span className="cost-total-amount">
                    ${costBreakdown.grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <button
              className={`btn btn-primary btn-block btn-lg ${
                addedToCart ? "btn-success-flash" : ""
              }`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock
                ? "Out of Stock"
                : addedToCart
                ? "✓ Added to Cart!"
                : "Add to Cart"}
            </button>

            {!isOutOfStock && (
              <p className="booking-note">
                You won&apos;t be charged yet — review your cart before checkout.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
