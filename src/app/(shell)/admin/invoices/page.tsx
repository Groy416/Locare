"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  status: string; // "DRAFT" | "POSTED" | "PAID"
  totalAmount: number;
  amountPaid: number;
  rentalOrder?: {
    customerName: string;
    orderNumber: string;
  };
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setInvoices(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-shell animate-fade-in">
      <h1 className="page-title">Invoices</h1>
      <p className="page-subtitle">Manage customer billing and payment statuses.</p>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading invoices...
        </div>
      ) : invoices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧾</div>
          <p className="empty-state-text">No invoices generated yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table erp-table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Invoice Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    <Link href={`/admin/invoices/${inv.id}`} className="order-link">
                      {inv.invoiceNumber}
                    </Link>
                  </td>
                  <td style={{ fontFamily: "var(--font-mono)" }}>
                    {inv.rentalOrder?.orderNumber || "—"}
                  </td>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                    {inv.rentalOrder?.customerName || "Customer"}
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>{inv.invoiceDate}</td>
                  <td>
                    <span className={`badge ${inv.status === "PAID" ? "badge-returned" : inv.status === "POSTED" ? "badge-active" : "badge-booked"}`}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>${inv.totalAmount.toLocaleString()}</td>
                  <td>
                    <Link href={`/admin/invoices/${inv.id}`} className="btn btn-ghost btn-sm">
                      View Invoice ➔
                    </Link>
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
