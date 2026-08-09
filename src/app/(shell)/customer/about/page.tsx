"use client";

import Link from "next/link";
import { Sparkles, Shield, Boxes, ArrowLeft, Award, Users, RefreshCw, Zap, Layers, CheckCircle2 } from "lucide-react";

export default function AboutUsPage() {
  const metrics = [
    { label: "Rentals Fulfilled", value: "10,000+", icon: Boxes, color: "text-emerald-400" },
    { label: "On-Time Fulfillment", value: "99.8%", icon: RefreshCw, color: "text-lime-400" },
    { label: "Verified Vendors", value: "500+", icon: Shield, color: "text-teal-400" },
    { label: "Customer Satisfaction", value: "4.9 / 5.0", icon: Award, color: "text-amber-400" },
  ];

  const features = [
    {
      title: "Real-Time Inventory Tracking",
      description: "Automatic stock updates upon booking checkout and live auto-restoration (0 Sold Out ➔ 1 Available) upon return.",
      icon: Zap,
    },
    {
      title: "Automated Late Fine Engine",
      description: "Smart calculation engine calculating daily late rates with grace periods and seamless security deposit settlements.",
      icon: RefreshCw,
    },
    {
      title: "Category-Aware Variants & Color Filters",
      description: "Dynamic color swatch filters for Clothing, Footwear, Electronics, and Furniture with instant live variant syncing.",
      icon: Layers,
    },
    {
      title: "Enterprise ERP Workflow",
      description: "Full end-to-end lifecycle management from Quotation creation to Sale Order confirmation, Pickup, and Invoicing.",
      icon: Shield,
    },
  ];

  const team = [
    { name: "Sarah Chen", role: "Head of Product Strategy", avatar: "👩‍💼" },
    { name: "Mark Wood", role: "Lead ERP & Logistics Architect", avatar: "👨‍💻" },
    { name: "Garima Roy", role: "Customer Operations Director", avatar: "👩‍🔬" },
  ];

  return (
    <div className="page-shell animate-fade-in max-w-6xl mx-auto px-4 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Link href="/customer" className="inline-flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Products
        </Link>
      </div>

      {/* Hero Header */}
      <div className="relative rounded-3xl p-8 md:p-12 mb-12 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border border-slate-800 overflow-hidden shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" /> About Locare Enterprise
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-6">
            Revolutionizing Rental Equipment & Enterprise Resource Planning.
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Locare is the next-generation Equipment Rental & Management ERP platform designed for seamless multi-category product rentals, automated deposit settlements, real-time inventory tracking, and dynamic variant fulfillment.
          </p>
        </div>
      </div>

      {/* Platform Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} className="card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col items-center text-center hover:border-slate-700 transition-all">
              <Icon className={`w-8 h-8 mb-3 ${m.color}`} />
              <div className="text-3xl font-black text-white tracking-tight mb-1">{m.value}</div>
              <div className="text-xs font-semibold text-slate-400">{m.label}</div>
            </div>
          );
        })}
      </div>

      {/* Mission & Vision Section */}
      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-4">Our Mission</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            To empower vendors, businesses, and customers with a frictionless, highly-automated rental ecosystem that eliminates manual inventory errors, simplifies billing, and guarantees 100% transparent deposit refunds.
          </p>
        </div>

        <div className="card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mb-6">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-4">Our Vision</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            To become the global standard in rental resource management by pioneering smart ERP workflows, automated late fine logic, and real-time category variant synchronization.
          </p>
        </div>
      </div>

      {/* Core Platform Capabilities */}
      <div className="mb-12">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-3xl font-black text-white tracking-tight mb-2">Built for Speed, Accuracy & Scale</h2>
          <p className="text-sm text-slate-400">Discover the advanced ERP capabilities powering the Locare ecosystem.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="card p-6 bg-slate-900/70 border border-slate-800 rounded-2xl flex items-start gap-4 hover:border-slate-700 transition-all">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5">{f.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{f.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leadership Showcase */}
      <div className="card p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center mb-12">
        <h2 className="text-2xl font-extrabold text-white mb-2">Locare Leadership Team</h2>
        <p className="text-xs text-slate-400 mb-8">Dedicated professionals driving innovation in enterprise rental solutions.</p>

        <div className="grid sm:grid-cols-3 gap-6">
          {team.map((member, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center">
              <div className="text-4xl mb-3">{member.avatar}</div>
              <h3 className="text-base font-bold text-white mb-0.5">{member.name}</h3>
              <span className="text-xs font-semibold text-emerald-400">{member.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Footer */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-lime-600 to-teal-600 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <h3 className="text-2xl font-black tracking-tight">Ready to experience Locare?</h3>
          <p className="text-xs font-bold opacity-90 mt-1">Explore our products or join as a registered vendor today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/customer" className="btn btn-dark btn-sm text-xs font-extrabold px-6 py-2.5 rounded-xl bg-slate-950 text-white hover:bg-slate-900">
            Browse Catalog ➔
          </Link>
        </div>
      </div>
    </div>
  );
}
