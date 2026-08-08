"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, formatRentalUnit } from "@/lib/cart-context";
import ProductIcon from "@/components/ProductIcon";

function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    updateItemDates,
    clearCart,
    totalRentalCost,
    totalDeposit,
    grandTotal,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="page-shell animate-fade-in">
        <h1 className="page-title">Your Rental Cart</h1>
        <p className="page-subtitle">Your cart is currently empty.</p>

        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <p className="empty-state-text">
            No equipment added yet. Explore our catalog to start renting!
          </p>
          <Link href="/customer" className="btn btn-primary" style={{ marginTop: 20 }}>
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell animate-fade-in">
      <div className="cart-header">
        <div>
          <h1 className="page-title">Your Rental Cart</h1>
          <p className="page-subtitle">
            Review your rental items, rental dates, and refundable security deposits.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={clearCart}>
          Clear Cart
        </button>
      </div>

      <div className="cart-layout">
        {/* Items List */}
        <div className="cart-items-list">
          {items.map((item) => {
            const { product, quantity, rentalStart, rentalEnd, rentalUnits, rentalCost, depositTotal } = item;

            return (
              <div key={product.id} className="cart-item-card card">
                <div className="cart-item-left">
                  <ProductIcon category={product.category} size="sm" />
                </div>

                <div className="cart-item-body">
                  <div className="cart-item-top">
                    <div>
                      <span className="product-category">{product.category}</span>
                      <h3 className="cart-item-name">{product.name}</h3>
                    </div>
                    <button
                      className="cart-remove-btn"
                      onClick={() => removeItem(product.id)}
                      title="Remove item"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Dates & Quantity controls */}
                  <div className="cart-item-controls">
                    <div className="form-row" style={{ flex: 1 }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor={`start-${product.id}`}>
                          Start Date
                        </label>
                        <input
                          id={`start-${product.id}`}
                          type="date"
                          className="form-input form-input-sm"
                          value={rentalStart}
                          min={getTodayString()}
                          onChange={(e) => {
                            const newStart = e.target.value;
                            let newEnd = rentalEnd;
                            if (newStart >= rentalEnd) {
                              const d = new Date(newStart);
                              d.setDate(d.getDate() + 1);
                              newEnd = d.toISOString().split("T")[0];
                            }
                            updateItemDates(product.id, newStart, newEnd);
                          }}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor={`end-${product.id}`}>
                          End Date
                        </label>
                        <input
                          id={`end-${product.id}`}
                          type="date"
                          className="form-input form-input-sm"
                          value={rentalEnd}
                          min={rentalStart}
                          onChange={(e) =>
                            updateItemDates(product.id, rentalStart, e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="form-group">
                      <label className="form-label" htmlFor={`qty-${product.id}`}>
                        Quantity
                      </label>
                      <div className="quantity-control quantity-control-sm">
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          disabled={quantity <= 1}
                        >
                          −
                        </button>
                        <input
                          id={`qty-${product.id}`}
                          type="number"
                          className="quantity-input"
                          value={quantity}
                          min={1}
                          max={product.inStock}
                          onChange={(e) =>
                            updateQuantity(
                              product.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                        <button
                          className="quantity-btn"
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.inStock}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Line Item Financial Breakdown */}
                  <div className="cart-item-financials">
                    <div className="cart-financial-pill">
                      <span>Fee:</span>
                      <strong>
                        ${rentalCost.toLocaleString()}
                      </strong>
                      <small>
                        (${product.price} × {formatRentalUnit(product.rentalUnit, rentalUnits)})
                      </small>
                    </div>

                    <div className="cart-financial-pill deposit">
                      <span>🔒 Deposit:</span>
                      <strong>${depositTotal.toLocaleString()}</strong>
                      <small>(Refundable)</small>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cart Summary Sidebar */}
        <div className="cart-summary-sidebar">
          <div className="booking-card">
            <h2 className="booking-card-title">Order Summary</h2>

            <div className="cost-breakdown">
              <div className="cost-line">
                <span className="cost-line-label">Total Rental Fee</span>
                <span className="cost-line-amount">
                  ${totalRentalCost.toLocaleString()}
                </span>
              </div>

              <div className="cost-line cost-line-deposit">
                <span className="cost-line-label">
                  Total Security Deposit
                  <span className="cost-line-detail">🔒 Fully refundable on return</span>
                </span>
                <span className="cost-line-amount">
                  ${totalDeposit.toLocaleString()}
                </span>
              </div>

              <div className="cost-total">
                <span>Grand Total Due</span>
                <span className="cost-total-amount">
                  ${grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={() => router.push("/customer/checkout")}
            >
              Proceed to Checkout →
            </button>

            <Link
              href="/customer"
              className="btn btn-ghost btn-block"
              style={{ textAlign: "center" }}
            >
              ← Continue Browsing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
