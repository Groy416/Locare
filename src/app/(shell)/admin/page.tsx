"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface OrderLine {
  id: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  product?: { name: string };
}

interface RentalOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  rentalStart: string;
  rentalEnd: string;
  deliveryMethod: string;
  status: string; // "QUOTATION" | "QUOTATION_SENT" | "CONFIRMED" | "PICKED_UP" | "RETURNED" | "CANCELLED" | "OVERDUE"
  invoiceStatus: string; // "NOTHING_TO_INVOICE" | "WAITING_TO_INVOICE" | "DRAFT_INVOICE" | "INVOICED"
  totalAmount: number;
  depositAmount: number;
  lateFeeCharged: number;
  orderLines: OrderLine[];
}

export default function AdminOrderManagementPage() {
  const [orders, setOrders] = useState<RentalOrder[]>([]);
  const [metrics, setMetrics] = useState({ totalSales: 0, totalLateFees: 0, totalDeposits: 0 });
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [filter, setFilter] = useState<"all" | "today" | "pickup" | "return" | "late">("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    const query = new URLSearchParams();
    if (filter !== "all") query.set("filter", filter);
    if (search) query.set("search", search);

    fetch(`/api/orders?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.orders) setOrders(data.orders);
        if (data.metrics) setMetrics(data.metrics);
      })
      .catch((err) => console.error("Error fetching orders:", err))
      .finally(() => setLoading(false));
  }, [filter, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "QUOTATION":
        return <span className="erp-pill erp-pill-quotation">Quotation</span>;
      case "QUOTATION_SENT":
        return <span className="erp-pill erp-pill-quotation-sent">Quotation Sent</span>;
      case "CONFIRMED":
        return <span className="erp-pill erp-pill-confirmed">Sale Order</span>;
      case "PICKED_UP":
        return <span className="erp-pill erp-pill-picked">Picked Up</span>;
      case "RETURNED":
        return <span className="erp-pill erp-pill-returned">Completed</span>;
      case "OVERDUE":
        return <span className="erp-pill erp-pill-late">Late Return</span>;
      case "CANCELLED":
        return <span className="erp-pill erp-pill-cancelled">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const getInvoiceBadge = (invStatus: string) => {
    switch (invStatus) {
      case "INVOICED":
        return <span className="erp-pill erp-pill-invoiced">Invoiced</span>;
      case "WAITING_TO_INVOICE":
      case "DRAFT_INVOICE":
        return <span className="erp-pill erp-pill-waiting">To Invoice</span>;
      default:
        return <span className="erp-pill erp-pill-nothing">Nothing to Invoice</span>;
    }
  };

  return (
    <div className="page-shell animate-fade-in">
      {/* ─── Top Control Bar ───────────────────────────────────────────── */}
      <div className="erp-top-bar">
        <div className="erp-title-group">
          <h1 className="page-title" style={{ margin: 0 }}>
            Rental Order
          </h1>
          <Link href="/admin/orders/new" className="btn btn-primary btn-sm">
            + New
          </Link>
        </div>

        {/* Search Bar */}
        <div className="erp-search-wrapper">
          <input
            type="text"
            className="form-input erp-search-input"
            placeholder="Search orders, customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-ghost btn-sm" aria-label="Search">
            🔍
          </button>
        </div>

        {/* View Switcher Toggle */}
        <div className="erp-view-switcher" role="radiogroup" aria-label="View Switcher">
          <span className="switcher-label">View Switcher:</span>
          <button
            className={`btn btn-sm ${viewMode === "list" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setViewMode("list")}
          >
            ☰ List
          </button>
          <button
            className={`btn btn-sm ${viewMode === "kanban" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setViewMode("kanban")}
          >
            ▦ Kanban
          </button>
        </div>
      </div>

      {/* ─── Filters & Metrics Summary Header ──────────────────────────── */}
      <div className="erp-toolbar">
        {/* Filter Pills */}
        <div className="erp-filters">
          <button
            className={`filter-chip ${filter === "all" ? "filter-chip-active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-chip ${filter === "today" ? "filter-chip-active" : ""}`}
            onClick={() => setFilter("today")}
          >
            Today
          </button>
          <button
            className={`filter-chip ${filter === "pickup" ? "filter-chip-active" : ""}`}
            onClick={() => setFilter("pickup")}
          >
            Pickup
          </button>
          <button
            className={`filter-chip ${filter === "return" ? "filter-chip-active" : ""}`}
            onClick={() => setFilter("return")}
          >
            Return
          </button>
          <button
            className={`filter-chip filter-chip-late ${filter === "late" ? "filter-chip-active" : ""}`}
            onClick={() => setFilter("late")}
          >
            Late
          </button>
        </div>

        {/* Summary Metrics Bar (Sales $, Late Fees $, Deposits $) */}
        <div className="erp-metrics-bar">
          <span className="metric-chip">
            Sales: <strong>${metrics.totalSales.toLocaleString()}</strong>
          </span>
          <span className="metric-chip">
            Late Fees: <strong>${metrics.totalLateFees.toLocaleString()}</strong>
          </span>
          <span className="metric-chip">
            Deposits: <strong>${metrics.totalDeposits.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading rental orders...
        </div>
      ) : viewMode === "list" ? (
        /* ─── List View by Default ───────────────────────────────────── */
        <div className="table-container">
          <table className="table erp-table">
            <thead>
              <tr>
                <th>Order Reference</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Pickup Date</th>
                <th>Return Date</th>
                <th>Total</th>
                <th>Invoice Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>
                    <Link href={`/admin/orders/${order.id}`} className="order-link">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                    {order.customerName}
                  </td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td style={{ fontSize: "0.85rem" }}>{order.rentalStart}</td>
                  <td style={{ fontSize: "0.85rem" }}>{order.rentalEnd}</td>
                  <td style={{ fontWeight: 700 }}>${order.totalAmount.toLocaleString()}</td>
                  <td>{getInvoiceBadge(order.invoiceStatus)}</td>
                  <td>
                    <Link href={`/admin/orders/${order.id}`} className="btn btn-ghost btn-sm">
                      View Order ➔
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* ─── Kanban View ────────────────────────────────────────────── */
        <div className="kanban-grid stagger-children">
          {orders.map((order) => {
            const firstProduct = order.orderLines[0]?.product?.name || "Equipment Rental";
            return (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="kanban-card-link"
              >
                <div className="kanban-card">
                  <div className="kanban-card-header">
                    <div>
                      <h4 className="kanban-customer">{order.customerName}</h4>
                      <span className="kanban-order-no">{order.orderNumber}</span>
                    </div>
                    <div className="kanban-amount">${order.totalAmount}</div>
                  </div>

                  <div className="kanban-product-name">{firstProduct}</div>

                  <div className="kanban-card-footer">
                    <span className="kanban-duration">
                      📅 {order.rentalStart} → {order.rentalEnd}
                    </span>
                    <div>{getStatusBadge(order.status)}</div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
