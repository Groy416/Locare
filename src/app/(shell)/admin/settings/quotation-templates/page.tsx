"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  validityDays: number;
  paymentTerms: string;
}

export default function QuotationTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState("");
  const [validityDays, setValidityDays] = useState(30);
  const [paymentTerms, setPaymentTerms] = useState("Immediate Payment");
  const [loading, setLoading] = useState(true);

  const fetchTemplates = () => {
    fetch("/api/quotation-templates")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTemplates(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch("/api/quotation-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, validityDays, paymentTerms }),
      });

      if (res.ok) {
        setName("");
        fetchTemplates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-shell animate-fade-in">
      <nav className="breadcrumb">
        <Link href="/admin/settings" className="breadcrumb-link">
          ← Back to Settings
        </Link>
      </nav>

      <h1 className="page-title">Quotation Templates</h1>
      <p className="page-subtitle">Configure pre-set quotation terms and default product lines.</p>

      {/* Template Creation Form */}
      <form onSubmit={handleCreateTemplate} className="card order-form-card" style={{ marginBottom: 24 }}>
        <h3 className="settings-section-title">New Quotation Template</h3>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Template Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Home Rental Furniture"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Quotation Validity (Days)</label>
            <input
              type="number"
              className="form-input"
              value={validityDays}
              onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Payment Terms</label>
            <select
              className="form-select"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
            >
              <option value="Immediate Payment">Immediate Payment</option>
              <option value="15 Days Net">15 Days Net</option>
              <option value="30 Days Net">30 Days Net</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
          + Create Template
        </button>
      </form>

      {/* Templates List */}
      {loading ? (
        <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading templates...
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Template Name</th>
                <th>Quotation Validity</th>
                <th>Payment Terms</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{t.name}</td>
                  <td>{t.validityDays} Days</td>
                  <td>{t.paymentTerms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
