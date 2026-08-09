"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductIcon from "@/components/ProductIcon";

interface ProductItem {
  id: number;
  name: string;
  category: string;
  price: number;
  securityDeposit: number;
  rentalUnit: string;
  inStock: number;
  status?: string;
  image?: string;
  imageUrl?: string | null;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchProducts = () => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setErrorMessage("");
    setSuccessMessage("");
    setUpdatingId(id);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      setUpdatingId(null);

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update product status.");
      } else {
        setSuccessMessage(`Product status updated to ${newStatus}`);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
      }
    } catch {
      setUpdatingId(null);
      setErrorMessage("Failed to update product status.");
    }
  };

  const handleStockUpdate = async (id: number, newStock: number) => {
    if (newStock < 0) return;
    setErrorMessage("");
    setSuccessMessage("");
    setUpdatingId(id);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: newStock }),
      });

      const data = await res.json();
      setUpdatingId(null);

      if (!res.ok) {
        setErrorMessage(data.error || "Failed to update stock quantity.");
      } else {
        setSuccessMessage(`Stock level updated to ${newStock}`);
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, inStock: newStock } : p))
        );
      }
    } catch {
      setUpdatingId(null);
      setErrorMessage("Failed to update stock quantity.");
    }
  };

  const handleDelete = async (id: number) => {
    setErrorMessage("");
    setSuccessMessage("");
    setDeletingId(id);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      setDeletingId(null);

      if (!res.ok) {
        setErrorMessage(
          data.error ||
            "Cannot delete product because it is currently linked to an active rental order."
        );
      } else {
        setSuccessMessage("Product deleted successfully");
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      setDeletingId(null);
      setErrorMessage("Cannot delete a rented item until item is returned");
    }
  };

  return (
    <div className="page-shell animate-fade-in">
      <div className="erp-top-bar">
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>
            Admin Products & Inventory Control
          </h1>
          <p className="page-subtitle" style={{ margin: "4px 0 0 0" }}>
            Full admin power to manage product availability status, stock counts, and attributes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/products/attributes" className="btn btn-ghost btn-sm">
            Attributes Manager
          </Link>
          <Link href="/admin/products/new" className="btn btn-primary btn-sm">
            + Add Product
          </Link>
        </div>
      </div>

      {/* Popping Error Banner */}
      {errorMessage && (
        <div
          className="animate-fade-in"
          style={{
            background: "#FEF2F2",
            border: "2px solid #EF4444",
            color: "#991B1B",
            padding: "14px 18px",
            borderRadius: "10px",
            marginBottom: "20px",
            fontWeight: 700,
            fontSize: "0.95rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 14px rgba(239, 68, 68, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.2rem" }}>⛔</span>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage("")}
            style={{
              background: "none",
              border: "none",
              color: "#991B1B",
              fontWeight: 700,
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div
          className="auth-success-badge animate-fade-in"
          style={{ marginBottom: 20 }}
        >
          ✅ {successMessage}
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading products...
        </div>
      ) : (
        <div className="card-grid stagger-children">
          {products.map((prod) => {
            const currentStatus = prod.status || (prod.inStock > 0 ? "AVAILABLE" : "OUT_OF_STOCK");

            return (
              <div
                key={prod.id}
                className="card product-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                }}
              >
                <div>
                  <ProductIcon category={prod.category} size="sm" imageUrl={prod.imageUrl || prod.image} />

                  <div className="product-card-body">
                    <div className="flex justify-between items-center mb-1">
                      <span className="product-category">{prod.category}</span>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontFamily: "var(--font-mono)",
                          color: "var(--text-muted)",
                        }}
                      >
                        ID: {prod.id}
                      </span>
                    </div>

                    <h3 className="product-name">{prod.name}</h3>

                    <div className="product-price-row">
                      <div className="product-price">
                        ₹{prod.price}
                        <span> / {prod.rentalUnit}</span>
                      </div>
                    </div>

                    {/* Admin Status & Stock Control Panel */}
                    <div
                      style={{
                        marginTop: 14,
                        padding: "12px",
                        background: "var(--bg-elevated)",
                        borderRadius: "10px",
                        border: "1px solid var(--border)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                      }}
                    >
                      {/* Status Dropdown Picker */}
                      <div>
                        <label
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "var(--text-muted)",
                            display: "block",
                            marginBottom: 4,
                          }}
                        >
                          ADMIN PRODUCT STATUS:
                        </label>
                        <select
                          className="filter-select"
                          style={{
                            padding: "6px 10px",
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            borderRadius: "8px",
                            background: "var(--bg-card)",
                            color:
                              currentStatus === "AVAILABLE"
                                ? "#84cc16"
                                : currentStatus === "RENTED"
                                ? "#38bdf8"
                                : currentStatus === "MAINTENANCE"
                                ? "#f59e0b"
                                : "#ef4444",
                          }}
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(prod.id, e.target.value)}
                          disabled={updatingId === prod.id}
                        >
                          <option value="AVAILABLE">🟢 AVAILABLE</option>
                          <option value="RENTED">🔵 RENTED (In Use)</option>
                          <option value="MAINTENANCE">🟠 IN MAINTENANCE</option>
                          <option value="OUT_OF_STOCK">🔴 OUT OF STOCK / SOLD OUT</option>
                          <option value="DISCONTINUED">⚪ DISCONTINUED</option>
                        </select>
                      </div>

                      {/* Stock Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)" }}>
                          STOCK COUNTER:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "2px 8px", fontWeight: 800 }}
                            onClick={() => handleStockUpdate(prod.id, prod.inStock - 1)}
                            disabled={prod.inStock <= 0 || updatingId === prod.id}
                          >
                            −
                          </button>
                          <span
                            style={{
                              fontWeight: 800,
                              fontSize: "0.9rem",
                              color: prod.inStock > 0 ? "#84cc16" : "#ef4444",
                              minWidth: 24,
                              textAlign: "center",
                            }}
                          >
                            {prod.inStock}
                          </span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "2px 8px", fontWeight: 800 }}
                            onClick={() => handleStockUpdate(prod.id, prod.inStock + 1)}
                            disabled={updatingId === prod.id}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div
                  style={{
                    padding: "12px 16px",
                    borderTop: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 12,
                  }}
                >
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: "#EF4444", fontWeight: 600 }}
                    onClick={() => handleDelete(prod.id)}
                    disabled={deletingId === prod.id}
                  >
                    {deletingId === prod.id ? "Deleting..." : "🗑️ Delete Product"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
