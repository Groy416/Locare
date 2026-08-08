"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface OrderLine {
  id: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  amount: number;
  product?: { name: string };
}

interface InvoiceDetail {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  status: string; // "DRAFT" | "POSTED" | "PAID"
  untaxedAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  rentalOrder?: {
    orderNumber: string;
    customerName: string;
    invoiceAddress: string;
    deliveryAddress: string;
    orderLines: OrderLine[];
  };
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInvoice = () => {
    setLoading(true);
    fetch("/api/invoices")
      .then((res) => res.json())
      .then((data: InvoiceDetail[]) => {
        const found = data.find((i) => i.id === id);
        if (found) setInvoice(found);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handleUpdateStatus = async (targetStatus: string) => {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) fetchInvoice();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !invoice) {
    return (
      <div className="page-shell animate-fade-in">
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading invoice details...
        </div>
      </div>
    );
  }

  const isDraft = invoice.status === "DRAFT";
  const isPosted = invoice.status === "POSTED";
  const isPaid = invoice.status === "PAID";

  return (
    <div className="page-shell animate-fade-in">
      <nav className="breadcrumb">
        <Link href="/admin/invoices" className="breadcrumb-link">
          ← Back to Invoices
        </Link>
      </nav>

      {/* ─── Workflow Header Bar (Image 5 Wireframe) ─────────────────── */}
      <div className="order-workflow-bar">
        <div className="order-workflow-actions">
          {isDraft && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleUpdateStatus("POSTED")}
            >
              Confirm Invoice
            </button>
          )}

          {isPosted && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => handleUpdateStatus("PAID")}
            >
              Register Payment
            </button>
          )}

          <button className="btn btn-ghost btn-sm" onClick={() => window.print()}>
            🖨️ Print Invoice
          </button>
        </div>

        {/* Workflow State Indicator */}
        <div className="workflow-steps">
          <span className={`workflow-step ${isDraft ? "workflow-step-active" : ""}`}>
            Draft
          </span>
          <span className={`workflow-step ${isPosted || isPaid ? "workflow-step-active" : ""}`}>
            Posted
          </span>
          <span className={`workflow-step ${isPaid ? "workflow-step-active" : ""}`}>
            Paid
          </span>
        </div>
      </div>

      {/* ─── Invoice Document Sheet ────────────────────────────────────── */}
      <div className="card order-document-card">
        <div className="doc-header">
          <div>
            <span className="doc-type-tag">Customer Invoice</span>
            <h1 className="doc-number">{invoice.invoiceNumber}</h1>
          </div>
          <div>
            <span className={`badge ${isPaid ? "badge-returned" : isPosted ? "badge-active" : "badge-booked"}`}>
              {invoice.status}
            </span>
          </div>
        </div>

        <div className="doc-grid-2">
          <div>
            <div className="doc-field">
              <span className="doc-field-label">Customer:</span>
              <strong className="doc-field-value">{invoice.rentalOrder?.customerName}</strong>
            </div>
            <div className="doc-field">
              <span className="doc-field-label">Invoice Address:</span>
              <span className="doc-field-value">{invoice.rentalOrder?.invoiceAddress || "Standard Billing"}</span>
            </div>
          </div>

          <div>
            <div className="doc-field">
              <span className="doc-field-label">Invoice Date:</span>
              <span className="doc-field-value" style={{ fontWeight: 700 }}>
                {invoice.invoiceDate}
              </span>
            </div>
            <div className="doc-field">
              <span className="doc-field-label">Source Order:</span>
              <span className="doc-field-value" style={{ fontFamily: "var(--font-mono)" }}>
                {invoice.rentalOrder?.orderNumber}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Invoice Line Items Table ────────────────────────────────── */}
        <div className="doc-lines-section">
          <h3 className="lines-title">Invoice Lines</h3>
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
                {invoice.rentalOrder?.orderLines.map((line) => (
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
            <strong>${invoice.untaxedAmount.toLocaleString()}</strong>
          </div>
          <div className="total-row">
            <span>Taxes (10%):</span>
            <strong>${invoice.taxAmount.toLocaleString()}</strong>
          </div>
          <div className="total-row total-row-grand">
            <span>Total Amount:</span>
            <strong>${invoice.totalAmount.toLocaleString()}</strong>
          </div>
          <div className="total-row">
            <span>Amount Paid:</span>
            <strong style={{ color: isPaid ? "var(--success)" : "var(--text-muted)" }}>
              ${invoice.amountPaid.toLocaleString()}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
