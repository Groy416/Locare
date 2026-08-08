export default function ProductCardSkeleton() {
  return (
    <div className="card product-card technical-card skeleton-card" aria-hidden="true">
      {/* Image area */}
      <div className="skeleton-block" style={{ height: 160, borderRadius: "var(--radius-md)" }} />

      {/* Body */}
      <div className="product-card-body" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* SKU + brand row */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="skeleton-block" style={{ width: "40%", height: 12 }} />
          <div className="skeleton-block" style={{ width: "25%", height: 12 }} />
        </div>

        {/* Product name */}
        <div className="skeleton-block" style={{ width: "85%", height: 16 }} />
        <div className="skeleton-block" style={{ width: "60%", height: 16 }} />

        {/* Price row */}
        <div className="skeleton-block" style={{ width: "45%", height: 20, marginTop: 4 }} />

        {/* Deposit + stock row */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <div className="skeleton-block" style={{ width: "40%", height: 12 }} />
          <div className="skeleton-block" style={{ width: "30%", height: 12 }} />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="card-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
