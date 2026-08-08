"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, formatRentalUnit } from "@/lib/cart-context";
import { createOrder, type DeliveryMethod } from "@/lib/data";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalRentalCost, totalDeposit, grandTotal, clearCart } = useCart();

  // Step state: 'address' (Step 1) | 'payment' (Step 2)
  const [currentStep, setCurrentStep] = useState<"address" | "payment">("address");

  // Form State
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [name, setName] = useState("Alex Morgan");
  const [email, setEmail] = useState("alex.morgan@example.com");
  const [phone, setPhone] = useState("+1 (555) 234-5678");
  const [address, setAddress] = useState("742 Evergreen Terrace");
  const [city, setCity] = useState("Springfield");
  const [zip, setZip] = useState("97477");
  const [sameBillingAddress, setSameBillingAddress] = useState(true);

  // Payment State
  const [cardName, setCardName] = useState("Alex Morgan");
  const [cardNumber, setCardNumber] = useState("4532 8912 3456 7890");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("432");
  const [savePaymentDetails, setSavePaymentDetails] = useState(true);

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

  const handleCardNumberChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "").slice(0, 16);
    const formatted = digitsOnly.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  const handleNextToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim() || !email.includes("@")) newErrors.email = "Valid email is required";
    if (deliveryMethod === "delivery" && !address.trim()) newErrors.address = "Address is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep("payment");
  };

  const handleFinalPaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!cardName.trim()) newErrors.cardName = "Cardholder name is required";
    if (cardNumber.replace(/\s/g, "").length !== 16) newErrors.cardNumber = "Card number must be 16 digits";

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
      {/* Wireframe Step Breadcrumbs (Image 3) */}
      <nav className="checkout-breadcrumbs">
        <span className="checkout-breadcrumb-item">Breadcrumb</span>
        <span>&gt;</span>
        <span className="checkout-breadcrumb-item">Order</span>
        <span>&gt;</span>
        <span className={`checkout-breadcrumb-item ${currentStep === "address" ? "active" : ""}`}>
          Address
        </span>
        <span>&gt;</span>
        <span className={`checkout-breadcrumb-item ${currentStep === "payment" ? "active" : ""}`}>
          Payment
        </span>
      </nav>

      <div className="checkout-layout">
        {/* Main Column */}
        <div className="checkout-main">
          {currentStep === "address" ? (
            /* ─── Step 1: Address & Delivery Method (Image 3 Wireframe Left) ─── */
            <form onSubmit={handleNextToPayment} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="card checkout-section">
                <h2 className="checkout-section-title">Delivery Method</h2>
                <div className="fulfillment-toggle">
                  <button
                    type="button"
                    className={`fulfillment-option ${deliveryMethod === "delivery" ? "active" : ""}`}
                    onClick={() => setDeliveryMethod("delivery")}
                  >
                    <span className="fulfillment-icon">🚚</span>
                    <div style={{ flex: 1 }}>
                      <strong>Standard Delivery</strong>
                      <p>Standard jobsite or home delivery</p>
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--success)" }}>Free</span>
                  </button>

                  <button
                    type="button"
                    className={`fulfillment-option ${deliveryMethod === "pickup" ? "active" : ""}`}
                    onClick={() => setDeliveryMethod("pickup")}
                  >
                    <span className="fulfillment-icon">🏪</span>
                    <div style={{ flex: 1 }}>
                      <strong>Pick up from Store</strong>
                      <p>Pick up at Central Depot Warehouse</p>
                    </div>
                    <span style={{ fontWeight: 700, color: "var(--success)" }}>Free</span>
                  </button>
                </div>
              </div>

              {/* Delivery Address Card with Main Address badge & edit icon */}
              <div className="card checkout-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 className="checkout-section-title">Delivery Address</h2>
                  <span className="main-address-badge">Main Address</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input
                      type="text"
                      className={`form-input ${errors.name ? "input-error" : ""}`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-input ${errors.email ? "input-error" : ""}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {deliveryMethod === "delivery" && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Street Address</label>
                      <input
                        type="text"
                        className={`form-input ${errors.address ? "input-error" : ""}`}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">City</label>
                        <input
                          type="text"
                          className="form-input"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">ZIP Code</label>
                        <input
                          type="text"
                          className="form-input"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Wireframe Billing Address Toggle Switch */}
              <div className="card checkout-section">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input
                    type="checkbox"
                    id="billing-toggle"
                    checked={sameBillingAddress}
                    onChange={(e) => setSameBillingAddress(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: "var(--primary)" }}
                  />
                  <label htmlFor="billing-toggle" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    <strong>Billing Address:</strong> If enabled, it will make Billing and Delivery address the same
                  </label>
                </div>
              </div>
            </form>
          ) : (
            /* ─── Step 2: Payment Method (Image 3 Wireframe Right) ───────────── */
            <form onSubmit={handleFinalPaySubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div className="card checkout-section">
                <div className="payment-header">
                  <h2 className="checkout-section-title">Payment Method</h2>
                  <span className="simulated-badge">⚡ Demo Payment</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Card Details</label>
                  <input
                    type="text"
                    className={`form-input ${errors.cardNumber ? "input-error" : ""}`}
                    placeholder="XXXX XXXX XXXX XXXX"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                  />
                  {errors.cardNumber && <span className="field-error">{errors.cardNumber}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVC</label>
                    <input
                      type="text"
                      className="form-input"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                    />
                  </div>
                </div>

                {/* Wireframe checkbox: ☐ Save my payment details */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <input
                    type="checkbox"
                    id="save-card"
                    checked={savePaymentDetails}
                    onChange={(e) => setSavePaymentDetails(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: "var(--primary)" }}
                  />
                  <label htmlFor="save-card" style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    Save my payment details
                  </label>
                </div>
              </div>

              {/* Delivery & Billing Summary Card with Edit button ✏️ */}
              <div className="card checkout-section">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h2 className="checkout-section-title">Delivery & Billing Summary</h2>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setCurrentStep("address")}
                  >
                    ✏️ Edit
                  </button>
                </div>

                <div style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                  <strong>{name}</strong>
                  <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>
                    {deliveryMethod === "delivery" ? `${address}, ${city}, ${zip}` : "Store Pickup"}
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="checkout-sidebar">
          <div className="booking-card">
            <h2 className="booking-card-title">Order Summary</h2>

            <div className="checkout-items-mini">
              {items.map((item) => (
                <div key={item.product.id} className="checkout-item-mini">
                  <div>
                    <div className="checkout-item-name">{item.product.name}</div>
                    <div className="checkout-item-sub">
                      {item.quantity}× • {formatRentalUnit(item.product.rentalUnit, item.rentalUnits)}
                    </div>
                  </div>
                  <div className="checkout-item-price">${item.rentalCost.toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="cost-breakdown">
              <div className="cost-line">
                <span className="cost-line-label">Delivery Charges</span>
                <span className="cost-line-amount">-</span>
              </div>
              <div className="cost-line">
                <span className="cost-line-label">Sub Total</span>
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
                <span>Total</span>
                <span className="cost-total-amount">${grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Wireframe Step Action Buttons */}
            {currentStep === "address" ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg"
                  onClick={handleNextToPayment}
                >
                  Continued &gt;
                </button>
                <Link href="/customer/cart" className="btn btn-ghost btn-block" style={{ textAlign: "center" }}>
                  &lt; Back to Cart
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg"
                  onClick={handleFinalPaySubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processing..." : "Pay Now"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  onClick={() => setCurrentStep("address")}
                >
                  &lt; Back to Address
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
