"use client";

import { useEffect, useState } from "react";
import type { Rental } from "@/lib/data";

interface ReturnableRental extends Rental {
  product?: { name: string };
  estimatedLateFee: number;
}

export default function AdminReturnsPage() {
  const [returnableRentals, setReturnableRentals] = useState<ReturnableRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [lateConfig, setLateConfig] = useState({ dailyRate: 15, gracePeriodDays: 1 });

  const loadData = () => {
    setLoading(true);
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.returnsQueue)) {
          setReturnableRentals(data.returnsQueue);
        }
        if (data && data.lateConfig) {
          setLateConfig(data.lateConfig);
        }
      })
      .catch((err) => console.error("Error fetching returns queue:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProcessReturn = async (rentalId: string) => {
    setProcessingId(rentalId);
    try {
      const res = await fetch(`/api/rentals/${rentalId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ damageCharge: 0 }),
      });

      if (res.ok) {
        loadData();
      } else {
        alert("Failed to process return settlement.");
      }
    } catch (err) {
      console.error("Error returning rental:", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="page-shell animate-fade-in">
      <h1 className="page-title">Return Processing</h1>
      <p className="page-subtitle">
        Process equipment returns with auto late-fee calculation and deposit
        settlement. Late fee: ${lateConfig.dailyRate}/day after{" "}
        {lateConfig.gracePeriodDays}-day grace period.
      </p>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading return queue...
        </div>
      ) : returnableRentals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <p className="empty-state-text">
            No pending returns. All items have been returned!
          </p>
        </div>
      ) : (
        <div className="card-grid stagger-children">
          {returnableRentals.map((rental) => {
            const lateFee = rental.estimatedLateFee || 0;
            const refundAmount = Math.max(0, rental.depositAmount - lateFee);
            const isOverdue = rental.status === "overdue";

            return (
              <div
                key={rental.id}
                className="card"
                style={{
                  borderColor: isOverdue ? "rgba(239, 68, 68, 0.3)" : undefined,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: "16px",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginBottom: "2px",
                      }}
                    >
                      {rental.product?.name ?? rental.productId}
                    </h3>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {rental.id}
                    </span>
                  </div>
                  <span className={`badge badge-${rental.status}`}>
                    {rental.status}
                  </span>
                </div>

                {/* Customer & Dates */}
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                    marginBottom: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <div>
                    <strong style={{ color: "var(--text-primary)" }}>Customer:</strong>{" "}
                    {rental.customerName}
                  </div>
                  <div>
                    <strong style={{ color: "var(--text-primary)" }}>Due Date:</strong>{" "}
                    <span
                      style={{
                        color: isOverdue ? "var(--danger)" : undefined,
                        fontWeight: isOverdue ? 700 : undefined,
                      }}
                    >
                      {rental.rentalEnd}
                    </span>
                  </div>
                </div>

                {/* Fee Breakdown */}
                <div
                  style={{
                    background: "var(--bg-elevated)",
                    borderRadius: "var(--radius-md)",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "var(--text-muted)",
                      marginBottom: "12px",
                    }}
                  >
                    Settlement Breakdown
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Security Deposit</span>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                        ${rental.depositAmount}
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ color: "var(--text-secondary)" }}>Auto Late Fee</span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: lateFee > 0 ? "var(--danger)" : "var(--text-muted)",
                        }}
                      >
                        {lateFee > 0 ? `-$${lateFee}` : "$0"}
                      </span>
                    </div>
                    <div
                      style={{
                        borderTop: "1px solid var(--border)",
                        paddingTop: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                        Refund to Customer
                      </span>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          color: "var(--success)",
                        }}
                      >
                        ${refundAmount}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => handleProcessReturn(rental.id)}
                  disabled={processingId === rental.id}
                >
                  {processingId === rental.id ? "Processing..." : "Process Return & Settle"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
