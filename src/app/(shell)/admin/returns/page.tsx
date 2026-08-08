"use client";

import {
  rentals,
  getProduct,
  calculateLateFee,
  calculateDepositRefund,
  lateFeeConfig,
} from "@/lib/data";

export default function AdminReturnsPage() {
  // Only show active and overdue rentals that can be returned
  const returnableRentals = rentals.filter(
    (r) => r.status === "active" || r.status === "overdue"
  );

  return (
    <div className="page-shell animate-fade-in">
      <h1 className="page-title">Return Processing</h1>
      <p className="page-subtitle">
        Process equipment returns with auto late-fee calculation and deposit
        settlement. Late fee: ${lateFeeConfig.dailyRate}/day after{" "}
        {lateFeeConfig.gracePeriodDays}-day grace period.
      </p>

      {returnableRentals.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <p className="empty-state-text">
            No pending returns. All items have been returned!
          </p>
        </div>
      ) : (
        <div className="card-grid stagger-children">
          {returnableRentals.map((rental) => {
            const product = getProduct(rental.productId);
            const lateFee = calculateLateFee(rental);
            const refundAmount = calculateDepositRefund(rental, lateFee);
            const isOverdue = rental.status === "overdue";

            return (
              <div
                key={rental.id}
                className="card"
                style={{
                  borderColor: isOverdue
                    ? "rgba(239, 68, 68, 0.3)"
                    : undefined,
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
                      {product?.name ?? "Unknown"}
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
                    <strong style={{ color: "var(--text-primary)" }}>
                      Customer:
                    </strong>{" "}
                    {rental.customerName}
                  </div>
                  <div>
                    <strong style={{ color: "var(--text-primary)" }}>
                      Due Date:
                    </strong>{" "}
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "var(--text-secondary)" }}>
                        Security Deposit
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          color: "var(--text-primary)",
                        }}
                      >
                        ${rental.depositAmount}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ color: "var(--text-secondary)" }}>
                        Late Fee
                      </span>
                      <span
                        style={{
                          fontWeight: 600,
                          color:
                            lateFee > 0 ? "var(--danger)" : "var(--text-muted)",
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
                      <span
                        style={{
                          fontWeight: 700,
                          color: "var(--text-primary)",
                        }}
                      >
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
                <button className="btn btn-primary btn-block">
                  Process Return & Settle
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
