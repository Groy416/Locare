"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  rentalStart: string;
  rentalEnd: string;
  status: string;
  deliveryMethod: string;
}

export default function AdminSchedulePage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell animate-fade-in">
      <h1 className="page-title">Rental Schedule & Logistics</h1>
      <p className="page-subtitle">Timeline view of scheduled pickups, deliveries, and return check-ins.</p>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading schedule...
        </div>
      ) : (
        <div className="table-container">
          <table className="table erp-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Fulfillment</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    <Link href={`/admin/orders/${o.id}`} className="order-link">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{o.customerName}</td>
                  <td>
                    <span className={`badge ${o.deliveryMethod === "delivery" ? "badge-active" : "badge-booked"}`}>
                      {o.deliveryMethod}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>{o.rentalStart}</td>
                  <td style={{ fontSize: "0.85rem" }}>{o.rentalEnd}</td>
                  <td>
                    <span className="badge badge-active">{o.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
