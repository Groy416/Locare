# Rental Management System — MVP Scope

> **This document is the single source of truth for what is IN and OUT of scope for the MVP demo.**
> Reference this file in every task going forward.

---

## ✅ Building (In Scope)

### 1. Customer Rental Flow
- **Browse catalog** — customers can view available rental items with descriptions, images, and pricing
- **Book / reserve** — customers can select items, choose rental dates, and create a booking
- **Pay with security deposit** — checkout flow that collects rental fee + a refundable security deposit (faked payment)

### 2. Admin Dashboard
- **Real-time rental metrics** — overview of active rentals, revenue, overdue items, deposit balances, and utilization rates
- Live-updating widgets and charts

### 3. Admin Return Processing
- **Auto late-fee calculation** — system automatically computes late fees based on the return date vs. due date
- **Deposit settlement** — on return, the system deducts any late fees or damage charges from the security deposit and shows the refund amount

---

## 🚫 NOT Building (Out of Scope)

| Feature | Reason / Replacement |
|---|---|
| Real authentication | Use a **simple role switcher** (Customer ↔ Admin) in the UI instead |
| Quotations | Not needed for MVP demo |
| Multiple pricelists | Single flat pricing only |
| Barcode / QR scanning | Out of scope |
| Pickup route planning | Out of scope |
| Notifications (email, SMS, push) | Out of scope |
| In-store / offline flow | Out of scope |
| Profile photo upload | Out of scope |
| Real payment processing | **Fake it** — simulate success/failure without a real payment gateway |
| Real database | **In-memory / JSON store only** — no external DB dependency |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State / Data | In-memory JSON store (server-side) |
| Auth | Fake role switcher (no real auth) |
| Payments | Simulated (no real gateway) |

---

*Last updated: 2026-08-08*
