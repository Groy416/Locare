"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/data";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "SO00010";
  const order = getOrder(orderId);

  const rentalAmount = order?.totalRentalCost ?? 0;
  const depositAmount = order?.totalDeposit ?? 0;
  const grandTotal = order?.grandTotal ?? 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-shell animate-fade-in">
      {/* Printable Header - Visible only when printing */}
      <div className="print-only invoice-print-header">
        <h1>RENTFLOW INVOICE & RESERVATION RECEIPT</h1>
        <p>Order Reference: {orderId} • Date: {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
      </div>

      <div className="cart-layout">
        {/* Left Column (Image 2 Wireframe) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Header Row: Title + Print Button */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 className="confirmation-title" style={{ fontSize: "2.2rem", color: "#f87171" }}>
                Thank you for your order
              </h1>
              <p style={{ fontSize: "1.1rem", color: "var(--text-secondary)", marginTop: 4 }}>
                Order <strong>{orderId}</strong>
              </p>
            </div>

            <button onClick={handlePrint} className="btn btn-ghost btn-sm no-print">
              🖨️ Print
            </button>
          </div>

          {/* Solid Green Payment Banner (Image 2 Wireframe: "Your Payment has been processed.") */}
          <div className="green-payment-banner">
            <span>✓</span> Your Payment has been processed.
          </div>

          {/* Delivery & Billing Customer Card (Image 2 Wireframe) */}
          <div className="card">
            <span className="main-address-badge" style={{ marginBottom: 12, display: "inline-block" }}>
              Delivery & Billing
            </span>
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-primary)", marginBottom: 8 }}>
              {order?.customerName || "Alex Morgan"}
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              {order?.deliveryAddress || "742 Evergreen Terrace, Springfield, OR 97477"}
            </p>
          </div>
        </div>

        {/* Right Column: Order Summary Card (Image 2 Wireframe) */}
        <div className="cart-summary-sidebar">
          <div className="booking-card">
            <h2 className="booking-card-title">Order Breakdown</h2>

            {order?.items.map((item, idx) => (
              <div key={idx} className="checkout-item-mini" style={{ paddingBottom: 12 }}>
                <div>
                  <div className="checkout-item-name">{item.productName}</div>
                  <div className="checkout-item-sub">
                    ${item.rentalCost.toLocaleString()} ({item.quantity}×)
                  </div>
                </div>
              </div>
            ))}

            <div className="cost-breakdown">
              <div className="cost-line">
                <span className="cost-line-label">Rental Period</span>
                <span className="cost-line-amount" style={{ fontSize: "0.8rem" }}>
                  {order?.items[0]?.rentalStart || "Today"} to {order?.items[0]?.rentalEnd || "End Date"}
                </span>
              </div>

              <div className="cost-line">
                <span className="cost-line-label">Delivery Charges</span>
                <span className="cost-line-amount">-</span>
              </div>

              <div className="cost-line">
                <span className="cost-line-label">Sub Total</span>
                <span className="cost-line-amount">${rentalAmount.toLocaleString()}</span>
              </div>

              <div className="cost-line cost-line-deposit">
                <span className="cost-line-label">
                  Security Deposit
                  <span className="cost-line-detail">🔒 Refundable</span>
                </span>
                <span className="cost-line-amount">${depositAmount.toLocaleString()}</span>
              </div>

              <div className="cost-total">
                <span>Total</span>
                <span className="cost-total-amount">${grandTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="confirmation-actions no-print" style={{ marginTop: 16 }}>
              <Link href="/customer/bookings" className="btn btn-primary btn-block">
                View My Orders
              </Link>
              <Link href="/customer" className="btn btn-ghost btn-block" style={{ fontSize: "0.85rem" }}>
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="page-shell"><p>Loading order details...</p></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
