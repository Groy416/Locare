"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, formatRentalUnit } from "@/lib/cart-context";
import ProductIcon from "@/components/ProductIcon";
import { createOrder } from "@/lib/data";

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

  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [showExpressModal, setShowExpressModal] = useState(false);

  // Express Modal Form State
  const [cardDetails, setCardDetails] = useState("4532 8912 3456 7890");
  const [name, setName] = useState("Alex Morgan");
  const [email, setEmail] = useState("alex.morgan@example.com");
  const [address, setAddress] = useState("742 Evergreen Terrace");
  const [zipCode, setZipCode] = useState("97477");
  const [city, setCity] = useState("Springfield");
  const [country, setCountry] = useState("United States");
  const [isSubmittingExpress, setIsSubmittingExpress] = useState(false);

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
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const discountAmount = couponApplied ? Math.round(totalRentalCost * 0.1) : 0;
  const finalGrandTotal = Math.max(0, grandTotal - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.trim()) {
      setCouponApplied(true);
    }
  };

  const handleExpressPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingExpress(true);

    const fullAddr = `${address}, ${city}, ${zipCode}, ${country}`;

    // Decrement database stock for each item in cart via API
    items.forEach((item) => {
      const numId = typeof item.product.id === "number" ? item.product.id : parseInt(String(item.product.id), 10);
      if (!isNaN(numId)) {
        const newStock = Math.max(0, (item.product.inStock || 0) - item.quantity);
        fetch(`/api/products/${numId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inStock: newStock }),
        }).catch((err) => console.error("Failed to decrement stock via API:", err));
      }
    });

    // Create order via DB API
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        invoiceAddress: fullAddr,
        deliveryAddress: fullAddr,
        rentalStart: items[0]?.rentalStart || new Date().toISOString().split("T")[0],
        rentalEnd: items[0]?.rentalEnd || new Date().toISOString().split("T")[0],
        orderLines: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.price,
        })),
      }),
    }).catch((err) => console.error("Failed to save order to API:", err));

    setTimeout(() => {
      const order = createOrder(
        {
          name,
          email,
          phone: "+1 (555) 234-5678",
          deliveryAddress: fullAddr,
        },
        "delivery",
        items
      );

      clearCart();
      setShowExpressModal(false);
      router.push(`/customer/confirmation?orderId=${order.id}`);
    }, 1000);
  };

  return (
    <div className="page-shell animate-fade-in">
      <div className="cart-header">
        <div>
          <h1 className="page-title">Order Summary</h1>
          <p className="page-subtitle">
            Review equipment, quantities, and select rental period.
          </p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={clearCart}>
          Clear Cart
        </button>
      </div>

      <div className="cart-layout">
        {/* ─── Left Column: Items List (Image 4 Wireframe) ────────────────── */}
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
                      <span className="product-category">{product.brand || product.category}</span>
                      <h3 className="cart-item-name">{product.name}</h3>
                      <div className="product-price" style={{ fontSize: "0.9rem" }}>
                        ${product.price} / per {product.rentalUnit}
                      </div>
                    </div>

                    {/* Quantity Controls: Qty [- 1 +] */}
                    <div className="quantity-control quantity-control-sm">
                      <button
                        className="quantity-btn"
                        onClick={() => updateQuantity(product.id, quantity - 1)}
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
                          updateQuantity(product.id, parseInt(e.target.value) || 1)
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

                  {/* Wireframe links: Save for later & Remove */}
                  <div style={{ display: "flex", gap: 16, fontSize: "0.8rem" }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: "2px 8px" }}
                      onClick={() => alert(`Saved ${product.name} for later!`)}
                    >
                      Save for later
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ padding: "2px 8px", color: "var(--danger)" }}
                      onClick={() => removeItem(product.id)}
                    >
                      Remove
                    </button>
                  </div>

                  {/* Financial pill */}
                  <div className="cart-item-financials">
                    <div className="cart-financial-pill">
                      <span>Rental Fee:</span>
                      <strong>${rentalCost.toLocaleString()}</strong>
                      <small>({formatRentalUnit(product.rentalUnit, rentalUnits)})</small>
                    </div>
                    <div className="cart-financial-pill deposit">
                      <span>🔒 Deposit:</span>
                      <strong>${depositTotal.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Right Column: Order Summary Sidebar (Image 4 Wireframe) ────── */}
        <div className="cart-summary-sidebar">
          <div className="booking-card">
            <h2 className="booking-card-title">Rental Period</h2>

            {/* Global Date Pickers for Cart */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Start Date & Time</label>
                <input
                  type="date"
                  className="form-input form-input-sm"
                  value={items[0]?.rentalStart || getTodayString()}
                  onChange={(e) => {
                    const start = e.target.value;
                    items.forEach((i) => updateItemDates(i.product.id, start, i.rentalEnd));
                  }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date & Time</label>
                <input
                  type="date"
                  className="form-input form-input-sm"
                  value={items[0]?.rentalEnd || getTodayString()}
                  onChange={(e) => {
                    const end = e.target.value;
                    items.forEach((i) => updateItemDates(i.product.id, i.rentalStart, end));
                  }}
                />
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="cost-breakdown">
              <div className="cost-line">
                <span className="cost-line-label">Delivery Charges</span>
                <span className="cost-line-amount">-</span>
              </div>
              <div className="cost-line">
                <span className="cost-line-label">Sub Total</span>
                <span className="cost-line-amount">${totalRentalCost.toLocaleString()}</span>
              </div>
              {couponApplied && (
                <div className="cost-line">
                  <span className="cost-line-label" style={{ color: "var(--success)" }}>
                    Coupon Discount (10%)
                  </span>
                  <span className="cost-line-amount" style={{ color: "var(--success)" }}>
                    -${discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="cost-line cost-line-deposit">
                <span className="cost-line-label">
                  Security Deposit
                  <span className="cost-line-detail">🔒 Refundable on return</span>
                </span>
                <span className="cost-line-amount">${totalDeposit.toLocaleString()}</span>
              </div>
              <div className="cost-total">
                <span>Total</span>
                <span className="cost-total-amount">${finalGrandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Wireframe Coupon Input */}
            <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                className="form-input form-input-sm"
                placeholder="Promo Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                style={{ background: "#064e3b", borderColor: "#10b981" }}
              >
                Apply Coupon
              </button>
            </form>

            {/* Wireframe Action Buttons: Pay with Demo Card & Checkout */}
            <button
              className="btn btn-primary btn-block btn-lg"
              onClick={() => router.push("/customer/checkout")}
            >
              Checkout →
            </button>

            <button
              className="btn btn-ghost btn-block"
              onClick={() => setShowExpressModal(true)}
            >
              ⚡ Pay with Demo Card (Express)
            </button>

            <Link
              href="/customer"
              className="btn btn-ghost btn-block"
              style={{ textAlign: "center", fontSize: "0.85rem" }}
            >
              &lt; Continue Shopping &gt;
            </Link>
          </div>
        </div>
      </div>

      {/* ─── Express Checkout Modal (Pop Up Box Image 4 Wireframe) ─────────── */}
      {showExpressModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 className="modal-title">Express Checkout</h3>
              <button className="modal-close-btn" onClick={() => setShowExpressModal(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleExpressPaySubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Card Details</label>
                <input
                  type="text"
                  className="form-input"
                  value={cardDetails}
                  onChange={(e) => setCardDetails(e.target.value)}
                  placeholder="XXXX XXXX XXXX XXXX"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Zip Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={isSubmittingExpress}
                style={{ marginTop: 12 }}
              >
                {isSubmittingExpress ? "Processing..." : `Pay Now ($${finalGrandTotal.toLocaleString()})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
