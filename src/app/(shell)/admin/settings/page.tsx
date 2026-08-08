"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"general" | "profile">("general");

  const [settings, setSettings] = useState({
    dailyRate: 15,
    hourlyRate: 2.5,
    gracePeriodDays: 1,
    enableVendors: true,
    enableAttributes: true,
    enablePriceLists: true,
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.dailyRate !== undefined) {
          setSettings({
            dailyRate: data.dailyRate,
            hourlyRate: data.hourlyRate || 2.5,
            gracePeriodDays: data.gracePeriodDays,
            enableVendors: data.enableVendors ?? true,
            enableAttributes: data.enableAttributes ?? true,
            enablePriceLists: data.enablePriceLists ?? true,
          });
        }
      });
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSuccess("Settings updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-shell animate-fade-in">
      <h1 className="page-title">Settings & Configuration</h1>
      <p className="page-subtitle">Configure rental rules, vendor features, and user profile.</p>

      {/* Tabs Switcher */}
      <div className="settings-nav-tabs">
        <button
          className={`tab-btn ${activeTab === "general" ? "tab-btn-active" : ""}`}
          onClick={() => setActiveTab("general")}
        >
          General Configuration
        </button>
        <button
          className={`tab-btn ${activeTab === "profile" ? "tab-btn-active" : ""}`}
          onClick={() => setActiveTab("profile")}
        >
          User & Profile Info
        </button>
        <Link href="/admin/settings/quotation-templates" className="tab-btn">
          Quotation Templates ➔
        </Link>
      </div>

      {success && <div className="auth-success-badge" style={{ marginBottom: 16 }}>{success}</div>}

      {activeTab === "general" ? (
        <form onSubmit={handleSaveSettings} className="card settings-card">
          {/* Pickup & Return Section */}
          <div className="settings-section">
            <h3 className="settings-section-title">Pickup & Return Configuration</h3>
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Late Fee Rate ($ / day)</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.dailyRate}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, dailyRate: parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Overdue Penalty ($ / hour)</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.hourlyRate}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, hourlyRate: parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Grace Period (Days)</label>
                <input
                  type="number"
                  className="form-input"
                  value={settings.gracePeriodDays}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, gracePeriodDays: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>
            <span className="field-hint">
              Applied automatically to late returns after grace period expires.
            </span>
          </div>

          {/* Product Feature Toggles */}
          <div className="settings-section">
            <h3 className="settings-section-title">Product Features</h3>
            <div className="toggle-group">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.enableVendors}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, enableVendors: e.target.checked }))
                  }
                />
                <span>Multi-Vendor Support (Allows Vendor Sign-Up & Product Attribution)</span>
              </label>

              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.enableAttributes}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, enableAttributes: e.target.checked }))
                  }
                />
                <span>Product Attributes & Variants (Display Type: Radio, Pills, Select)</span>
              </label>

              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={settings.enablePriceLists}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, enablePriceLists: e.target.checked }))
                  }
                />
                <span>Multiple Price Lists & Tiered Pricing</span>
              </label>
            </div>
          </div>

          {/* Database Administration Section */}
          <div className="settings-section" style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
            <h3 className="settings-section-title" style={{ color: "#ef4444" }}>Database Administration</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 12 }}>
              Reset all rental orders, products, users, and restore clean initial demo data.
            </p>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ color: "#ef4444", borderColor: "#ef4444", fontWeight: 700 }}
              onClick={async () => {
                if (confirm("Are you sure you want to reset the database and re-seed default demo data?")) {
                  setSaving(true);
                  try {
                    const res = await fetch("/api/reset", { method: "POST" });
                    if (res.ok) {
                      setSuccess("Database reset and re-seeded successfully!");
                    } else {
                      alert("Database reset failed.");
                    }
                  } catch (err) {
                    console.error(err);
                  } finally {
                    setSaving(false);
                  }
                }
              }}
            >
              🔄 Reset Database & Re-seed Demo Data
            </button>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving Settings..." : "Save Configuration"}
          </button>
        </form>
      ) : (
        /* User Profile Section (Image 3 Wireframe) */
        <div className="card settings-card">
          <h3 className="settings-section-title">User Account Profile</h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">User Name</label>
              <input
                type="text"
                className="form-input"
                value={session?.user?.name || "Admin User"}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email ID</label>
              <input
                type="email"
                className="form-input"
                value={session?.user?.email || "admin@locare.com"}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Account Role</label>
              <input
                type="text"
                className="form-input"
                value={(session?.user as { role?: string })?.role || "admin"}
                readOnly
              />
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <Link href="/auth/reset-password" className="btn btn-ghost">
              Change Password
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
