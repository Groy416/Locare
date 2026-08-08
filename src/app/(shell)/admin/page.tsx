"use client";

import { useEffect, useState } from "react";
import type { Rental, Product } from "@/lib/data";
import type { DashboardMetrics } from "@/lib/rental-logic";

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    metrics: DashboardMetrics;
    rentals: Rental[];
    products: Product[];
    returnsQueue: Array<Rental & { estimatedLateFee: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        if (resData && resData.metrics) {
          setData({
            metrics: resData.metrics,
            rentals: resData.rentals || [],
            products: resData.products || [],
            returnsQueue: resData.returnsQueue || [],
          });
        }
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="page-shell animate-fade-in">
        <h1 className="page-title">Admin Dashboard</h1>
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading real-time operational dashboard from database...
        </div>
      </div>
    );
  }

  const { metrics, rentals, returnsQueue } = data;
  const activeCount = rentals.filter((r) => r.status === "active").length;
  const overdueCount = rentals.filter((r) => r.status === "overdue").length;
  const bookedCount = rentals.filter((r) => r.status === "booked").length;
  const returnedCount = rentals.filter((r) => r.status === "returned").length;

  const pendingLateFees = returnsQueue.reduce(
    (sum, r) => sum + (r.estimatedLateFee || 0),
    0
  );

  return (
    <div className="page-shell animate-fade-in">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">
        Real-time rental metrics and operational overview.
      </p>

      {/* ─── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="stat-grid stagger-children">
        <div className="stat-card">
          <span className="stat-label">Active Rentals</span>
          <span className="stat-value primary">{activeCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Overdue</span>
          <span className="stat-value danger">{overdueCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Upcoming Bookings</span>
          <span className="stat-value">{bookedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Returned</span>
          <span className="stat-value success">{returnedCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Est. Revenue</span>
          <span className="stat-value primary">
            ${metrics.totalRevenue.toLocaleString()}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Deposits Held</span>
          <span className="stat-value warning">
            ${metrics.totalHeldDeposits.toLocaleString()}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Late Fees</span>
          <span className="stat-value danger">
            ${pendingLateFees.toLocaleString()}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Utilization Rate</span>
          <span className="stat-value primary">{metrics.utilizationRate}%</span>
        </div>
      </div>

      {/* ─── Recent Rentals Table ────────────────────────────────────────── */}
      <h2
        style={{
          fontSize: "1.15rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: "16px",
        }}
      >
        All Rentals
      </h2>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Product ID</th>
              <th>Customer</th>
              <th>Period</th>
              <th>Status</th>
              <th>Deposit</th>
              <th>Late Fee</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => {
              const lateFee = rental.lateFeeCharged || 0;

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
                    {rental.productId}
                  </td>
                  <td>{rental.customerName}</td>
                  <td>
                    <div style={{ fontSize: "0.8rem" }}>
                      {rental.rentalStart} → {rental.rentalEnd}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${rental.status}`}>
                      {rental.status}
                    </span>
                  </td>
                  <td>
                    <div>
                      <span style={{ fontWeight: 600 }}>
                        ${rental.depositAmount}
                      </span>
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {rental.depositStatus}
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      color: lateFee > 0 ? "var(--danger)" : "var(--text-muted)",
                      fontWeight: lateFee > 0 ? 700 : 400,
                    }}
                  >
                    {lateFee > 0 ? `$${lateFee}` : "—"}
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
