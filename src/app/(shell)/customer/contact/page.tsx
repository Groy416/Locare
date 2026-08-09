"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, ArrowLeft, MessageSquare, HelpCircle, Sparkles } from "lucide-react";

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Customer Support Hotline",
      details: "+91 (800) 562-2731",
      subtitle: "Mon - Sat: 8:00 AM - 8:00 PM EST",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: Mail,
      title: "Email Support",
      details: "support@locare.com",
      subtitle: "Fast response within 2 business hours",
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20",
    },
    {
      icon: MapPin,
      title: "Global Headquarters",
      details: "Locare Enterprise Towers, Suite 402",
      subtitle: "Tech Park Boulevard, Innovation Hub",
      color: "text-lime-400",
      bg: "bg-lime-500/10",
      border: "border-lime-500/20",
    },
    {
      icon: Clock,
      title: "Business & Return Hours",
      details: "8:00 AM – 8:00 PM Daily",
      subtitle: "Automated Returns 24/7",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
  ];

  const faqs = [
    {
      q: "How do I return a rented item?",
      a: "Items can be returned directly at our pickup hub or scheduled for courier pickup via your customer portal. Once processed, your security deposit will be automatically settled.",
    },
    {
      q: "What happens if an item is returned late?",
      a: "A standard 1-day grace period is provided. Afterward, a daily late fee (default ₹15 / $15 per day) is automatically calculated and deducted from the held deposit.",
    },
    {
      q: "Can I extend my rental duration?",
      a: "Yes! You can extend active rentals through customer support or your customer dashboard prior to the scheduled return date.",
    },
    {
      q: "How do security deposit refunds work?",
      a: "Security deposits are held in escrow and automatically released within 24-48 hours following successful return inspection.",
    },
  ];

  return (
    <div className="page-shell animate-fade-in max-w-6xl mx-auto px-4 py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Link href="/customer" className="inline-flex items-center text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Products
        </Link>
      </div>

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
          <MessageSquare className="w-3.5 h-3.5" /> 24/7 Support Center
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">Get in Touch with Locare</h1>
        <p className="text-base text-slate-300">
          Have questions about a rental booking, security deposit refund, or vendor onboarding? We are here to help!
        </p>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {contactInfo.map((info, idx) => {
          const Icon = info.icon;
          return (
            <div key={idx} className="card p-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col items-start hover:border-slate-700 transition-all">
              <div className={`p-3 rounded-xl ${info.bg} ${info.border} border ${info.color} mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{info.title}</h3>
              <p className="text-sm font-extrabold text-slate-200 mb-1">{info.details}</p>
              <p className="text-xs text-slate-400">{info.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Form + FAQ */}
      <div className="grid lg:grid-cols-12 gap-8 mb-12">
        {/* Contact Form */}
        <div className="lg:col-span-7 card p-8 bg-slate-900/70 border border-slate-800 rounded-3xl">
          <h2 className="text-2xl font-extrabold text-white mb-2 flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-400" /> Send Us a Message
          </h2>
          <p className="text-xs text-slate-400 mb-6">Fill out the form below and our team will get back to you promptly.</p>

          {submitted ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-fade-in">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">Message Sent Successfully!</h3>
              <p className="text-xs text-slate-300 mb-4">
                Thank you for contacting Locare Support. A representative has received your request and will respond shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
                }}
                className="btn btn-ghost btn-sm text-xs font-bold"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Sarah Chen"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input text-xs w-full bg-slate-950/80 border-slate-700 rounded-xl"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="sarah@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input text-xs w-full bg-slate-950/80 border-slate-700 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="form-label text-xs">Inquiry Topic</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="form-input text-xs w-full bg-slate-950/80 border-slate-700 rounded-xl"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Booking & Rental Support">Booking & Rental Support</option>
                  <option value="Security Deposit & Fines">Security Deposit & Fines</option>
                  <option value="Vendor Onboarding">Vendor Onboarding</option>
                  <option value="Technical Support">Technical Support</option>
                </select>
              </div>

              <div>
                <label className="form-label text-xs">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we assist you with your rental or account?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-input text-xs w-full bg-slate-950/80 border-slate-700 rounded-xl resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-block btn-lg text-sm font-extrabold"
              >
                {loading ? "Sending Message..." : "Send Message ➔"}
              </button>
            </form>
          )}
        </div>

        {/* FAQ Accordion Column */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="card p-8 bg-slate-900/70 border border-slate-800 rounded-3xl mb-6">
            <h2 className="text-xl font-extrabold text-white mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-lime-400" /> Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-400 mb-6">Quick answers to common queries.</p>

            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-sm font-bold text-white mb-1.5">{faq.q}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-300">Need instant admin help?</span>
            </div>
            <Link href="/auth/login" className="btn btn-ghost btn-sm text-xs font-bold">
              Admin Login ➔
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
