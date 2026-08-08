"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/data";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "SO00001";
  const order = getOrder(orderId);

  return (
    <div className="page-shell animate-fade-in">
      <div className="confirmation-banner card">
        <div className="confirmation-icon">✅</div>
        <h1 className="confirmation-title">Booking Confirmed!</h1>
        <p className="confirmation-subtitle">
          Thank you! Your equipment reservation has been placed successfully.
        </p>

        <div className="order-id-badge">
          Order Reference: <strong>{orderId}</strong>
        </div>
      </div>

      <div className="confirmation-grid">
        {/* Customer & Fulfillment Details */}
        <div className="card">
          <h2 className="checkout-section-title">Reservation Details</h2>
          <div className="confirmation-details-list">
            <div className="confirmation-detail-item">
              <span>Customer Name:</span>
              <strong>{order?.customerName || "Alex Morgan"}</strong>
            </div>

            <div className="confirmation-detail-item">
              <span>Contact Email:</span>
              <strong>{order?.customerEmail || "alex.morgan@example.com"}</strong>
            </div>

            <div className="confirmation-detail-item">
              <span>Contact Phone:</span>
              <strong>{order?.customerPhone || "+1 (555) 234-5678"}</strong>
            </div>

            <div className="confirmation-detail-item">
              <span>Fulfillment Option:</span>
              <strong style={{ textTransform: "capitalize" }}>
                {order?.deliveryMethod === "delivery" ? "🚚 Delivery to Address" : "🏪 Store Pickup"}
              </strong>
            </div>

            <div className="confirmation-detail-item">
              <span>Address / Location:</span>
              <strong>{order?.deliveryAddress || "742 Evergreen Terrace, Springfield"}</strong>
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="card">
          <h2 className="checkout-section-title">Payment Summary</h2>
          <div className="confirmation-details-list">
            <div className="confirmation-detail-item">
              <span>Rental Charges Paid:</span>
              <strong>${(order?.totalRentalCost ?? 0).toLocaleString()}</strong>
            </div>

            <div className="confirmation-detail-item">
              <span>Security Deposit Held:</span>
              <strong style={{ color: "var(--warning)" }}>
                🔒 ${(order?.totalDeposit ?? 0).toLocaleString()}
              </strong>
            </div>

            <div className="confirmation-detail-item total">
              <span>Total Paid Now:</span>
              <strong style={{ color: "var(--primary-light)", fontSize: "1.2rem" }}>
                ${(order?.grandTotal ?? 0).toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Reserved Items List */}
      <h2 className="checkout-section-title" style={{ marginTop: 32, marginBottom: 16 }}>
        Reserved Items
      </h2>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Item Name</th>
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
                  No order item details available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="confirmation-actions">
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
    <Suspense fallback={<div className="page-shell"><p>Loading booking details...</p></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}

