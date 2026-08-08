"use client";

/**
 * SVG-based product illustrations with gradient backgrounds.
 * Each category gets a unique icon and color scheme for visual variety.
 */

interface ProductIconProps {
  category: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const categoryConfig: Record<
  string,
  { gradient: string; icon: React.ReactNode }
> = {
  "Cleaning Equipment": {
    gradient: "linear-gradient(135deg, #0ea5e9, #6366f1)",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="22" y="8" width="12" height="6" rx="2" />
        <rect x="24" y="14" width="8" height="28" rx="1" />
        <circle cx="28" cy="22" r="2" />
        <path d="M20 42h16l2 6H18l2-6z" />
        <path d="M24 42v-4M32 42v-4" />
      </svg>
    ),
  },
  "Heavy Equipment": {
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="30" width="24" height="12" rx="2" />
        <path d="M32 34h8l8 8H32z" />
        <path d="M16 30V18h6l4 4v8" />
        <circle cx="14" cy="46" r="4" />
        <circle cx="26" cy="46" r="4" />
        <circle cx="42" cy="46" r="4" />
        <path d="M40 34v-8l-6-6" />
      </svg>
    ),
  },
  "Access Equipment": {
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 48L22 8" />
        <path d="M40 48L34 8" />
        <path d="M18 18h20M19 28h18M20 38h16" />
        <rect x="17" y="6" width="22" height="4" rx="1" />
      </svg>
    ),
  },
  Construction: {
    gradient: "linear-gradient(135deg, #f97316, #eab308)",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="28" cy="28" r="14" />
        <path d="M28 14v28" />
        <path d="M18 20l10 8-10 8" />
        <path d="M38 20L28 28l10 8" />
        <path d="M14 28h28" />
      </svg>
    ),
  },
  "AV Equipment": {
    gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="14" width="36" height="24" rx="3" />
        <circle cx="28" cy="26" r="6" />
        <circle cx="28" cy="26" r="2" />
        <path d="M24 38l-4 10M32 38l4 10M20 48h16" />
      </svg>
    ),
  },
  Events: {
    gradient: "linear-gradient(135deg, #ec4899, #f59e0b)",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 40h40" />
        <path d="M12 40L20 12h16l8 28" />
        <path d="M20 12c0-4 3.5-4 8-4s8 0 8 4" />
        <path d="M16 28h24" />
        <path d="M10 40v6M46 40v6" />
      </svg>
    ),
  },
  "Power Equipment": {
    gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="12" y="16" width="32" height="24" rx="3" />
        <path d="M20 16v-4h16v4" />
        <path d="M28 24v8M24 28h8" />
        <circle cx="28" cy="28" r="8" strokeDasharray="3 2" />
        <path d="M18 40v4M38 40v4" />
      </svg>
    ),
  },
};

export default function ProductIcon({
  category,
  size = "md",
  className = "",
}: ProductIconProps) {
  const config = categoryConfig[category] || {
    gradient: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    icon: (
      <svg width="56" height="56" viewBox="0 0 56 56" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="12" y="12" width="32" height="32" rx="4" />
        <path d="M20 28h16M28 20v16" />
      </svg>
    ),
  };

  const sizeMap = {
    sm: { width: "100%", height: "120px" },
    md: { width: "100%", height: "180px" },
    lg: { width: "100%", height: "280px" },
  };

  const iconScale = {
    sm: "scale(0.8)",
    md: "scale(1)",
    lg: "scale(1.6)",
  };

  return (
    <div
      className={`product-icon ${className}`}
      style={{
        ...sizeMap[size],
        background: config.gradient,
        borderRadius: "var(--radius-md)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "50%",
          height: "80%",
          background: "rgba(255,255,255,0.08)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "-15%",
          width: "60%",
          height: "80%",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "50%",
        }}
      />
      {/* Icon */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          opacity: 0.9,
          transform: iconScale[size],
        }}
      >
        {config.icon}
      </div>
    </div>
  );
}
