"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductIcon from "@/components/ProductIcon";
import type { Product } from "@/lib/data";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell animate-fade-in">
      <div className="erp-top-bar">
        <h1 className="page-title" style={{ margin: 0 }}>
          Products & Inventory
        </h1>
        <div>
          <Link href="/admin/products/attributes" className="btn btn-ghost btn-sm" style={{ marginRight: 8 }}>
            Attributes Manager
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading products...
        </div>
      ) : (
        <div className="card-grid stagger-children">
          {products.map((prod) => (
            <div key={prod.id} className="card product-card">
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
                  <span className="product-stock in-stock">
                    {prod.inStock} in stock
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
