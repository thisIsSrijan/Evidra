"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";
import { ShieldCheckIcon, SatellitePinIcon, CloseIcon } from "@/components/Icons";

export interface LightboxAsset {
  _id: string;
  cloudinaryPublicId: string;
  cloudinaryVersion: string;
  resourceType: "image" | "video";
  phase: string;
  aiTags: string[];
  aiCaption?: string;
  geo?: { lat: number; lng: number };
  provenanceHash?: string;
  capturedAt?: string;
  createdAt: string;
  url: string;
  thumbnailUrl: string;
  matchReason?: string;
}

const PHASE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  before: { bg: "bg-clay/15", text: "text-clay", dot: "bg-clay" },
  after: { bg: "bg-moss/15", text: "text-moss-bright", dot: "bg-moss-bright" },
  progress: { bg: "bg-moss/10", text: "text-moss", dot: "bg-moss" },
  unclassified: { bg: "bg-mist/10", text: "text-mist", dot: "bg-mist" },
};

interface LightboxProps {
  assets: LightboxAsset[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ assets, initialIndex, onClose }: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const dragX = useMotionValue(0);
  const dragOpacity = useTransform(dragX, [-200, 0, 200], [0.5, 1, 0.5]);
  const containerRef = useRef<HTMLDivElement>(null);

  const goNext = useCallback(() => {
    if (currentIndex < assets.length - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, assets.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, goNext, goPrev]);

  // Handle swipe
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 80;
    if (info.offset.x < -threshold) {
      goNext();
    } else if (info.offset.x > threshold) {
      goPrev();
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.92,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.92,
    }),
  };

  const asset = assets[currentIndex];
  if (!asset) return null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-xl flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-mist">
            {currentIndex + 1} / {assets.length}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-sans ${
              PHASE_COLORS[asset.phase]?.bg || "bg-mist/10"
            } ${PHASE_COLORS[asset.phase]?.text || "text-mist"}`}
          >
            <span
              className={`w-1 h-1 rounded-full ${
                PHASE_COLORS[asset.phase]?.dot || "bg-mist"
              }`}
            />
            {asset.phase}
          </span>
        </div>

        <button
          onClick={onClose}
          className="w-9 h-9 rounded-lg bg-ink-soft/80 border border-mist/20 flex items-center justify-center text-mist hover:text-bone hover:border-mist/40 transition-colors cursor-pointer"
        >
          <CloseIcon size={18} />
        </button>
      </div>

      {/* Media area — swipeable */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev / Next arrows (desktop) */}
        {currentIndex > 0 && (
          <button
            onClick={goPrev}
            className="hidden sm:flex absolute left-4 z-10 w-10 h-10 rounded-full bg-ink-soft/60 border border-mist/20 items-center justify-center text-mist hover:text-bone transition-colors cursor-pointer backdrop-blur-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        {currentIndex < assets.length - 1 && (
          <button
            onClick={goNext}
            className="hidden sm:flex absolute right-4 z-10 w-10 h-10 rounded-full bg-ink-soft/60 border border-mist/20 items-center justify-center text-mist hover:text-bone transition-colors cursor-pointer backdrop-blur-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}

        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={asset._id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: BRAND_EASING }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.15}
            onDragEnd={handleDragEnd}
            style={{ x: dragX, opacity: dragOpacity }}
            className="w-full max-w-4xl max-h-[65vh] flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {asset.resourceType === "image" ? (
              <img
                src={asset.url}
                alt={asset.aiCaption || "Asset"}
                className="max-w-full max-h-[65vh] object-contain rounded-lg select-none pointer-events-none"
                draggable={false}
              />
            ) : (
              <video
                src={asset.url}
                controls
                playsInline
                className="max-w-full max-h-[65vh] object-contain rounded-lg"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom metadata panel */}
      <div
        className="shrink-0 max-h-[30vh] overflow-y-auto border-t border-mist/10 bg-ink-soft/50 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
          {/* Match reason chip */}
          {asset.matchReason && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-moss/15 border border-moss/25 text-xs text-moss-bright">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>{asset.matchReason}</span>
            </div>
          )}

          {/* Caption */}
          {asset.aiCaption && (
            <p className="font-sans text-sm text-bone leading-relaxed">
              {asset.aiCaption}
            </p>
          )}

          {/* Tags */}
          {asset.aiTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {asset.aiTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-moss/10 border border-moss/20 text-[10px] font-mono text-moss-bright"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Metadata row */}
          <div className="flex items-center gap-4 flex-wrap text-[10px] font-mono text-mist/70 pt-2 border-t border-mist/10">
            {asset.capturedAt && (
              <span>
                Captured: {new Date(asset.capturedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            {asset.geo && (
              <span className="inline-flex items-center gap-1">
                <SatellitePinIcon size={10} className="text-clay" />
                {asset.geo.lat.toFixed(4)}°, {asset.geo.lng.toFixed(4)}°
              </span>
            )}
            {asset.provenanceHash && (
              <span className="inline-flex items-center gap-1">
                <ShieldCheckIcon size={10} className="text-moss-bright" />
                {asset.provenanceHash.slice(0, 12)}…
              </span>
            )}
            <span className="text-mist/50">{asset.resourceType}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Lightbox;
