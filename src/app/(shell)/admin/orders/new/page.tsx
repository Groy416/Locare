"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Product } from "@/lib/data";

interface DraftLine {
  productId: string | number;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
}

export default function NewRentalOrderPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [rentalStart, setRentalStart] = useState(new Date().toISOString().split("T")[0]);
  const [rentalEnd, setRentalEnd] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]
  );
  const [priceList, setPriceList] = useState("Standard");
  const [lines, setLines] = useState<DraftLine[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
          if (data.length > 0) {
            setLines([
              {
                productId: data[0].id,
                quantity: 1,
                unitPrice: data[0].price,
                taxPercent: 10,
              },
            ]);
          }
        }
      });
  }, []);

  const handleAddLine = () => {
    if (products.length > 0) {
      setLines((prev) => [
        ...prev,
        {
          productId: products[0].id,
          quantity: 1,
          unitPrice: products[0].price,
          taxPercent: 10,
        },
      ]);
    }
  };

  const handleRemoveLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLineProductChange = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;
    setLines((prev) =>
      prev.map((l, i) =>
        i === index ? { ...l, productId: prodId, unitPrice: prod.price } : l
      )
    );
  };

  const handleLineQtyChange = (index: number, qty: number) => {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, quantity: Math.max(1, qty) } : l))
    );
  };

  const untaxedAmount = lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);
  const taxAmount = untaxedAmount * 0.1;
  const totalAmount = untaxedAmount + taxAmount;

  const handleSubmit = async (statusTarget: "QUOTATION" | "QUOTATION_SENT" | "CONFIRMED") => {
    if (!customerName) {
      alert("Please enter Customer Name.");
      return;
    }
    if (lines.length === 0) {
      alert("Please add at least one product order line.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          invoiceAddress,
          deliveryAddress,
          rentalStart,
          rentalEnd,
          priceList,
          orderLines: lines,
        }),
      });

      const data = await res.json();

      if (res.ok && data.id) {
        if (statusTarget !== "QUOTATION") {
          await fetch(`/api/orders/${data.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: statusTarget }),
          });
        }
        router.push(`/admin/orders/${data.id}`);
      } else {
        alert(data.error || "Failed to create order.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred creating the order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell animate-fade-in">
      <nav className="breadcrumb">
        <Link href="/admin" className="breadcrumb-link">
          ← Back to Orders
        </Link>
      </nav>

      {/* ─── Workflow Header Bar ────────────────────────────────────────── */}
      <div className="order-workflow-bar">
        <div className="order-workflow-actions">
          <span className="order-status-badge">New Rental Order</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleSubmit("QUOTATION")}
            disabled={loading}
          >
            Save Quotation
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => handleSubmit("QUOTATION_SENT")}
            disabled={loading}
          >
            Send Quotation
          </button>
          <button
            className="btn btn-success btn-sm"
            onClick={() => handleSubmit("CONFIRMED")}
            disabled={loading}
          >
            Confirm Sale Order
          </button>
        </div>

        {/* Workflow State Indicator */}
        <div className="workflow-steps">
          <span className="workflow-step workflow-step-active">Quotation</span>
          <span className="workflow-step">Quotation Sent</span>
          <span className="workflow-step">Sale Order</span>
        </div>
      </div>

      {/* ─── Order Form ─────────────────────────────────────────────────── */}
      <div className="card order-form-card">
        <div className="form-header-group">
          <h2 className="order-title">New Order Draft</h2>
        </div>

        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Customer</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sarah Chen"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Rental Period</label>
            <div className="date-range-row">
              <input
                type="date"
                className="form-input"
                value={rentalStart}
                onChange={(e) => setRentalStart(e.target.value)}
              />
              <span>➔</span>
              <input
                type="date"
                className="form-input"
                value={rentalEnd}
                onChange={(e) => setRentalEnd(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Invoice Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="Address for billing..."
              value={invoiceAddress}
              onChange={(e) => setInvoiceAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Delivery Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="Address for pickup/delivery..."
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Price List</label>
            <select
              className="form-select"
              value={priceList}
              onChange={(e) => setPriceList(e.target.value)}
            >
              <option value="Standard">Standard Public Pricelist</option>
              <option value="Corporate">Corporate Preferred (10% Off)</option>
              <option value="VIP">VIP Platinum Partner</option>
            </select>
          </div>
        </div>

        {/* ─── Order Line Table (Image 4 Wireframe) ───────────────────── */}
        <div className="order-lines-section">
          <h3 className="lines-title">Order Lines</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price ($)</th>
                  <th>Taxes %</th>
                  <th>Amount ($)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={line.productId}
                        onChange={(e) => handleLineProductChange(idx, e.target.value)}
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${p.price}/{p.rentalUnit})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input form-input-sm"
                        style={{ width: 80 }}
                        min={1}
                        value={line.quantity}
                        onChange={(e) => handleLineQtyChange(idx, parseInt(e.target.value) || 1)}
                      />
                    </td>
                    <td>${line.unitPrice}</td>
                    <td>10%</td>
                    <td style={{ fontWeight: 700 }}>
                      ${(line.quantity * line.unitPrice).toLocaleString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleRemoveLine(idx)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="order-line-actions">
            <button className="btn btn-ghost btn-sm" onClick={handleAddLine}>
              + Add a Product
            </button>
          </div>
        </div>

        {/* ─── Financial Totals Summary ────────────────────────────────── */}
        <div className="order-totals-box">
          <div className="total-row">
            <span>Untaxed Amount:</span>
            <strong>${untaxedAmount.toLocaleString()}</strong>
          </div>
          <div className="total-row">
            <span>Taxes (10%):</span>
            <strong>${taxAmount.toLocaleString()}</strong>
          </div>
          <div className="total-row total-row-grand">
            <span>Total Amount:</span>
            <strong>${totalAmount.toLocaleString()}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
