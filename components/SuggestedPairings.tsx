"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";
import { PairingData, PairingSlider } from "./PairingSlider";
import { ShieldCheckIcon } from "./Icons";
import { EmptyState } from "./EmptyState";

interface SuggestedPairingsProps {
  projectId?: string;
  pairings: PairingData[];
  onRefreshPairings?: () => Promise<void>;
  onStatusUpdate: (pairingId: string, status: "confirmed" | "rejected") => Promise<void>;
  isGenerating?: boolean;
  onGenerateClick?: () => void;
  onGenerateStoryFromPair?: (pairing: PairingData) => void;
}

export function SuggestedPairings({
  pairings,
  onStatusUpdate,
  isGenerating = false,
  onGenerateClick,
  onGenerateStoryFromPair,
}: SuggestedPairingsProps) {
  const [activeSliderPairing, setActiveSliderPairing] = useState<PairingData | null>(null);
  const [activeTab, setActiveTab] = useState<"suggested" | "confirmed">("suggested");
  const [processingId, setProcessingId] = useState<string | null>(null);

  const suggestedList = pairings.filter((p) => p.status === "suggested");
  const confirmedList = pairings.filter((p) => p.status === "confirmed");

  const displayedList = activeTab === "suggested" ? suggestedList : confirmedList;

  const handleAction = async (pairingId: string, status: "confirmed" | "rejected") => {
    setProcessingId(pairingId);
    try {
      await onStatusUpdate(pairingId, status);
      if (activeSliderPairing?._id === pairingId && status === "rejected") {
        setActiveSliderPairing(null);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (val?: string | Date) => {
    if (!val) return "";
    try {
      return new Date(val).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-mist/10">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl text-bone">
              Auto-Paired Before &amp; After Proof
            </h2>
            {suggestedList.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-clay/15 border border-clay/30 text-clay font-mono text-xs">
                {suggestedList.length} suggested
              </span>
            )}
          </div>
          <p className="font-sans text-xs sm:text-sm text-mist mt-1">
            Pillar 2: AI clustering &amp; Gemini reasoning auto-matches degraded baselines with restored states.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Selector */}
          <div className="flex items-center p-1 rounded-xl bg-ink-soft border border-mist/15 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveTab("suggested")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "suggested"
                  ? "bg-moss text-bone shadow-sm"
                  : "text-mist hover:text-bone"
              }`}
            >
              Suggested ({suggestedList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("confirmed")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "confirmed"
                  ? "bg-moss text-bone shadow-sm"
                  : "text-mist hover:text-bone"
              }`}
            >
              Confirmed ({confirmedList.length})
            </button>
          </div>

          {/* Trigger Auto-Pairing button */}
          {onGenerateClick && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={onGenerateClick}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ink-soft hover:bg-moss/20 border border-moss/40 text-moss-bright text-xs font-mono transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="animate-spin"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span>Gemini Pairing...</span>
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
                  </svg>
                  <span>Auto-Pair Clusters</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Suggested or Confirmed Cards Grid */}
      {displayedList.length === 0 ? (
        <EmptyState
          variant="pairings"
          title={
            activeTab === "suggested"
              ? "No pending pair suggestions"
              : "No confirmed before/after pairs yet"
          }
          description={
            activeTab === "suggested"
              ? "Upload field photos across different phases or trigger Gemini to scan spatial and temporal clusters for before/after alignments."
              : "Review suggested pairs above and tap 'Confirm' to lock them into your project's permanent chain of custody."
          }
          actionText={
            activeTab === "suggested" && onGenerateClick
              ? isGenerating
                ? "Analyzing Evidence..."
                : "Auto-Pair Clusters"
              : undefined
          }
          onAction={activeTab === "suggested" ? onGenerateClick : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AnimatePresence mode="popLayout">
            {displayedList.map((pairing) => {
              const confidencePct = pairing.confidence
                ? Math.round(pairing.confidence * 100)
                : 90;

              const before = pairing.beforeAsset;
              const after = pairing.afterAsset;
              const isWorking = processingId === pairing._id;

              return (
                <motion.div
                  key={pairing._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: BRAND_EASING }}
                  className="rounded-2xl bg-ink-soft border border-mist/20 overflow-hidden flex flex-col justify-between hover:border-moss/40 transition-colors shadow-lg"
                >
                  {/* Card top: Dual thumbnails preview */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-clay/15 border border-clay/30 text-clay font-mono text-[11px] font-medium">
                          {confidencePct}% AI Confidence
                        </span>
                        {pairing.status === "confirmed" && (
                          <span className="px-2 py-0.5 rounded-full bg-moss/20 border border-moss/40 text-moss-bright font-mono text-[10px] flex items-center gap-1">
                            <ShieldCheckIcon size={12} />
                            Verified
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveSliderPairing(pairing)}
                        className="text-xs text-moss-bright hover:text-bone font-mono flex items-center gap-1 transition-colors"
                      >
                        <span>Interactive Slider</span>
                        <span>→</span>
                      </button>
                    </div>

                    {/* Dual Thumbnail Comparison Row */}
                    <div
                      onClick={() => setActiveSliderPairing(pairing)}
                      className="grid grid-cols-2 gap-2 cursor-pointer group"
                    >
                      {/* Before Thumbnail */}
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-ink border border-clay/20 group-hover:border-clay/40 transition-colors">
                        {before?.thumbnailUrl ? (
                          <Image
                            src={before.thumbnailUrl}
                            alt={before.aiCaption || "Before"}
                            fill
                            sizes="(max-width: 600px) 50vw, 300px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-mist text-xs">
                            No preview
                          </div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-ink/80 backdrop-blur border border-clay/30 text-[9px] font-mono text-clay font-bold uppercase">
                          Before
                        </div>
                        {before?.capturedAt && (
                          <div className="absolute bottom-1.5 left-2 text-[9px] font-mono text-bone/90 bg-ink/70 px-1.5 py-0.5 rounded backdrop-blur">
                            {formatDate(before.capturedAt)}
                          </div>
                        )}
                      </div>

                      {/* After Thumbnail */}
                      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-ink border border-moss/30 group-hover:border-moss/50 transition-colors">
                        {after?.thumbnailUrl ? (
                          <Image
                            src={after.thumbnailUrl}
                            alt={after.aiCaption || "After"}
                            fill
                            sizes="(max-width: 600px) 50vw, 300px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-mist text-xs">
                            No preview
                          </div>
                        )}
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-ink/80 backdrop-blur border border-moss/40 text-[9px] font-mono text-moss-bright font-bold uppercase">
                          After
                        </div>
                        {after?.capturedAt && (
                          <div className="absolute bottom-1.5 right-2 text-[9px] font-mono text-bone/90 bg-ink/70 px-1.5 py-0.5 rounded backdrop-blur">
                            {formatDate(after.capturedAt)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gemini Reasoning Callout */}
                    {pairing.reasoning && (
                      <p className="font-sans text-xs text-bone/90 leading-relaxed italic border-l-2 border-moss/50 pl-2.5 my-1">
                        &ldquo;{pairing.reasoning}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Card bottom: Actions */}
                  <div className="p-3 bg-ink/40 border-t border-mist/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSliderPairing(pairing)}
                      className="px-3 py-1.5 rounded-lg border border-mist/20 text-xs font-mono text-mist hover:text-bone hover:border-mist/40 transition-colors"
                    >
                      Compare
                    </button>

                    {pairing.status === "suggested" ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => handleAction(pairing._id, "rejected")}
                          className="px-3 py-1.5 rounded-lg border border-mist/20 text-xs font-mono text-mist hover:text-clay hover:border-clay/40 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => handleAction(pairing._id, "confirmed")}
                          className="px-3.5 py-1.5 rounded-lg bg-moss hover:bg-moss-bright text-xs font-mono font-medium text-bone transition-colors disabled:opacity-50 shadow-sm"
                        >
                          {isWorking ? "Confirming..." : "Confirm Pair"}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {onGenerateStoryFromPair && (
                          <button
                            type="button"
                            onClick={() => onGenerateStoryFromPair(pairing)}
                            className="px-2.5 py-1 rounded-lg bg-clay/10 hover:bg-clay/20 border border-clay/30 text-clay hover:text-bone text-[11px] font-mono transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                              <path d="m12 2 2.4 7.4 7.6 2.6-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6L12 2Z" />
                            </svg>
                            <span>Generate Story</span>
                          </button>
                        )}
                        <span className="text-[11px] font-mono text-moss-bright hidden sm:inline">
                          Active in Proof Chain
                        </span>
                        <button
                          type="button"
                          disabled={isWorking}
                          onClick={() => handleAction(pairing._id, "rejected")}
                          className="px-2 py-1 text-[11px] font-mono text-mist hover:text-clay transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Fullscreen / Modal Comparison Slider */}
      <AnimatePresence>
        {activeSliderPairing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
            onClick={() => setActiveSliderPairing(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: BRAND_EASING }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-ink-soft rounded-3xl p-5 sm:p-6 border border-mist/25 shadow-2xl space-y-4"
            >
              <PairingSlider
                pairing={activeSliderPairing}
                onClose={() => setActiveSliderPairing(null)}
                onStatusChange={async (id, status) => {
                  await handleAction(id, status);
                  setActiveSliderPairing(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
