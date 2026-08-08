"use client";

import {
  rentals,
  products,
  getProduct,
  calculateLateFee,
} from "@/lib/data";

export default function AdminDashboardPage() {
  // ─── Compute metrics from seed data ──────────────────────────────────────

  const activeRentals = rentals.filter((r) => r.status === "active");
  const overdueRentals = rentals.filter((r) => r.status === "overdue");
  const bookedRentals = rentals.filter((r) => r.status === "booked");
  const returnedRentals = rentals.filter((r) => r.status === "returned");

  const totalDepositsHeld = rentals
    .filter((r) => r.depositStatus === "held")
    .reduce((sum, r) => sum + r.depositAmount, 0);

  const totalRevenue = rentals.reduce((sum, r) => {
    const product = getProduct(r.productId);
    if (!product) return sum;
    const start = new Date(r.rentalStart);
    const end = new Date(r.rentalEnd);
    const days = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    );
    return sum + product.price * days;
  }, 0);

  const pendingLateFees = overdueRentals.reduce(
    (sum, r) => sum + calculateLateFee(r),
    0
  );

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.inStock, 0);
  const itemsRented = activeRentals.length + overdueRentals.length;
  const utilizationRate =
    totalStock > 0 ? Math.round((itemsRented / totalStock) * 100) : 0;

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
          <span className="stat-value primary">{activeRentals.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Overdue</span>
          <span className="stat-value danger">{overdueRentals.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Upcoming Bookings</span>
          <span className="stat-value">{bookedRentals.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Returned</span>
          <span className="stat-value success">{returnedRentals.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Est. Revenue</span>
          <span className="stat-value primary">
            ${totalRevenue.toLocaleString()}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Deposits Held</span>
          <span className="stat-value warning">
            ${totalDepositsHeld.toLocaleString()}
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
          <span className="stat-value primary">{utilizationRate}%</span>
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
              <th>Product</th>
              <th>Customer</th>
              <th>Period</th>
              <th>Status</th>
              <th>Deposit</th>
              <th>Late Fee</th>
            </tr>
          </thead>
          <tbody>
            {rentals.map((rental) => {
              const product = getProduct(rental.productId);
              const lateFee =
                rental.status === "overdue"
                  ? calculateLateFee(rental)
                  : rental.lateFeeCharged;

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
                    {product?.name ?? "Unknown"}
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

      {/* ─── Inventory Summary ───────────────────────────────────────────── */}
      <h2
        style={{
          fontSize: "1.15rem",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginTop: "40px",
          marginBottom: "16px",
        }}
      >
        Inventory Summary
      </h2>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Deposit</th>
              <th>In Stock</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {product.name}
                </td>
                <td>{product.category}</td>
                <td>
                  ${product.price}/{product.rentalUnit}
                </td>
                <td>${product.securityDeposit}</td>
                <td>
                  <span
                    style={{
                      color:
                        product.inStock > 2
                          ? "var(--success)"
                          : product.inStock > 0
                          ? "var(--warning)"
                          : "var(--danger)",
                      fontWeight: 700,
                    }}
                  >
                    {product.inStock}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
