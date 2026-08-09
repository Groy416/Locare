"use client";

import { useState } from "react";
import Link from "next/link";
import { ShieldCheck, FileText, ArrowLeft, Search, CheckCircle, Clock, AlertTriangle, HelpCircle } from "lucide-react";

export default function TermsAndConditionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "rental" | "deposits" | "latefees" | "cancellation">("all");

  const termsSections = [
    {
      id: "rental",
      category: "rental",
      title: "1. Rental Agreement & Duration Terms",
      icon: Clock,
      content: [
        "All rentals booked through Locare are subject to availability and formal order confirmation.",
        "The rental period begins on the agreed 'Rental Start Date' and concludes at the 'Rental End Date' specified in your booking confirmation.",
        "Customers must inspect all items immediately upon pickup or delivery and report any pre-existing damage within 2 hours of receipt.",
        "Rental items are charged per rental unit (Hourly, Daily, Weekly) as displayed on the product catalog.",
      ],
    },
    {
      id: "deposits",
      category: "deposits",
      title: "2. Security Deposit & Refund Policy",
      icon: ShieldCheck,
      content: [
        "A refundable security deposit is collected at checkout for every rental product to protect against loss or severe damage.",
        "Security deposits are held securely in escrow during the active rental period.",
        "Upon successful return inspection, 100% of the deposit is automatically refunded within 24 to 48 business hours.",
        "Any applicable late fees or repair charges will be transparently deducted from the security deposit, with remaining balances refunded to the customer.",
      ],
    },
    {
      id: "latefees",
      category: "latefees",
      title: "3. Late Return Fines & Grace Period",
      icon: AlertTriangle,
      content: [
        "Items must be returned by 8:00 PM on the scheduled Rental End Date.",
        "A standard 1-day grace period is extended to all customers for unforeseen delays.",
        "After the grace period expires, a late fine (default ₹15 / $15 per day) will accumulate automatically until the item is processed in Admin Returns.",
        "If an item is unreturned past 14 days without communication, it will be marked as unrecovered, and the full deposit will be forfeited.",
      ],
    },
    {
      id: "cancellation",
      category: "cancellation",
      title: "4. Cancellation & Booking Modficiations",
      icon: CheckCircle,
      content: [
        "Bookings cancelled at least 24 hours prior to the Rental Start Date receive a 100% full refund.",
        "Cancellations made within 24 hours of start time may incur a 15% restocking fee.",
        "Order modifications (e.g. extending rental duration) can be requested through customer support or Admin Order Details prior to return date.",
      ],
    },
  ];

  const filteredSections = termsSections.filter((section) => {
    const matchesTab = activeTab === "all" || section.category === activeTab;
    const matchesSearch =
      searchTerm === "" ||
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="page-shell animate-fade-in max-w-5xl mx-auto px-4 py-8">
      {/* Top Header & Breadcrumb */}
      <div className="mb-8">
        <Link href="/customer" className="inline-flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Products
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Terms & Conditions</h1>
            <p className="text-sm text-slate-400">Last updated: August 2026 • Official Locare Rental Service Agreement</p>
          </div>
        </div>
      </div>

      {/* Interactive Controls Bar */}
      <div className="card p-4 mb-8 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: "all", label: "All Policies" },
            { id: "rental", label: "Rental Terms" },
            { id: "deposits", label: "Security Deposits" },
            { id: "latefees", label: "Late Fines" },
            { id: "cancellation", label: "Cancellations" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input pl-9 text-xs w-full py-2 bg-slate-950/80 border-slate-700 rounded-xl"
          />
        </div>
      </div>

      {/* Policy Sections Cards */}
      <div className="space-y-6">
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.id} className="card p-6 bg-slate-900/70 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-xl font-bold text-white">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 card bg-slate-900/40 border border-slate-800 rounded-2xl">
            <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-200">No policies found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search terms or filters above.</p>
          </div>
        )}
      </div>

      {/* Print & Support Action Footer */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/30 to-slate-900 border border-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-white">Have questions about our terms?</h4>
          <p className="text-xs text-slate-400 mt-0.5">Our support team is available 24/7 to assist with your rental queries.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="btn btn-ghost btn-sm text-xs font-bold border border-slate-700"
          >
            🖨️ Print Policy
          </button>
          <Link href="/customer/contact" className="btn btn-primary btn-sm text-xs font-bold">
            Contact Support ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
