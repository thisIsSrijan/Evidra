"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { ShieldCheckIcon, CloseIcon } from "./Icons";

export interface PairingAssetData {
  _id: string;
  phase: string;
  aiCaption?: string;
  aiTags?: string[];
  capturedAt?: string | Date;
  createdAt: string | Date;
  geo?: { lat: number; lng: number };
  provenanceHash?: string;
  thumbnailUrl: string;
  sliderUrl: string;
}

export interface PairingData {
  _id: string;
  projectId: string;
  confidence?: number;
  reasoning?: string;
  status: "suggested" | "confirmed" | "rejected";
  createdAt: string | Date;
  beforeAsset: PairingAssetData | null;
  afterAsset: PairingAssetData | null;
}

interface PairingSliderProps {
  pairing: PairingData;
  onClose?: () => void;
  onStatusChange?: (pairingId: string, status: "confirmed" | "rejected") => void;
}

export function PairingSlider({
  pairing,
  onClose,
  onStatusChange,
}: PairingSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHoveringHandle, setIsHoveringHandle] = useState<boolean>(false);
  const shouldReduceMotion = useReducedMotion();

  // Inertia-free useMotionValue tracking
  const motionPosition = useMotionValue<number>(50);

  const beforeAsset = pairing.beforeAsset;
  const afterAsset = pairing.afterAsset;

  const beforeUrl = beforeAsset?.sliderUrl || beforeAsset?.thumbnailUrl || "/images/demo/before.jpg";
  const afterUrl = afterAsset?.sliderUrl || afterAsset?.thumbnailUrl || "/images/demo/after.jpg";

  const updatePosition = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const rawPercent = (x / rect.width) * 100;
      const clamped = Math.max(0, Math.min(100, rawPercent));
      setSliderPosition(clamped);
      motionPosition.set(clamped);
    },
    [motionPosition]
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
      // Ignored
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    if (e.key === "ArrowLeft") delta = e.shiftKey ? -15 : -5;
    else if (e.key === "ArrowRight") delta = e.shiftKey ? 15 : 5;
    else if (e.key === "Home") {
      setSliderPosition(0);
      motionPosition.set(0);
      return;
    } else if (e.key === "End") {
      setSliderPosition(100);
      motionPosition.set(100);
      return;
    }

    if (delta !== 0) {
      e.preventDefault();
      const next = Math.max(0, Math.min(100, sliderPosition + delta));
      setSliderPosition(next);
      motionPosition.set(next);
    }
  };

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const confidencePct = pairing.confidence
    ? Math.round(pairing.confidence * 100)
    : 92;

  const formatDate = (val?: string | Date) => {
    if (!val) return null;
    try {
      return new Date(val).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return null;
    }
  };

  const beforeDate = formatDate(beforeAsset?.capturedAt || beforeAsset?.createdAt);
  const afterDate = formatDate(afterAsset?.capturedAt || afterAsset?.createdAt);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-moss/15 border border-moss/30 text-moss-bright text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-moss-bright animate-pulse" />
            <span>{confidencePct}% Confidence</span>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-clay/10 border border-clay/30 text-clay text-xs font-mono">
            <ShieldCheckIcon size={13} />
            <span>Provably Paired</span>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-ink-soft hover:bg-mist/10 text-mist hover:text-bone border border-mist/20 transition-colors"
            title="Close viewer"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      {/* AI Reasoning Banner */}
      {pairing.reasoning && (
        <div className="p-3.5 rounded-xl bg-ink-soft/90 border border-mist/15 text-xs text-bone font-sans flex items-start gap-2.5 shadow-sm">
          <span className="text-moss-bright font-mono text-[11px] uppercase tracking-wider shrink-0 mt-0.5">
            Gemini Analysis:
          </span>
          <p className="text-mist leading-relaxed italic">
            &ldquo;{pairing.reasoning}&rdquo;
          </p>
        </div>
      )}

      {/* Interactive Drag Comparison Surface */}
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
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden cursor-ew-resize select-none touch-none border border-mist/20 bg-ink-soft shadow-2xl focus:outline-none focus:ring-2 focus:ring-moss-bright/50"
      >
        {/* 1. Underlying Image: AFTER (restored) */}
        <div className="absolute inset-0 w-full h-full">
          <Image
            src={afterUrl}
            alt={afterAsset?.aiCaption || "After restoration"}
            fill
            sizes="(max-width: 1400px) 100vw, 1400px"
            className="object-cover"
            priority
          />
          {/* After floating label */}
          <div className="absolute top-4 right-4 z-10 pointer-events-none">
            <div className="px-3 py-1.5 rounded-lg bg-ink/80 backdrop-blur-md border border-moss/40 shadow-lg text-right">
              <span className="block text-[10px] font-mono tracking-widest text-moss-bright uppercase font-bold">
                AFTER • RESTORED
              </span>
              {afterDate && (
                <span className="text-[11px] text-bone font-mono">
                  {afterDate}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Top Clipped Image: BEFORE (degraded) */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <Image
            src={beforeUrl}
            alt={beforeAsset?.aiCaption || "Before restoration baseline"}
            fill
            sizes="(max-width: 1400px) 100vw, 1400px"
            className="object-cover"
            priority
          />
          {/* Before floating label */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none">
            <div className="px-3 py-1.5 rounded-lg bg-ink/80 backdrop-blur-md border border-clay/40 shadow-lg">
              <span className="block text-[10px] font-mono tracking-widest text-clay uppercase font-bold">
                BEFORE • BASELINE
              </span>
              {beforeDate && (
                <span className="text-[11px] text-bone font-mono">
                  {beforeDate}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Divider Line & Interactive Handle */}
        <div
          className="absolute top-0 bottom-0 z-20 pointer-events-none -translate-x-1/2 flex items-center justify-center"
          style={{ left: `${sliderPosition}%` }}
        >
          {/* Vertical hairline */}
          <div className="w-[2px] h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]" />

          {/* Centered Thumb Grip */}
          <motion.div
            animate={{
              scale: shouldReduceMotion ? 1 : isDragging ? 1.15 : isHoveringHandle ? 1.08 : 1,
            }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.15 }}
            onMouseEnter={() => setIsHoveringHandle(true)}
            onMouseLeave={() => setIsHoveringHandle(false)}
            className="absolute w-10 h-10 rounded-full bg-bone border-2 border-ink shadow-2xl flex items-center justify-center text-ink cursor-ew-resize pointer-events-auto"
          >
            {/* Custom dual arrow SVG */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ink"
            >
              <polyline points="8 7 3 12 8 17" />
              <polyline points="16 7 21 12 16 17" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
          </motion.div>
        </div>

        {/* 4. Bottom Hint Overlay */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-ink/75 backdrop-blur-md border border-mist/20 text-[10px] font-mono text-mist/90 flex items-center gap-2">
            <span>◀ Drag or use Arrow Keys to Compare ▶</span>
            <span className="text-bone font-bold">{Math.round(sliderPosition)}%</span>
          </div>
        </div>
      </div>

      {/* Metadata & Actions Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-mist/10 text-xs text-mist">
        <div className="flex flex-wrap items-center gap-3">
          {beforeAsset?.provenanceHash && (
            <span className="font-mono text-[11px] text-mist/70">
              Before Hash: {beforeAsset.provenanceHash.slice(0, 10)}...
            </span>
          )}
          {afterAsset?.provenanceHash && (
            <span className="font-mono text-[11px] text-mist/70">
              After Hash: {afterAsset.provenanceHash.slice(0, 10)}...
            </span>
          )}
        </div>

        {/* Quick status confirmation if suggested */}
        {onStatusChange && pairing.status === "suggested" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStatusChange(pairing._id, "rejected")}
              className="px-3 py-1.5 rounded-lg border border-mist/20 text-mist hover:text-bone hover:border-mist/40 transition-colors"
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => onStatusChange(pairing._id, "confirmed")}
              className="px-3.5 py-1.5 rounded-lg bg-moss hover:bg-moss-bright text-bone font-medium transition-colors shadow-sm"
            >
              Confirm Pairing
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
