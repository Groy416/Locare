"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";

interface OrderLine {
  id: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  amount: number;
  product?: { name: string; rentalUnit: string };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  totalAmount: number;
}

interface RentalOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  invoiceAddress: string;
  deliveryAddress: string;
  rentalStart: string;
  rentalEnd: string;
  priceList: string;
  status: string; // "QUOTATION" | "QUOTATION_SENT" | "CONFIRMED" | "PICKED_UP" | "RETURNED" | "CANCELLED" | "OVERDUE"
  invoiceStatus: string;
  untaxedAmount: number;
  taxAmount: number;
  totalAmount: number;
  depositAmount: number;
  orderLines: OrderLine[];
  invoices: Invoice[];
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<RentalOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(() => {
    fetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) setOrder(data);
      })
      .catch((err) => console.error("Error fetching order:", err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const handleUpdateStatus = async (targetStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) {
        fetchOrder();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInvoice = async () => {
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rentalOrderId: id }),
      });
      const data = await res.json();
      if (res.ok && data.id) {
        fetchOrder();
      } else {
        alert(data.error || "Failed to create invoice.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !order) {
    return (
      <div className="page-shell animate-fade-in">
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading order {id}...
        </div>
      </div>
    );
  }

  const isConfirmed = order.status === "CONFIRMED" || order.status === "PICKED_UP" || order.status === "RETURNED" || order.status === "OVERDUE";
  const isQuotation = order.status === "QUOTATION" || order.status === "QUOTATION_SENT";

  return (
    <div className="page-shell animate-fade-in">
      <nav className="breadcrumb">
        <Link href="/admin" className="breadcrumb-link">
          ← Back to Orders
        </Link>
      </nav>

      {/* ─── Workflow Header Bar (Image 4 & 5 Wireframe) ─────────────────── */}
      <div className="order-workflow-bar">
        <div className="order-workflow-actions">
          {/* Status-dependent buttons */}
          {isQuotation && (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleUpdateStatus("QUOTATION_SENT")}
              >
                Send Quotation
              </button>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleUpdateStatus("CONFIRMED")}
              >
                Confirm Sale Order
              </button>
            </>
          )}

          {isConfirmed && (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleCreateInvoice}
              >
                Create Invoice
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => handleUpdateStatus("PICKED_UP")}
              >
                Pickup
              </button>
            </>
          )}

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => window.print()}
          >
            🖨️ Print PDF
          </button>

          {order.status !== "CANCELLED" && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--danger)" }}
              onClick={() => handleUpdateStatus("CANCELLED")}
            >
              Cancel
            </button>
          )}
        </div>

        {/* Workflow State Step Indicator (Image 4 Wireframe) */}
        <div className="workflow-steps">
          <span
            className={`workflow-step ${
              order.status === "QUOTATION" ? "workflow-step-active" : ""
            }`}
          >
            Quotation
          </span>
          <span
            className={`workflow-step ${
              order.status === "QUOTATION_SENT" ? "workflow-step-active" : ""
            }`}
          >
            Quotation Sent
          </span>
          <span
            className={`workflow-step ${
              isConfirmed ? "workflow-step-active" : ""
            }`}
          >
            Sale Order
          </span>
        </div>
      </div>

      {/* ─── Order Sheet Document View ──────────────────────────────────── */}
      <div className="card order-document-card">
        <div className="doc-header">
          <div>
            <span className="doc-type-tag">
              {isConfirmed ? "Rental Order (Confirmed)" : "Quotation Draft"}
            </span>
            <h1 className="doc-number">{order.orderNumber}</h1>
          </div>
          <div className="doc-meta-right">
            <span className="badge badge-active">{order.status}</span>
            <div style={{ marginTop: 4 }}>
              <span className="erp-pill erp-pill-invoiced">{order.invoiceStatus}</span>
            </div>
          </div>
        </div>

        <div className="doc-grid-2">
          <div>
            <div className="doc-field">
              <span className="doc-field-label">Customer:</span>
              <strong className="doc-field-value">{order.customerName}</strong>
            </div>
            <div className="doc-field">
              <span className="doc-field-label">Invoice Address:</span>
              <span className="doc-field-value">{order.invoiceAddress || "Same as Delivery"}</span>
            </div>
            <div className="doc-field">
              <span className="doc-field-label">Delivery Address:</span>
              <span className="doc-field-value">{order.deliveryAddress || "Standard Delivery"}</span>
            </div>
          </div>

          <div>
            <div className="doc-field">
              <span className="doc-field-label">Rental Period:</span>
              <span className="doc-field-value" style={{ fontWeight: 700 }}>
                {order.rentalStart} ➔ {order.rentalEnd}
              </span>
            </div>
            <div className="doc-field">
              <span className="doc-field-label">Pricelist:</span>
              <span className="doc-field-value">{order.priceList}</span>
            </div>
          </div>
        </div>

        {/* ─── Order Line Table (Image 4 Wireframe) ───────────────────── */}
        <div className="doc-lines-section">
          <h3 className="lines-title">Order Lines</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price ($)</th>
                  <th>Taxes</th>
                  <th>Amount ($)</th>
                </tr>
              </thead>
              <tbody>
                {order.orderLines.map((line) => (
                  <tr key={line.id}>
                    <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                      {line.product?.name || "Equipment Rental"}
                    </td>
                    <td>{line.quantity}</td>
                    <td>${line.unitPrice}</td>
                    <td>{line.taxPercent}%</td>
                    <td style={{ fontWeight: 700 }}>
                      ${line.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Financial Totals Summary ────────────────────────────────── */}
        <div className="order-totals-box">
          <div className="total-row">
            <span>Untaxed Amount:</span>
            <strong>${order.untaxedAmount.toLocaleString()}</strong>
          </div>
          <div className="total-row">
            <span>Taxes (10%):</span>
            <strong>${order.taxAmount.toLocaleString()}</strong>
          </div>
          <div className="total-row">
            <span>Refundable Deposit Held:</span>
            <strong style={{ color: "var(--warning)" }}>
              ${order.depositAmount.toLocaleString()}
            </strong>
          </div>
          <div className="total-row total-row-grand">
            <span>Total Amount:</span>
            <strong>${order.totalAmount.toLocaleString()}</strong>
          </div>
        </div>

        {/* ─── Linked Invoices Section (Image 5 Wireframe) ─────────────── */}
        {order.invoices.length > 0 && (
          <div className="doc-invoices-section">
            <h3 className="lines-title">Linked Invoices</h3>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invoice Number</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.invoices.map((inv) => (
                    <tr key={inv.id}>
                      <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                        {inv.invoiceNumber}
                      </td>
                      <td>
                        <span className={`badge ${inv.status === "PAID" ? "badge-returned" : "badge-booked"}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>${inv.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
