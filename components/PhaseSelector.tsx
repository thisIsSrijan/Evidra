"use client";

import React from "react";
import { motion } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";

const PHASES = [
  { key: "unclassified", label: "Unclassified", color: "#9AA79D" },
  { key: "before", label: "Before", color: "#D98E4A" },
  { key: "progress", label: "Progress", color: "#6B8F6E" },
  { key: "after", label: "After", color: "#3F5A44" },
] as const;

interface PhaseSelectorProps {
  value: string;
  onChange: (phase: string) => void;
}

export function PhaseSelector({ value, onChange }: PhaseSelectorProps) {
  return (
    <div className="inline-flex items-center bg-ink-soft rounded-xl border border-mist/15 p-1 gap-0.5">
      {PHASES.map((phase) => {
        const isActive = value === phase.key;

        return (
          <button
            key={phase.key}
            type="button"
            onClick={() => onChange(phase.key)}
            className="relative px-3.5 py-2 rounded-lg font-sans text-xs font-medium transition-colors duration-200 cursor-pointer select-none"
            style={{
              color: isActive ? "#F5F1E8" : "#9AA79D",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="phase-pill"
                className="absolute inset-0 rounded-lg"
                style={{ backgroundColor: "rgba(63, 90, 68, 0.4)" }}
                transition={{
                  type: "spring",
                  bounce: 0.15,
                  duration: 0.5,
                  ease: BRAND_EASING,
                }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full transition-colors"
                style={{
                  backgroundColor: isActive ? phase.color : "rgba(154, 167, 157, 0.3)",
                }}
              />
              {phase.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default PhaseSelector;
