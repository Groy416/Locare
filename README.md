# 🏠 Rental Management System

A demo Rental Management System built with **Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

> **📋 MVP Scope:** See [`docs/MVP-SCOPE.md`](./docs/MVP-SCOPE.md) for what's in and out of scope.

## Features

### Customer Flow
- Browse rental catalog
- Book items with date selection
- Pay rental fee + security deposit (simulated)

### Admin Dashboard
- Real-time rental metrics
- Active rentals, revenue, overdue tracking

### Admin Return Processing
- Auto late-fee calculation
- Deposit settlement & refund computation

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Data Store | In-memory JSON (no real DB) |
| Auth | Fake role switcher |
| Payments | Simulated |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
docs/
└── MVP-SCOPE.md      # MVP scope definition
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
