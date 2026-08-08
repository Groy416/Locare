"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, formatRentalUnit } from "@/lib/cart-context";
import { createOrder, type DeliveryMethod } from "@/lib/data";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalRentalCost, totalDeposit, grandTotal, clearCart } = useCart();

  // ─── Form State ────────────────────────────────────────────────────────
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [name, setName] = useState("Alex Morgan");
  const [email, setEmail] = useState("alex.morgan@example.com");
  const [phone, setPhone] = useState("+1 (555) 234-5678");
  const [address, setAddress] = useState("742 Evergreen Terrace");
  const [city, setCity] = useState("Springfield");
  const [zip, setZip] = useState("97477");

  // Payment State
  const [cardName, setCardName] = useState("Alex Morgan");
  const [cardNumber, setCardNumber] = useState("4532 8912 3456 7890");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("432");

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (items.length === 0) {
    return (
      <div className="page-shell animate-fade-in">
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <p className="empty-state-text">Your cart is empty.</p>
          <Link href="/customer" className="btn btn-primary" style={{ marginTop: 16 }}>
            Browse Catalog
          </Link>
        </div>
      </div>
    );
  }

  // ─── Format Card Input Helpers ─────────────────────────────────────────
  const handleCardNumberChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 16);
    const formatted = digitsOnly.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 4);
    if (digitsOnly.length >= 3) {
      setCardExpiry(`${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`);
    } else {
      setCardExpiry(digitsOnly);
    }
  };

  const handleCvcChange = (val: string) => {
    setCardCvc(val.replace(/\D/g, "").slice(0, 4));
  };

  // ─── Form Submission & Validation ──────────────────────────────────────
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim() || !email.includes("@")) newErrors.email = "Valid email is required";
    if (!phone.trim()) newErrors.phone = "Phone number is required";

    if (deliveryMethod === "delivery") {
      if (!address.trim()) newErrors.address = "Street address is required";
      if (!city.trim()) newErrors.city = "City is required";
      if (!zip.trim()) newErrors.zip = "ZIP code is required";
    }

    if (!cardName.trim()) newErrors.cardName = "Cardholder name is required";
    const rawCardDigits = cardNumber.replace(/\s/g, "");
    if (rawCardDigits.length !== 16) {
      newErrors.cardNumber = "Card number must be 16 digits";
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
      newErrors.cardExpiry = "Expiry must be MM/YY format";
    }
    if (cardCvc.length < 3) {
      newErrors.cardCvc = "CVC must be 3 or 4 digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    const fullAddress =
      deliveryMethod === "delivery"
        ? `${address}, ${city}, ${zip}`
        : "Store Pickup: 100 Main Street, Warehouse B";

    // Simulate payment processing delay
    setTimeout(() => {
      const order = createOrder(
        {
          name,
          email,
          phone,
          deliveryAddress: fullAddress,
        },
        deliveryMethod,
        items
      );

      clearCart();
      router.push(`/customer/confirmation?orderId=${order.id}`);
    }, 1000);
  };

  return (
    <div className="page-shell animate-fade-in">
      <nav className="breadcrumb">
        <Link href="/customer/cart" className="breadcrumb-link">
          ← Back to Cart
        </Link>
      </nav>

      <h1 className="page-title">Checkout</h1>
      <p className="page-subtitle">
        Select fulfillment method, enter details, and complete your reservation.
      </p>

      <form onSubmit={handleCheckoutSubmit}>
        <div className="checkout-layout">
          {/* Main Form Area */}
          <div className="checkout-main">
            {/* ─── 1. Delivery Method Toggle ─────────────────────────── */}
            <div className="card checkout-section">
              <h2 className="checkout-section-title">1. Fulfillment Method</h2>

              <div className="fulfillment-toggle">
                <button
                  type="button"
                  className={`fulfillment-option ${
                    deliveryMethod === "delivery" ? "active" : ""
                  }`}
                  onClick={() => setDeliveryMethod("delivery")}
                >
                  <span className="fulfillment-icon">🚚</span>
                  <div>
                    <strong>Deliver to me</strong>
                    <p>Standard jobsite or residential delivery</p>
                  </div>
                </button>

                <button
                  type="button"
                  className={`fulfillment-option ${
                    deliveryMethod === "pickup" ? "active" : ""
                  }`}
                  onClick={() => setDeliveryMethod("pickup")}
                >
                  <span className="fulfillment-icon">🏪</span>
                  <div>
                    <strong>Collect from store</strong>
                    <p>Pick up at Central Depot Warehouse</p>
                  </div>
                </button>
              </div>
            </div>

            {/* ─── 2. Contact & Address Details ──────────────────────── */}
            <div className="card checkout-section">
              <h2 className="checkout-section-title">
                2. Contact & {deliveryMethod === "delivery" ? "Delivery Address" : "Pickup Details"}
              </h2>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="cust-name">
                    Full Name
                  </label>
                  <input
                    id="cust-name"
                    type="text"
                    className={`form-input ${errors.name ? "input-error" : ""}`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errors.name && <span className="field-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="cust-email">
                    Email Address
                  </label>
                  <input
                    id="cust-email"
                    type="email"
                    className={`form-input ${errors.email ? "input-error" : ""}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cust-phone">
                  Phone Number
                </label>
                <input
                  id="cust-phone"
                  type="tel"
                  className={`form-input ${errors.phone ? "input-error" : ""}`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>

              {deliveryMethod === "delivery" ? (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="cust-address">
                      Street Address
                    </label>
                    <input
                      id="cust-address"
                      type="text"
                      className={`form-input ${errors.address ? "input-error" : ""}`}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                    {errors.address && <span className="field-error">{errors.address}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-city">
                        City
                      </label>
                      <input
                        id="cust-city"
                        type="text"
                        className={`form-input ${errors.city ? "input-error" : ""}`}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                      {errors.city && <span className="field-error">{errors.city}</span>}
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="cust-zip">
                        ZIP / Postal Code
                      </label>
                      <input
                        id="cust-zip"
                        type="text"
                        className={`form-input ${errors.zip ? "input-error" : ""}`}
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                      />
                      {errors.zip && <span className="field-error">{errors.zip}</span>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="pickup-info-box">
                  📍 <strong>Pickup Depot Address:</strong> 100 Main Street, Warehouse B, Springfield, OR 97477. Open Mon–Sat 7:00 AM – 6:00 PM.
                </div>
              )}
            </div>

            {/* ─── 3. Fake Payment Form ──────────────────────────────── */}
            <div className="card checkout-section">
              <div className="payment-header">
                <h2 className="checkout-section-title">3. Payment Information</h2>
                <span className="simulated-badge">⚡ Demo Payment (Simulated)</span>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="card-name">
                  Name on Card
                </label>
                <input
                  id="card-name"
                  type="text"
                  className={`form-input ${errors.cardName ? "input-error" : ""}`}
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
                {errors.cardName && <span className="field-error">{errors.cardName}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="card-number">
                  Card Number
                </label>
                <input
                  id="card-number"
                  type="text"
                  className={`form-input ${errors.cardNumber ? "input-error" : ""}`}
                  placeholder="4532 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                />
                {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="card-expiry">
                    Expiry Date (MM/YY)
                  </label>
                  <input
                    id="card-expiry"
                    type="text"
                    className={`form-input ${errors.cardExpiry ? "input-error" : ""}`}
                    placeholder="12/28"
                    value={cardExpiry}
                    onChange={(e) => handleExpiryChange(e.target.value)}
                  />
                  {errors.cardExpiry && <span className="field-error">{errors.cardExpiry}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="card-cvc">
                    CVC Code
                  </label>
                  <input
                    id="card-cvc"
                    type="text"
                    className={`form-input ${errors.cardCvc ? "input-error" : ""}`}
                    placeholder="432"
                    value={cardCvc}
                    onChange={(e) => handleCvcChange(e.target.value)}
                  />
                  {errors.cardCvc && <span className="field-error">{errors.cardCvc}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="checkout-sidebar">
            <div className="booking-card">
              <h2 className="booking-card-title">Order Items</h2>

              <div className="checkout-items-mini">
                {items.map((item) => (
                  <div key={item.product.id} className="checkout-item-mini">
                    <div>
                      <div className="checkout-item-name">{item.product.name}</div>
                      <div className="checkout-item-sub">
                        {item.quantity}× • {item.rentalStart} → {item.rentalEnd} (
                        {formatRentalUnit(item.product.rentalUnit, item.rentalUnits)})
                      </div>
                    </div>
                    <div className="checkout-item-price">
                      ${item.rentalCost.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cost-breakdown">
                <div className="cost-line">
                  <span className="cost-line-label">Rental Subtotal</span>
                  <span className="cost-line-amount">${totalRentalCost.toLocaleString()}</span>
                </div>

                <div className="cost-line cost-line-deposit">
                  <span className="cost-line-label">
                    Security Deposit
                    <span className="cost-line-detail">🔒 Refundable on return</span>
                  </span>
                  <span className="cost-line-amount">${totalDeposit.toLocaleString()}</span>
                </div>

                <div className="cost-total">
                  <span>Grand Total Due</span>
                  <span className="cost-total-amount">${grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing Payment..." : `Pay Now ($${grandTotal.toLocaleString()})`}
              </button>

              <p className="booking-note">
                🔒 Fake payment simulation — no real card will be charged.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
