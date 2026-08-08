"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Rental } from "@/lib/data";

export default function AdminRentalsPage() {
  const [rentals, setRentals] = useState<Array<Rental & { product?: { name: string } }>>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchRentals = () => {
    fetch("/api/rentals")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRentals(data);
      })
      .catch((err) => console.error("Error loading rentals:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handlePickup = async (id: string | number) => {
    setProcessingId(String(id));
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/rentals/${id}/pickup`, {
        method: "POST",
      });

      const data = await res.json();
      setProcessingId(null);

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to process pickup.");
      } else {
        setSuccessMsg(`Rental ${id} marked as Picked Up!`);
        fetchRentals();
      }
    } catch {
      setProcessingId(null);
      setErrorMsg("Failed to process pickup.");
    }
  };

  const handleReturn = async (id: string | number) => {
    setProcessingId(String(id));
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/rentals/${id}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ damageCharge: 0 }),
      });

      const data = await res.json();
      setProcessingId(null);

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to process return.");
      } else {
        setSuccessMsg(`Rental ${id} processed as Returned! Product stock restored.`);
        fetchRentals();
      }
    } catch {
      setProcessingId(null);
      setErrorMsg("Failed to process return.");
    }
  };

  return (
    <div className="page-shell animate-fade-in">
      <div className="erp-top-bar">
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            Manage Rentals & Fulfillment Status
          </h1>
          <p className="page-subtitle" style={{ margin: "4px 0 0 0" }}>
            Admin access to handle Pick Up handover and Return processing for customer rentals.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div
          className="animate-fade-in"
          style={{
            background: "#FEF2F2",
            border: "2px solid #EF4444",
            color: "#991B1B",
            padding: "12px 16px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontWeight: 700,
          }}
        >
          ⛔ {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="auth-success-badge animate-fade-in" style={{ marginBottom: 20 }}>
          ✅ {successMsg}
        </div>
      )}

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
                <th>Admin Actions (Pick Up & Return)</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((rental) => {
                const statusStr = String(rental.status).toUpperCase();
                const isPickedUp = statusStr === "PICKED_UP" || statusStr === "ACTIVE";
                const isReturned = statusStr === "RETURNED";
                const isBooked = !isPickedUp && !isReturned;

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
                      <span
                        className="badge"
                        style={{
                          background: isReturned
                            ? "rgba(16, 185, 129, 0.2)"
                            : isPickedUp
                            ? "rgba(56, 189, 248, 0.2)"
                            : "rgba(245, 158, 11, 0.2)",
                          color: isReturned
                            ? "#10b981"
                            : isPickedUp
                            ? "#38bdf8"
                            : "#f59e0b",
                          fontWeight: 700,
                        }}
                      >
                        {rental.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {isBooked && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ background: "#0284c7", borderColor: "#38bdf8", fontSize: "0.75rem" }}
                            onClick={() => handlePickup(rental.id)}
                            disabled={processingId === String(rental.id)}
                          >
                            {processingId === String(rental.id) ? "Updating..." : "📦 Mark Picked Up"}
                          </button>
                        )}

                        {!isReturned && (
                          <button
                            className="btn btn-primary btn-sm"
                            style={{ background: "#059669", borderColor: "#10b981", fontSize: "0.75rem" }}
                            onClick={() => handleReturn(rental.id)}
                            disabled={processingId === String(rental.id)}
                          >
                            {processingId === String(rental.id) ? "Returning..." : "🔄 Process Return"}
                          </button>
                        )}

                        {isReturned && (
                          <span style={{ fontSize: "0.8rem", color: "#10b981", fontWeight: 700 }}>
                            ✓ Returned & Stock Restored
                          </span>
                        )}
                      </div>
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
