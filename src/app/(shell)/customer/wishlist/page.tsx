"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

interface ProductItem {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  imageUrl?: string | null;
  brand?: string | null;
  rentalUnit: string;
  price: number;
  securityDeposit: number;
  inStock: number;
}

export default function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  // Load wishlist IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("locare_wishlist");
      const ids: number[] = stored ? JSON.parse(stored) : [];
      setWishlistIds(ids);
    } catch {
      setWishlistIds([]);
    }
  }, []);

  // Fetch product details for all wishlisted IDs
  useEffect(() => {
    if (wishlistIds.length === 0) {
      setLoading(false);
      setProducts([]);
      return;
    }
    setLoading(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data: ProductItem[]) => {
        if (Array.isArray(data)) {
          setProducts(data.filter((p) => wishlistIds.includes(p.id)));
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [wishlistIds]);

  const removeFromWishlist = (productId: number) => {
    const next = wishlistIds.filter((id) => id !== productId);
    setWishlistIds(next);
    try {
      localStorage.setItem("locare_wishlist", JSON.stringify(next));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch {}
  };

  const clearWishlist = () => {
    setWishlistIds([]);
    setProducts([]);
    try {
      localStorage.removeItem("locare_wishlist");
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch {}
  };

  const getImageSrc = (p: ProductItem) => p.imageUrl || p.image || "/images/placeholder.jpg";

  return (
    <div className="page-shell animate-fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text)", marginBottom: 4 }}>
            ♥ My Wishlist
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            {products.length > 0
              ? `${products.length} saved item${products.length !== 1 ? "s" : ""}`
              : "No saved items yet"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {products.length > 0 && (
            <button
              onClick={clearWishlist}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "transparent",
                color: "var(--text-muted)",
                fontSize: "0.85rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              🗑️ Clear All
            </button>
          )}
          <Link
            href="/customer"
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              background: "var(--primary)",
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 700,
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            ← Browse Products
          </Link>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
          <p>Loading your wishlist...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "80px 24px",
          background: "var(--surface)",
          borderRadius: 20,
          border: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: "4rem", marginBottom: 16 }}>🤍</div>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
            Your wishlist is empty
          </h2>
          <p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
            Click the ♡ heart icon on any product to save it here.
          </p>
          <Link
            href="/customer"
            style={{
              display: "inline-block",
              padding: "10px 24px",
              background: "var(--primary)",
              color: "#fff",
              borderRadius: 10,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Browse Products
          </Link>
        </div>
      )}

      {/* Wishlist Grid */}
      {!loading && products.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 20,
        }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                background: "var(--surface)",
                borderRadius: 16,
                border: "1px solid var(--border)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 30px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              {/* Product Image */}
              <Link href={`/customer/products/${product.id}`} style={{ display: "block", textDecoration: "none" }}>
                <div style={{ height: 180, background: "var(--bg-elevated)", overflow: "hidden", position: "relative" }}>
                  <img
                    src={getImageSrc(product)}
                    alt={product.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.jpg"; }}
                  />
                  {/* Category badge */}
                  <span style={{
                    position: "absolute", top: 10, left: 10,
                    background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
                    color: "#fff", fontSize: "0.7rem", fontWeight: 700,
                    padding: "2px 8px", borderRadius: 20,
                  }}>
                    {product.category}
                  </span>
                </div>
              </Link>

              {/* Product Info */}
              <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  {product.brand && (
                    <p style={{ fontSize: "0.72rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>
                      {product.brand}
                    </p>
                  )}
                  <Link href={`/customer/products/${product.id}`} style={{ textDecoration: "none" }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
                      {product.name}
                    </h3>
                  </Link>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 4, lineHeight: 1.4,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {product.description}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                  <div>
                    <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--primary)" }}>
                      ₹{product.price}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      /{product.rentalUnit}
                    </span>
                  </div>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 600,
                    color: product.inStock > 0 ? "#10b981" : "#ef4444",
                    background: product.inStock > 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                    padding: "2px 8px", borderRadius: 20,
                  }}>
                    {product.inStock > 0 ? `${product.inStock} in stock` : "Out of stock"}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => {
                      addItem({ id: product.id, name: product.name, price: product.price, rentalUnit: product.rentalUnit, image: getImageSrc(product) });
                    }}
                    disabled={product.inStock === 0}
                    style={{
                      flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
                      background: product.inStock > 0 ? "var(--primary)" : "var(--border)",
                      color: product.inStock > 0 ? "#fff" : "var(--text-muted)",
                      fontSize: "0.82rem", fontWeight: 700, cursor: product.inStock > 0 ? "pointer" : "not-allowed",
                      transition: "all 0.2s",
                    }}
                  >
                    🛒 Add to Cart
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    title="Remove from wishlist"
                    style={{
                      padding: "9px 12px", borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "transparent", color: "#ef4444",
                      fontSize: "1rem", cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
