"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Rental } from "@/lib/data";

export default function AdminRentalsPage() {
  const [rentals, setRentals] = useState<Array<Rental & { product?: { name: string } }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rentals")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRentals(data);
      })
      .catch((err) => console.error("Error loading rentals:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell animate-fade-in">
      <h1 className="page-title">Manage Rentals</h1>
      <p className="page-subtitle">
        View and manage all rental bookings stored in the database.
      </p>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading rental records...
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Rental ID</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Start</th>
                <th>End</th>
                <th>Delivery</th>
                <th>Status</th>
                <th>Actions</th>
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
                  <td style={{ fontSize: "0.85rem" }}>{rental.rentalStart}</td>
                  <td style={{ fontSize: "0.85rem" }}>{rental.rentalEnd}</td>
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
                    {(rental.status === "active" || rental.status === "overdue") && (
                      <Link href="/admin/returns" className="btn btn-ghost btn-sm">
                        Process Return
                      </Link>
                    )}
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
