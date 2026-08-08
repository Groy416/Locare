"use client";

import { rentals, getProduct } from "@/lib/data";

export default function AdminRentalsPage() {
  return (
    <div className="page-shell animate-fade-in">
      <h1 className="page-title">Manage Rentals</h1>
      <p className="page-subtitle">
        View and manage all rental bookings.
      </p>

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
                    {product?.name ?? "Unknown"}
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
                      <button className="btn btn-ghost btn-sm">
                        Process Return
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
