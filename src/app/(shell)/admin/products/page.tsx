"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductIcon from "@/components/ProductIcon";
import type { Product } from "@/lib/data";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

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

  const handleDelete = async (id: string | number) => {
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
        setErrorMessage(data.error || "Cannot delete product because it is currently linked to an active rental order.");
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
        <h1 className="page-title" style={{ margin: 0 }}>
          Products & Inventory
        </h1>
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
          {products.map((prod) => (
            <div key={prod.id} className="card product-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <ProductIcon category={prod.category} size="sm" />
                <div className="product-card-body">
                  <span className="product-category">{prod.category}</span>
                  <h3 className="product-name">{prod.name}</h3>
                  <div className="product-price-row">
                    <div className="product-price">
                      ${prod.price}
                      <span> / {prod.rentalUnit}</span>
                    </div>
                  </div>
                  <div className="product-meta">
                    <span className="product-deposit-badge">
                      🔒 ${prod.securityDeposit} deposit
                    </span>
                    <span className={`product-stock ${prod.inStock > 0 ? "in-stock" : "out-of-stock"}`}>
                      {prod.inStock > 0 ? `${prod.inStock} in stock` : "🔴 SOLD OUT"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ color: "#EF4444", fontWeight: 600 }}
                  onClick={() => handleDelete(prod.id)}
                  disabled={deletingId === prod.id}
                >
                  {deletingId === prod.id ? "Deleting..." : "🗑️ Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
