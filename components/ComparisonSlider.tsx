"use client";

import React, { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { SlidersIcon, ShieldCheckIcon } from "./Icons";
import { BRAND_EASING } from "@/lib/motion";

interface ComparisonSliderProps {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  projectName?: string;
  locationLabel?: string;
}

export function ComparisonSlider({
  beforeImage = "/images/demo/before.jpg",
  afterImage = "/images/demo/after.jpg",
  beforeLabel = "OCT 2021 — Baseline Degraded Land",
  afterLabel = "SEP 2026 — Verified Restored Canopy",
  projectName = "Tsavo Basin Reforestation #04",
  locationLabel = "3°18'S, 38°34'E • Kenya",
}: ComparisonSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  // Framer Motion useMotionValue for the handle drag percentage
  const motionPercent = useMotionValue<number>(50);

  const updatePosition = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const rawPercent = (x / rect.width) * 100;
      const clampedPercent = Math.max(0, Math.min(100, rawPercent));
      setSliderPosition(clampedPercent);
      motionPercent.set(clampedPercent);
    },
    [motionPercent]
  );

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updatePosition(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updatePosition(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if capture already lost
    }
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      const next = Math.max(0, sliderPosition - 5);
      setSliderPosition(next);
      motionPercent.set(next);
    } else if (e.key === "ArrowRight") {
      const next = Math.min(100, sliderPosition + 5);
      setSliderPosition(next);
      motionPercent.set(next);
    }
  };

  return (
    <section id="demo" className="py-24 md:py-36 px-6 bg-ink border-t border-mist/10">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-clay/30 bg-clay/10 text-xs text-clay font-medium mb-3">
              <ShieldCheckIcon size={14} />
              <span>Interactive Verification Demo</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-bone tracking-tight">
              Auto-Paired Before &amp; After Proof
            </h2>
            <p className="font-sans text-mist text-base sm:text-lg mt-2 max-w-2xl">
              Drag the slider to inspect 5-year vegetative restoration. Every coordinate and pixel transformation is cryptographically bound to the provenance chain.
            </p>
          </div>

          {/* Project telemetry tag */}
          <div className="flex flex-col items-start md:items-end text-xs font-sans text-mist bg-ink-soft p-4 rounded-xl border border-mist/15">
            <span className="text-bone font-medium">{projectName}</span>
            <span className="font-mono text-mist/80 mt-0.5">{locationLabel}</span>
            <span className="text-moss-bright text-[11px] font-mono mt-1">Status: Authenticated (Chain #0x4f8e...7b)</span>
          </div>
        </div>

        {/* Revealed Container */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: BRAND_EASING }}
          className="relative rounded-2xl overflow-hidden border border-mist/20 shadow-2xl bg-ink-soft select-none"
        >
          {/* Main Slider Touch/Mouse Surface */}
          <div
            ref={containerRef}
            tabIndex={0}
            role="slider"
            aria-label="Before and after comparison slider"
            aria-valuenow={Math.round(sliderPosition)}
            aria-valuemin={0}
            aria-valuemax={100}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onKeyDown={handleKeyDown}
            className="relative w-full aspect-[16/10] sm:aspect-[16/9] cursor-ew-resize overflow-hidden touch-none focus:outline-none focus:ring-2 focus:ring-moss-bright/50"
          >
            {/* 1. Underlying Image: AFTER (Restored forest) */}
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={afterImage}
                alt="After restoration - thriving green forest canopy"
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
              />
              {/* After Info Overlay */}
              <div className="absolute bottom-4 right-4 z-10 px-3.5 py-2 rounded-lg bg-ink/80 backdrop-blur-md border border-moss/40 text-right pointer-events-none">
                <span className="block text-[10px] tracking-widest font-mono text-moss-bright uppercase">
                  AFTER • RESTORATION VERIFIED
                </span>
                <span className="text-xs text-bone font-medium">
                  {afterLabel}
                </span>
              </div>
            </div>

            {/* 2. Top Image: BEFORE (Degraded land) clipped horizontally using sliderPosition */}
            <div
              style={{
                clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                WebkitClipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
              }}
              className="absolute inset-0 w-full h-full pointer-events-none transition-none"
            >
              <Image
                src={beforeImage}
                alt="Before restoration - degraded barren land"
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
              />
              {/* Before Info Overlay */}
              <div className="absolute bottom-4 left-4 z-10 px-3.5 py-2 rounded-lg bg-ink/80 backdrop-blur-md border border-clay/40 text-left pointer-events-none">
                <span className="block text-[10px] tracking-widest font-mono text-clay uppercase">
                  BEFORE • BASELINE INGESTION
                </span>
                <span className="text-xs text-bone font-medium">
                  {beforeLabel}
                </span>
              </div>
            </div>

            {/* 3. Drag Divider Handle */}
            <div
              style={{ left: `${sliderPosition}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-bone pointer-events-none z-20 shadow-[0_0_12px_rgba(0,0,0,0.8)] -translate-x-1/2"
            >
              {/* Center thumb handle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-ink border-2 border-bone text-bone shadow-2xl flex items-center justify-center pointer-events-none transition-transform duration-150">
                <SlidersIcon size={18} className="text-bone" />
              </div>
            </div>
          </div>

          {/* Bottom Provenance Audit Bar */}
          <div className="px-6 py-4 bg-ink-soft border-t border-mist/15 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-mist">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-clay" />
              <span>SHA-256: 7f8a9b2c3d4e5f6a1b2c3d4e5f6a7b8c9d0e1f2a</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Cloudinary Version: v1727488000</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-bone">Chain Integrity: 100% Unaltered</span>
            </div>
          </div>
        </motion.div>

        {/* Drag Hint */}
        <p className="text-center font-sans text-xs text-mist/70 mt-4">
          Click or drag across the image to explore the before &amp; after transformation
        </p>
      </div>
    </section>
  );
}
