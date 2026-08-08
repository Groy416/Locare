"use client";

import Link from "next/link";
import { rentals, getProduct } from "@/lib/data";

export default function CustomerBookingsPage() {
  return (
    <div className="page-shell animate-fade-in">
      <div className="catalog-header">
        <div>
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">
            Track your active reservations, upcoming rentals, and return statuses.
          </p>
        </div>
        <Link href="/customer" className="btn btn-primary btn-sm">
          + New Rental
        </Link>
      </div>

      {rentals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-text">
            No bookings found. Browse the catalog to place your first reservation!
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Equipment</th>
                <th>Customer</th>
                <th>Rental Dates</th>
                <th>Fulfillment</th>
                <th>Status</th>
                <th>Deposit Held</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => {
                const product = getProduct(rental.productId);

                return (
                  <tr key={rental.id}>
                    <td
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                      }}
                    >
                      {rental.id}
                    </td>
                    <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {product?.name ?? "Equipment Rental"}
                    </td>
                    <td>{rental.customerName}</td>
                    <td style={{ fontSize: "0.85rem" }}>
                      {rental.rentalStart} → {rental.rentalEnd}
                    </td>
                    <td>
                      <span className={`badge ${rental.deliveryMethod === "delivery" ? "badge-active" : "badge-booked"}`}>
                        {rental.deliveryMethod}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${rental.status}`}>
                        {rental.status}
                      </span>
                    </td>
                    <td style={{ color: "var(--warning)", fontWeight: 600 }}>
                      ${rental.depositAmount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
