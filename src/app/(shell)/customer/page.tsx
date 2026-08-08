"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductIcon from "@/components/ProductIcon";
import type { Product } from "@/lib/data";

export default function CustomerCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch((err) => console.error("Error loading products:", err))
      .finally(() => setLoading(false));
  }, []);

  const inStockCount = products.filter((p) => p.inStock > 0).length;

  return (
    <div className="page-shell animate-fade-in">
      {/* Page Header */}
      <div className="catalog-header">
        <div>
          <h1 className="page-title">Equipment Catalog</h1>
          <p className="page-subtitle">
            Browse our premium rental equipment — click any item to configure
            your rental.
          </p>
        </div>
        <div className="catalog-stats">
          <span className="catalog-stat">
            <strong>{products.length}</strong> products
          </span>
          <span className="catalog-stat">
            <strong>{inStockCount}</strong> available
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading products from database...
        </div>
      ) : (
        /* Product Grid */
        <div className="card-grid stagger-children">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/customer/products/${product.id}`}
              className="product-card-link"
            >
              <article className="card product-card">
                {/* Image */}
                <ProductIcon category={product.category} size="sm" />

                {/* Content */}
                <div className="product-card-body">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-name">{product.name}</h3>

                  {/* Price Row */}
                  <div className="product-price-row">
                    <div className="product-price">
                      ${product.price}
                      <span> / {product.rentalUnit}</span>
                    </div>
                  </div>

                  {/* Deposit & Stock */}
                  <div className="product-meta">
                    <span className="product-deposit-badge">
                      🔒 ${product.securityDeposit} deposit
                    </span>
                    <span
                      className={`product-stock ${
                        product.inStock > 0 ? "in-stock" : "out-of-stock"
                      }`}
                    >
                      {product.inStock > 0
                        ? `${product.inStock} in stock`
                        : "Unavailable"}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
