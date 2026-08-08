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

  // New UI states for Managing Inventory
  const [activeTab, setActiveTab] = useState<"rentals" | "inventory">("rentals");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "Cleaning Equipment",
    rentalUnit: "day",
    price: "",
    securityDeposit: "",
    inStock: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const refreshDashboard = () => {
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
      .catch((err) => console.error("Error refreshing dashboard data:", err));
  };

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

  const { metrics, rentals, returnsQueue, products } = data;
  const activeCount = rentals.filter((r) => r.status === "active").length;
  const overdueCount = rentals.filter((r) => r.status === "overdue").length;
  const bookedCount = rentals.filter((r) => r.status === "booked").length;
  const returnedCount = rentals.filter((r) => r.status === "returned").length;

  const pendingLateFees = returnsQueue.reduce(
    (sum, r) => sum + (r.estimatedLateFee || 0),
    0
  );

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          securityDeposit: parseFloat(newProduct.securityDeposit),
          inStock: parseInt(newProduct.inStock, 10),
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to add product");
      }

      await response.json();
      
      // Refresh dashboard data so the newly added product immediately shows up
      refreshDashboard();

      // Reset product state and close modal
      setNewProduct({
        name: "",
        description: "",
        category: "Cleaning Equipment",
        rentalUnit: "day",
        price: "",
        securityDeposit: "",
        inStock: "",
      });
      setShowAddModal(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to save product");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell animate-fade-in">
      <h1 className="page-title">Admin Dashboard</h1>
      <p className="page-subtitle">
        Real-time rental metrics and operational overview.
      </p>

      {/* ─── Tab Navigation Selector ────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "28px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
        <button
          onClick={() => setActiveTab("rentals")}
          className={`btn ${activeTab === "rentals" ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "8px 16px" }}
        >
          📈 Rentals Overview
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`btn ${activeTab === "inventory" ? "btn-primary" : "btn-ghost"}`}
          style={{ padding: "8px 16px" }}
        >
          📦 Equipment Inventory
        </button>
      </div>

      {activeTab === "rentals" && (
        <div className="animate-fade-in">
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
      )}

      {activeTab === "inventory" && (
        <div className="animate-fade-in">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              Equipment Inventory ({products.length})
            </h2>
            <button onClick={() => setShowAddModal(true)} className="btn btn-primary btn-sm">
              ➕ Add Product
            </button>
          </div>

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Rental Rate</th>
                  <th>Security Deposit</th>
                  <th>Stock Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {product.id}
                    </td>
                    <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {product.name}
                    </td>
                    <td>
                      <span className="badge badge-booked">
                        {product.category}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>${product.price}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}> / {product.rentalUnit}</span>
                    </td>
                    <td style={{ color: "var(--warning)", fontWeight: 600 }}>
                      ${product.securityDeposit}
                    </td>
                    <td>
                      <span className={`product-stock ${product.inStock > 0 ? "in-stock" : "out-of-stock"}`}>
                        {product.inStock > 0 ? `${product.inStock} in stock` : "Out of stock"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Add Product Modal Overlay ────────────────────────────────────── */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: "20px",
        }}>
          <div className="card animate-scale-up" style={{
            maxWidth: "500px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            position: "relative",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-lg)",
            padding: "24px",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>Add New Equipment</h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.25rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProduct} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="e.g. Pressure Washer Pro 3000"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="Cleaning Equipment">Cleaning Equipment</option>
                  <option value="Heavy Equipment">Heavy Equipment</option>
                  <option value="Access Equipment">Access Equipment</option>
                  <option value="Construction">Construction</option>
                  <option value="AV Equipment">AV Equipment</option>
                  <option value="Events">Events</option>
                  <option value="Power Equipment">Power Equipment</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  required
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Describe the equipment, its specifications, and ideal usage..."
                  style={{ resize: "vertical" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Rental Unit</label>
                  <select
                    className="form-input"
                    value={newProduct.rentalUnit}
                    onChange={(e) => setNewProduct({ ...newProduct, rentalUnit: e.target.value })}
                  >
                    <option value="day">per Day</option>
                    <option value="week">per Week</option>
                    <option value="month">per Month</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity In Stock</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min="1"
                    value={newProduct.inStock}
                    onChange={(e) => setNewProduct({ ...newProduct, inStock: e.target.value })}
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label className="form-label">Price ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min="0"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="e.g. 75.00"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Security Deposit ($)</label>
                  <input
                    type="number"
                    className="form-input"
                    required
                    min="0"
                    step="0.01"
                    value={newProduct.securityDeposit}
                    onChange={(e) => setNewProduct({ ...newProduct, securityDeposit: e.target.value })}
                    placeholder="e.g. 200.00"
                  />
                </div>
              </div>

              {error && (
                <div style={{ color: "var(--danger)", fontSize: "0.85rem", fontWeight: 600 }}>
                  ⚠️ {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? "Adding..." : "Add Equipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
