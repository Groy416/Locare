"use client";

import React from "react";

interface ProductIconProps {
  category: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

interface CategoryStyle {
  gradient: string;
  accent: string;
  icon: React.ReactNode;
}

const categoryStyles: Record<string, CategoryStyle> = {
  // Furniture & Living Room
  Furniture: {
    gradient: "linear-gradient(135deg, #1e293b, #0f172a)",
    accent: "#38bdf8",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#38bdf8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {/* Modern Sofa */}
        <path d="M12 36v12M52 36v12" />
        <rect x="8" y="24" width="48" height="16" rx="4" fill="rgba(56, 189, 248, 0.1)" />
        <path d="M12 24V16c0-2.2 1.8-4 4-4h32c2.2 0 4 1.8 4 4v8" />
        <path d="M8 28c-2.2 0-4 1.8-4 4v6c0 2.2 1.8 4 4 4h4V28H8z" />
        <path d="M56 28c2.2 0 4 1.8 4 4v6c0 2.2-1.8 4-4 4h-4V28h4z" />
        <line x1="32" y1="24" x2="32" y2="40" strokeDasharray="3 3" />
      </svg>
    ),
  },

  // Office & Workspace
  "Office Furniture": {
    gradient: "linear-gradient(135deg, #115e59, #042f2e)",
    accent: "#2dd4bf",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#2dd4bf" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {/* Executive Desk + Monitor */}
        <rect x="10" y="32" width="44" height="6" rx="2" fill="rgba(45, 212, 191, 0.15)" />
        <path d="M14 38v16M50 38v16" />
        <path d="M22 38v16M42 38v16" />
        <rect x="22" y="16" width="20" height="12" rx="2" />
        <path d="M28 28v4h8v-4" />
      </svg>
    ),
  },

  // Dining & Tables
  Dining: {
    gradient: "linear-gradient(135deg, #451a03, #1c0a00)",
    accent: "#fb923c",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#fb923c" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {/* Dining Table Set */}
        <ellipse cx="32" cy="26" rx="22" ry="8" fill="rgba(251, 146, 60, 0.15)" />
        <path d="M20 32v18M44 32v18" />
        <path d="M12 24v-8c0-1.5 1-3 2.5-3s2.5 1.5 2.5 3v8" />
        <path d="M52 24v-8c0-1.5-1-3-2.5-3S47 11.5 47 13v8" />
      </svg>
    ),
  },

  // Electronics & Smart TV
  Electronics: {
    gradient: "linear-gradient(135deg, #1e1b4b, #0f172a)",
    accent: "#818cf8",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#818cf8" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {/* Smart TV Display */}
        <rect x="8" y="14" width="48" height="30" rx="3" fill="rgba(129, 140, 248, 0.1)" />
        <path d="M24 44l-4 8M40 44l4 8M18 52h28" />
        <polygon points="28 24 38 29 28 34 28 24" fill="#818cf8" />
      </svg>
    ),
  },

  // Computers & Workstations
  Computers: {
    gradient: "linear-gradient(135deg, #18181b, #09090b)",
    accent: "#a1a1aa",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#a1a1aa" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {/* High-Performance PC & Workstation */}
        <rect x="12" y="16" width="40" height="24" rx="2" fill="rgba(161, 161, 170, 0.1)" />
        <path d="M20 40v6M44 40v6M16 46h32" />
        <rect x="22" y="20" width="20" height="16" rx="1" strokeDasharray="2 2" />
      </svg>
    ),
  },

  // Gaming Equipment
  Gaming: {
    gradient: "linear-gradient(135deg, #2e1065, #1e1b4b)",
    accent: "#c084fc",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#c084fc" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {/* Next-Gen Gaming Console & Controller */}
        <path d="M16 26c0-4.4 3.6-8 8-8h16c4.4 0 8 3.6 8 8v12c0 4.4-3.6 8-8 8l-4-4H28l-4 4c-4.4 0-8-3.6-8-8V26z" fill="rgba(192, 132, 252, 0.1)" />
        <path d="M24 28v6M21 31h6" />
        <circle cx="40" cy="29" r="1.5" fill="#c084fc" />
        <circle cx="44" cy="33" r="1.5" fill="#c084fc" />
      </svg>
    ),
  },

  // Audio & Acoustics
  Audio: {
    gradient: "linear-gradient(135deg, #064e3b, #022c22)",
    accent: "#34d399",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#34d399" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {/* Studio Speaker */}
        <rect x="18" y="10" width="28" height="44" rx="4" fill="rgba(52, 211, 153, 0.1)" />
        <circle cx="32" cy="22" r="4" />
        <circle cx="32" cy="38" r="8" />
        <circle cx="32" cy="38" r="3" />
      </svg>
    ),
  },

  // Camera & Optics
  Cameras: {
    gradient: "linear-gradient(135deg, #450a0a, #18181b)",
    accent: "#f87171",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="#f87171" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {/* DSLR Camera Body & Lens */}
        <path d="M12 22h8l4-6h16l4 6h8c2.2 0 4 1.8 4 4v22c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V26c0-2.2 1.8-4 4-4z" fill="rgba(248, 113, 113, 0.1)" />
        <circle cx="32" cy="34" r="10" />
        <circle cx="32" cy="34" r="5" />
      </svg>
    ),
  },
};

export default function ProductIcon({
  category,
  size = "md",
  className = "",
}: ProductIconProps) {
  // Determine matching key or fallback
  const matchingKey = Object.keys(categoryStyles).find((key) =>
    category.toLowerCase().includes(key.toLowerCase())
  ) || "Furniture";

  const styleConfig = categoryStyles[matchingKey];

  const heightMap: Record<string, string> = {
    xs: "56px",
    sm: "140px",
    md: "190px",
    lg: "280px",
  };

  return (
    <div
      className={`product-icon-technical ${className}`}
      style={{
        width: "100%",
        height: heightMap[size],
        background: styleConfig.gradient,
        borderRadius: "var(--radius-md)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Background Technical Grid Pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `radial-gradient(${styleConfig.accent} 0.75px, transparent 0.75px)`,
          backgroundSize: "16px 16px",
          opacity: 0.15,
        }}
      />

      {/* Category Code Badge */}
      <span
        style={{
          position: "absolute",
          top: 8,
          left: 10,
          fontSize: "0.65rem",
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: styleConfig.accent,
          background: "rgba(0,0,0,0.5)",
          padding: "2px 6px",
          borderRadius: "4px",
          border: `1px solid ${styleConfig.accent}33`,
          backdropFilter: "blur(4px)",
          zIndex: 1,
        }}
      >
        [{category.toUpperCase()}]
      </span>

      {/* Main SVG Graphic */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
          transform: size === "xs" ? "scale(0.5)" : size === "sm" ? "scale(0.85)" : size === "lg" ? "scale(1.3)" : "scale(1)",
        }}
      >
        {styleConfig.icon}
      </div>
    </div>
  );
}
