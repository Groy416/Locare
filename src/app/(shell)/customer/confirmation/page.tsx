"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/data";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "SO00001";
  const order = getOrder(orderId);

  const rentalAmount = order?.totalRentalCost ?? 0;
  const depositAmount = order?.totalDeposit ?? 0;
  const grandTotal = order?.grandTotal ?? 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-shell animate-fade-in invoice-printable">
      {/* Printable Header - Visible only in Print / PDF */}
      <div className="print-only invoice-print-header">
        <h1>RENTFLOW INVOICE & RESERVATION RECEIPT</h1>
        <p>Order Reference: {orderId} • Date: {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}</p>
      </div>

      {/* Payment Success Banner */}
      <div className="confirmation-banner card">
        <div className="confirmation-top-row">
          <span className="payment-status-badge">✓ Payment Successful (Simulated)</span>
          <button onClick={handlePrint} className="btn btn-ghost btn-sm no-print">
            🖨️ Download / Print Invoice
          </button>
        </div>

        <div className="confirmation-icon">🎉</div>
        <h1 className="confirmation-title">Booking Confirmed!</h1>
        <p className="confirmation-subtitle">
          Order <strong>#{orderId}</strong> has been successfully placed and added to system records.
        </p>

        {/* Separate Rental & Deposit Highlight Banner */}
        <div className="payment-banner-breakdown">
          <div className="payment-banner-pill">
            <span>Rental Amount Paid:</span>
            <strong>${rentalAmount.toLocaleString()}</strong>
          </div>
          <div className="payment-banner-pill deposit">
            <span>Security Deposit Held:</span>
            <strong>🔒 ${depositAmount.toLocaleString()}</strong>
          </div>
          <div className="payment-banner-pill grand">
            <span>Total Paid Now:</span>
            <strong>${grandTotal.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="confirmation-grid">
        {/* Customer & Fulfillment Details */}
        <div className="card">
          <h2 className="checkout-section-title">Fulfillment & Contact Info</h2>
          <div className="confirmation-details-list">
            <div className="confirmation-detail-item">
              <span>Customer Name:</span>
              <strong>{order?.customerName || "Alex Morgan"}</strong>
            </div>

            <div className="confirmation-detail-item">
              <span>Email:</span>
              <strong>{order?.customerEmail || "alex.morgan@example.com"}</strong>
            </div>

            <div className="confirmation-detail-item">
              <span>Phone:</span>
              <strong>{order?.customerPhone || "+1 (555) 234-5678"}</strong>
            </div>

            <div className="confirmation-detail-item">
              <span>Fulfillment Option:</span>
              <strong style={{ textTransform: "capitalize" }}>
                {order?.deliveryMethod === "delivery" ? "🚚 Delivery to Address" : "🏪 Store Pickup"}
              </strong>
            </div>

            <div className="confirmation-detail-item">
              <span>Destination / Depot:</span>
              <strong>{order?.deliveryAddress || "742 Evergreen Terrace, Springfield"}</strong>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="card">
          <h2 className="checkout-section-title">Financial Summary</h2>
          <div className="confirmation-details-list">
            <div className="confirmation-detail-item">
              <span>Rental Charges (Subtotal):</span>
              <strong>${rentalAmount.toLocaleString()}</strong>
            </div>

            <div className="confirmation-detail-item">
              <span>Security Deposit (Refundable):</span>
              <strong style={{ color: "var(--warning)" }}>
                🔒 ${depositAmount.toLocaleString()}
              </strong>
            </div>

            <div className="confirmation-detail-item total">
              <span>Total Paid at Checkout:</span>
              <strong style={{ color: "var(--primary-light)", fontSize: "1.25rem" }}>
                ${grandTotal.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Reserved Items Table */}
      <h2 className="checkout-section-title" style={{ marginTop: 32, marginBottom: 16 }}>
        Reserved Line Items
      </h2>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Equipment Name</th>
              <th>Rental Period</th>
              <th>Qty</th>
              <th>Rental Cost</th>
              <th>Security Deposit</th>
            </tr>
          </thead>
          <tbody>
            {order?.items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {item.productName}
                </td>
                <td>
                  {item.rentalStart} → {item.rentalEnd}
                </td>
                <td>{item.quantity}</td>
                <td>${item.rentalCost.toLocaleString()}</td>
                <td style={{ color: "var(--warning)", fontWeight: 600 }}>
                  ${item.depositTotal.toLocaleString()}
                </td>
              </tr>
            )) ?? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  No order items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Action Buttons */}
      <div className="confirmation-actions no-print">
        <button onClick={handlePrint} className="btn btn-ghost btn-lg">
          🖨️ Print / Download Invoice
        </button>

        <Link href="/customer/bookings" className="btn btn-primary btn-lg">
          View My Bookings
        </Link>

        <Link href="/customer" className="btn btn-ghost btn-lg">
          Back to Equipment Catalog
        </Link>
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
