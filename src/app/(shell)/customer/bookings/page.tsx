"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Rental } from "@/lib/data";

export default function CustomerBookingsPage() {
  const [rentals, setRentals] = useState<Array<Rental & { product?: { name: string } }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rentals")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRentals(data);
      })
      .catch((err) => console.error("Error loading customer bookings:", err))
      .finally(() => setLoading(false));
  }, []);

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

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading your bookings...
        </div>
      ) : rentals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-text">
            No bookings found. Browse the catalog to place your first reservation!
          </p>
          <Link href="/customer" className="btn btn-primary" style={{ marginTop: 16 }}>
            Browse Catalog
          </Link>
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
                <th>Deposit</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => (
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
                    {rental.product?.name || rental.productId}
                  </td>
                  <td>{rental.customerName}</td>
                  <td>
                    <div style={{ fontSize: "0.85rem" }}>
                      {rental.rentalStart} → {rental.rentalEnd}
                    </div>
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
                  <td>
                    <span style={{ color: "var(--warning)", fontWeight: 600 }}>
                      ${rental.depositAmount.toLocaleString()}
                    </span>{" "}
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      ({rental.depositStatus})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
