"use client";

import { useEffect, useState } from "react";

interface Metrics {
  totalSales: number;
  totalLateFees: number;
  totalDeposits: number;
}

export default function AdminReportsPage() {
  const [metrics, setMetrics] = useState<Metrics>({ totalSales: 0, totalLateFees: 0, totalDeposits: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.metrics) setMetrics(data.metrics);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      `Metric,Amount\nTotal Sales,$${metrics.totalSales}\nLate Fees,$${metrics.totalLateFees}\nDeposits Held,$${metrics.totalDeposits}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "locare_rental_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-shell animate-fade-in">
      <div className="erp-top-bar">
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            Reports & Analytics
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Financial reporting for Admin and individual vendors.
          </p>
        </div>

        {/* Action Controls matching Wireframe Image 3 */}
        <div className="report-actions-row">
          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
            🖨️ Print PDF
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExportCSV}>
            📥 Export Excel & CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading reports...
        </div>
      ) : (
        <div className="reports-grid">
          {/* Summary Cards */}
          <div className="stat-grid stagger-children">
            <div className="stat-card">
              <span className="stat-label">Total Sales Revenue</span>
              <span className="stat-value primary">${metrics.totalSales.toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Late Fee Penalties</span>
              <span className="stat-value danger">${metrics.totalLateFees.toLocaleString()}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Security Deposits Held</span>
              <span className="stat-value warning">${metrics.totalDeposits.toLocaleString()}</span>
            </div>
          </div>

          {/* Visual Analytics Chart (Image 4 Wireframe) */}
          <div className="card report-chart-card" style={{ marginTop: 24 }}>
            <h3 className="settings-section-title">Revenue & Overdue Penalty Analytics</h3>

            <div className="chart-wrapper">
              <svg width="100%" height="240" viewBox="0 0 600 240" fill="none" className="chart-svg">
                {/* Gridlines */}
                <line x1="40" y1="40" x2="580" y2="40" stroke="var(--border)" strokeDasharray="3 3" />
                <line x1="40" y1="100" x2="580" y2="100" stroke="var(--border)" strokeDasharray="3 3" />
                <line x1="40" y1="160" x2="580" y2="160" stroke="var(--border)" strokeDasharray="3 3" />
                <line x1="40" y1="200" x2="580" y2="200" stroke="var(--border)" />

                {/* SVG Bar Visualizations */}
                <rect x="80" y="60" width="50" height="140" fill="var(--primary)" rx="4" />
                <rect x="180" y="40" width="50" height="160" fill="var(--primary)" rx="4" />
                <rect x="280" y="90" width="50" height="110" fill="var(--primary)" rx="4" />
                <rect x="380" y="30" width="50" height="170" fill="var(--primary)" rx="4" />
                <rect x="480" y="80" width="50" height="120" fill="var(--primary)" rx="4" />

                {/* X Axis Labels */}
                <text x="105" y="220" fill="var(--text-muted)" fontSize="12" textAnchor="middle">
                  Mon
                </text>
                <text x="205" y="220" fill="var(--text-muted)" fontSize="12" textAnchor="middle">
                  Tue
                </text>
                <text x="305" y="220" fill="var(--text-muted)" fontSize="12" textAnchor="middle">
                  Wed
                </text>
                <text x="405" y="220" fill="var(--text-muted)" fontSize="12" textAnchor="middle">
                  Thu
                </text>
                <text x="505" y="220" fill="var(--text-muted)" fontSize="12" textAnchor="middle">
                  Fri
                </text>
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
