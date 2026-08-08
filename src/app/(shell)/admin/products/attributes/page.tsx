"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Attribute {
  id: string;
  name: string;
  displayType: string;
  values: string;
}

export default function ProductAttributesPage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [name, setName] = useState("");
  const [displayType, setDisplayType] = useState("radio");
  const [optionsStr, setOptionsStr] = useState("Option 1, Option 2, Option 3");
  const [loading, setLoading] = useState(true);

  const fetchAttributes = () => {
    setLoading(true);
    fetch("/api/attributes")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAttributes(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  const handleCreateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const valuesArr = optionsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/attributes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          displayType,
          values: valuesArr,
        }),
      });

      if (res.ok) {
        setName("");
        fetchAttributes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-shell animate-fade-in">
      <nav className="breadcrumb">
        <Link href="/admin/products" className="breadcrumb-link">
          ← Back to Products
        </Link>
      </nav>

      <h1 className="page-title">Product Attributes</h1>
      <p className="page-subtitle">Configure custom attributes (Brand, Color, Size) & UI display controls.</p>

      {/* Attribute Creation Form */}
      <form onSubmit={handleCreateAttribute} className="card order-form-card" style={{ marginBottom: 24 }}>
        <h3 className="settings-section-title">New Product Attribute</h3>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Attribute Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Brand, Color, Fuel Type"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Display Type</label>
            <select
              className="form-select"
              value={displayType}
              onChange={(e) => setDisplayType(e.target.value)}
            >
              <option value="radio">Radio Buttons</option>
              <option value="pills">Pills / Badges</option>
              <option value="select">Dropdown Select</option>
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: "span 2" }}>
            <label className="form-label">Options (Comma separated)</label>
            <input
              type="text"
              className="form-input"
              placeholder="Option 1, Option 2, Option 3"
              value={optionsStr}
              onChange={(e) => setOptionsStr(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
          + Add Attribute
        </button>
      </form>

      {/* Attributes List */}
      {loading ? (
        <div style={{ padding: "20px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading attributes...
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Attribute Name</th>
                <th>Display Type</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {attributes.map((attr) => {
                let parsed: string[] = [];
                try {
                  parsed = typeof attr.values === "string" ? JSON.parse(attr.values) : attr.values;
                } catch {
                  parsed = [];
                }

                return (
                  <tr key={attr.id}>
                    <td style={{ fontWeight: 700, color: "var(--text-primary)" }}>{attr.name}</td>
                    <td>
                      <span className="badge badge-active">{attr.displayType}</span>
                    </td>
                    <td>
                      {parsed.map((opt, i) => (
                        <span key={i} className="badge badge-booked" style={{ marginRight: 6 }}>
                          {opt}
                        </span>
                      ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
