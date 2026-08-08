"use client";

export default function CustomerBookingsPage() {
  return (
    <div className="page-shell animate-fade-in">
      <h1 className="page-title">My Bookings</h1>
      <p className="page-subtitle">Track your current and past rentals.</p>

      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <p className="empty-state-text">
          No bookings yet. Browse the catalog to get started!
        </p>
      </div>
    </div>
  );
}
