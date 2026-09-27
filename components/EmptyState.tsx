"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";

export type EmptyStateVariant =
  | "projects"
  | "assets"
  | "pairings"
  | "reports"
  | "search";

interface EmptyStateProps {
  variant: EmptyStateVariant;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  variant,
  title,
  description,
  actionText,
  actionHref,
  onAction,
  actionIcon,
  secondaryAction,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: BRAND_EASING }}
      className={`py-14 px-6 sm:px-10 rounded-3xl bg-ink-soft border border-mist/15 text-center flex flex-col items-center justify-center relative overflow-hidden ${className}`}
    >
      {/* Subtle background botanical watermark */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
        <svg width="400" height="400" viewBox="0 0 200 200" fill="none">
          <circle cx="100" cy="100" r="90" stroke="#F5F1E8" strokeWidth="1" strokeDasharray="4 6" />
          <path d="M100 20 C140 60, 140 140, 100 180 C60 140, 60 60, 100 20 Z" stroke="#6B8F6E" strokeWidth="1" />
        </svg>
      </div>

      {/* Bespoke SVG Illustration per Variant */}
      <div className="relative mb-6">
        {variant === "projects" && <ProjectsIllustration />}
        {variant === "assets" && <AssetsIllustration />}
        {variant === "pairings" && <PairingsIllustration />}
        {variant === "reports" && <ReportsIllustration />}
        {variant === "search" && <SearchIllustration />}
      </div>

      {/* Title & Copy */}
      <div className="max-w-md space-y-2 relative z-10">
        <h3 className="font-display text-xl sm:text-2xl text-bone tracking-tight font-medium">
          {title}
        </h3>
        <p className="font-sans text-xs sm:text-sm text-mist leading-relaxed text-center">
          {description}
        </p>
      </div>

      {/* Action CTAs */}
      {(actionText || secondaryAction) && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 relative z-10">
          {actionText && actionHref && (
            <Link
              href={actionHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-moss hover:bg-moss-bright text-bone font-sans text-xs font-medium tracking-wide transition-colors shadow-sm"
            >
              {actionIcon}
              <span>{actionText}</span>
            </Link>
          )}

          {actionText && onAction && !actionHref && (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-moss hover:bg-moss-bright text-bone font-sans text-xs font-medium tracking-wide transition-colors shadow-sm cursor-pointer"
            >
              {actionIcon}
              <span>{actionText}</span>
            </button>
          )}

          {secondaryAction}
        </div>
      )}
    </motion.div>
  );
}

// 1. Projects: Topographic contour lines & conservation plot coordinates
function ProjectsIllustration() {
  return (
    <div className="w-24 h-24 rounded-2xl bg-ink/80 border border-mist/20 p-3 flex items-center justify-center shadow-lg relative group">
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none" className="overflow-visible">
        {/* Topographic Contours */}
        <path
          d="M8 52 C18 42, 32 46, 44 38 C56 30, 58 18, 62 12"
          stroke="#9AA79D"
          strokeWidth="1.2"
          strokeOpacity="0.4"
          strokeDasharray="2 3"
        />
        <path
          d="M6 38 C16 28, 30 32, 42 22 C52 14, 56 8, 60 4"
          stroke="#9AA79D"
          strokeWidth="1.2"
          strokeOpacity="0.3"
        />
        {/* Plot Boundary Polygon */}
        <polygon
          points="14,18 48,14 56,46 22,54"
          fill="#3F5A44"
          fillOpacity="0.15"
          stroke="#6B8F6E"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Plot Pin / Node */}
        <circle cx="34" cy="34" r="4.5" fill="#0F1210" stroke="#D98E4A" strokeWidth="2" />
        <circle cx="34" cy="34" r="1.5" fill="#D98E4A" />
        {/* Orbit Grid Crosshairs */}
        <line x1="34" y1="6" x2="34" y2="12" stroke="#6B8F6E" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="34" y1="56" x2="34" y2="62" stroke="#6B8F6E" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="6" y1="34" x2="12" y2="34" stroke="#6B8F6E" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="56" y1="34" x2="62" y2="34" stroke="#6B8F6E" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// 2. Assets: Camera sensor matrix & botanical leaf contour
function AssetsIllustration() {
  return (
    <div className="w-24 h-24 rounded-2xl bg-ink/80 border border-mist/20 p-3 flex items-center justify-center shadow-lg relative">
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        {/* Shutter Outline */}
        <rect
          x="10"
          y="16"
          width="48"
          height="38"
          rx="8"
          fill="#171B18"
          stroke="#9AA79D"
          strokeWidth="1.5"
          strokeOpacity="0.6"
        />
        <path
          d="M24 16 L28 10 L40 10 L44 16 Z"
          fill="#0F1210"
          stroke="#9AA79D"
          strokeWidth="1.2"
          strokeOpacity="0.6"
        />
        {/* Lens Aperture Ring */}
        <circle cx="34" cy="35" r="12" stroke="#6B8F6E" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* Botanical Sprig Inset */}
        <path
          d="M34 41 C34 32, 28 30, 27 28 C32 28, 34 32, 34 35 C34 31, 38 29, 41 29 C39 33, 36 36, 34 41 Z"
          fill="#6B8F6E"
          fillOpacity="0.4"
          stroke="#6B8F6E"
          strokeWidth="1.2"
        />
        {/* Timestamp / Proof Indicator Dot */}
        <circle cx="48" cy="24" r="2" fill="#D98E4A" />
      </svg>
    </div>
  );
}

// 3. Pairings: Two linked comparison frames with alignment hash bracket
function PairingsIllustration() {
  return (
    <div className="w-24 h-24 rounded-2xl bg-ink/80 border border-mist/20 p-3 flex items-center justify-center shadow-lg relative">
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        {/* Left Frame (Before) */}
        <rect
          x="8"
          y="18"
          width="24"
          height="32"
          rx="5"
          fill="#171B18"
          stroke="#D98E4A"
          strokeWidth="1.4"
          strokeOpacity="0.8"
        />
        <line x1="14" y1="38" x2="26" y2="38" stroke="#D98E4A" strokeWidth="1.2" strokeOpacity="0.6" />
        <circle cx="16" cy="26" r="2" fill="#D98E4A" fillOpacity="0.6" />

        {/* Right Frame (After) */}
        <rect
          x="36"
          y="18"
          width="24"
          height="32"
          rx="5"
          fill="#171B18"
          stroke="#6B8F6E"
          strokeWidth="1.4"
          strokeOpacity="0.8"
        />
        <line x1="42" y1="38" x2="54" y2="38" stroke="#6B8F6E" strokeWidth="1.2" strokeOpacity="0.6" />
        <circle cx="44" cy="26" r="2" fill="#6B8F6E" fillOpacity="0.6" />

        {/* Central Cryptographic Temporal Link */}
        <path
          d="M30 34 L38 34"
          stroke="#F5F1E8"
          strokeWidth="1.5"
          strokeDasharray="2 2"
        />
        <path
          d="M36 31 L39 34 L36 37"
          stroke="#F5F1E8"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// 4. Reports: Editorial manuscript document with cryptographic seal
function ReportsIllustration() {
  return (
    <div className="w-24 h-24 rounded-2xl bg-ink/80 border border-mist/20 p-3 flex items-center justify-center shadow-lg relative">
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        {/* Sheet of Editorial Paper */}
        <rect
          x="16"
          y="10"
          width="36"
          height="48"
          rx="4"
          fill="#171B18"
          stroke="#9AA79D"
          strokeWidth="1.4"
          strokeOpacity="0.6"
        />
        {/* Editorial Text Lines */}
        <line x1="22" y1="20" x2="38" y2="20" stroke="#F5F1E8" strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="22" y1="26" x2="46" y2="26" stroke="#9AA79D" strokeWidth="1.2" strokeOpacity="0.4" />
        <line x1="22" y1="31" x2="44" y2="31" stroke="#9AA79D" strokeWidth="1.2" strokeOpacity="0.4" />
        <line x1="22" y1="36" x2="40" y2="36" stroke="#9AA79D" strokeWidth="1.2" strokeOpacity="0.4" />

        {/* Cryptographic Seal / Fingerprint */}
        <circle cx="42" cy="46" r="8" fill="#3F5A44" stroke="#6B8F6E" strokeWidth="1.5" />
        <circle cx="42" cy="46" r="4" stroke="#D98E4A" strokeWidth="1.2" />
        <path d="M42 42 L42 45" stroke="#D98E4A" strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// 5. Search: Scanning radar beam / provenance hash lookup
function SearchIllustration() {
  return (
    <div className="w-24 h-24 rounded-2xl bg-ink/80 border border-mist/20 p-3 flex items-center justify-center shadow-lg relative">
      <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
        {/* Radar Concentric Rings */}
        <circle cx="30" cy="30" r="20" stroke="#9AA79D" strokeWidth="1.2" strokeOpacity="0.3" strokeDasharray="3 3" />
        <circle cx="30" cy="30" r="13" stroke="#6B8F6E" strokeWidth="1.4" strokeOpacity="0.6" />
        <circle cx="30" cy="30" r="4" fill="#3F5A44" stroke="#6B8F6E" strokeWidth="1.5" />
        {/* Scanning Sweep */}
        <line x1="30" y1="30" x2="44" y2="16" stroke="#D98E4A" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="44" cy="16" r="2" fill="#D98E4A" />
        {/* Monospaced Query Nodes */}
        <line x1="44" y1="44" x2="58" y2="58" stroke="#9AA79D" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
