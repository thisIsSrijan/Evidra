"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";
import { ShieldCheckIcon } from "@/components/Icons";
import { Lightbox, LightboxAsset } from "@/components/Lightbox";

export interface AssetItem {
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

interface AssetGridProps {
  assets: AssetItem[];
  filterPhase?: string;
}

const PHASE_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  before: { bg: "bg-clay/15", text: "text-clay", dot: "bg-clay" },
  after: { bg: "bg-moss/15", text: "text-moss-bright", dot: "bg-moss-bright" },
  progress: { bg: "bg-moss/10", text: "text-moss", dot: "bg-moss" },
  unclassified: { bg: "bg-mist/10", text: "text-mist", dot: "bg-mist" },
};

/**
 * Single asset card with scroll-triggered reveal animation.
 */
function AssetCard({
  asset,
  index,
  onClick,
}: {
  asset: AssetItem;
  index: number;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  // Alternate card heights for masonry-like feel: every 3rd & 5th card is taller
  const isTall = index % 5 === 0 || index % 7 === 2;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 24, scale: 0.96 }
      }
      transition={{
        duration: 0.5,
        delay: (index % 6) * 0.06,
        ease: BRAND_EASING,
      }}
      onClick={onClick}
      className={`group relative rounded-xl overflow-hidden cursor-pointer bg-ink-soft border border-mist/10 hover:border-moss/40 transition-colors ${
        isTall ? "row-span-2" : ""
      }`}
    >
      {/* Thumbnail */}
      {asset.resourceType === "image" ? (
        <img
          src={asset.thumbnailUrl}
          alt={asset.aiCaption || "Uploaded asset"}
          className="w-full h-full object-cover transition-transform duration-500 ease-brand group-hover:scale-[1.04]"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full relative bg-ink">
          <video
            src={asset.url}
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-ink/70 border border-mist/30 flex items-center justify-center backdrop-blur-sm">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-bone ml-0.5"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Phase badge */}
      <div className="absolute top-2 left-2">
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-mono backdrop-blur-sm ${
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

      {/* Provenance indicator */}
      {asset.provenanceHash && (
        <div className="absolute top-2 right-2">
          <div className="w-5 h-5 rounded-md bg-ink/60 backdrop-blur-sm flex items-center justify-center">
            <ShieldCheckIcon size={12} className="text-moss-bright" />
          </div>
        </div>
      )}

      {/* Match reason chip */}
      {asset.matchReason && (
        <div className="absolute bottom-12 left-2 right-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-moss/20 border border-moss/30 text-[9px] font-sans text-moss-bright backdrop-blur-sm max-w-full">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="shrink-0"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="truncate">{asset.matchReason}</span>
          </span>
        </div>
      )}

      {/* Hover overlay with metadata */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/50 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {asset.aiCaption && (
          <p className="font-sans text-[10px] text-bone/90 line-clamp-2 mb-1">
            {asset.aiCaption}
          </p>
        )}
        {asset.aiTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {asset.aiTags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 rounded bg-mist/15 text-[8px] font-mono text-mist"
              >
                {tag}
              </span>
            ))}
            {asset.aiTags.length > 3 && (
              <span className="text-[8px] font-mono text-mist/60">
                +{asset.aiTags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AssetGrid({ assets, filterPhase }: AssetGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredAssets =
    filterPhase && filterPhase !== "all"
      ? assets.filter((a) => a.phase === filterPhase)
      : assets;

  // Close lightbox callback
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  if (filteredAssets.length === 0) {
    return (
      <div className="py-12 px-6 rounded-2xl bg-ink-soft border border-mist/10 text-center">
        <p className="font-sans text-mist text-xs">
          {filterPhase && filterPhase !== "all"
            ? `No "${filterPhase}" assets uploaded yet.`
            : "No media uploaded yet. Use the upload zone above to ingest field media."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Asset Count */}
      <div className="flex items-center gap-2 mb-4">
        <span className="font-mono text-[11px] text-mist">
          {filteredAssets.length} asset{filteredAssets.length !== 1 ? "s" : ""}
        </span>
        {filterPhase && filterPhase !== "all" && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-sans ${
              PHASE_COLORS[filterPhase]?.bg || "bg-mist/10"
            } ${PHASE_COLORS[filterPhase]?.text || "text-mist"}`}
          >
            <span
              className={`w-1 h-1 rounded-full ${
                PHASE_COLORS[filterPhase]?.dot || "bg-mist"
              }`}
            />
            {filterPhase}
          </span>
        )}
      </div>

      {/* CSS Grid Masonry — 2 cols mobile, 3 sm, 4 md+ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 auto-rows-[180px] sm:auto-rows-[200px] md:auto-rows-[220px]">
        {filteredAssets.map((asset, index) => (
          <AssetCard
            key={asset._id}
            asset={asset}
            index={index}
            onClick={() => setLightboxIndex(index)}
          />
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            assets={filteredAssets as LightboxAsset[]}
            initialIndex={lightboxIndex}
            onClose={closeLightbox}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default AssetGrid;
