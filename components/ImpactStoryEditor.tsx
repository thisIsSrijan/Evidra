"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheckIcon, LeafIcon } from "@/components/Icons";

export interface ImpactStoryDraft {
  projectId: string;
  projectName: string;
  headline: string;
  subtitle: string;
  narrative: string;
  coverUrl: string;
  assetIds: string[];
  evidenceSummary?: Array<{
    recordNumber: number;
    phase: string;
    captureDate: string;
    aiCaption: string;
    tags: string[];
    coordinates: string;
    provenanceFingerprint: string;
  }>;
}

interface ImpactStoryEditorProps {
  draft: ImpactStoryDraft;
  onSave: (payload: {
    title: string;
    subtitle: string;
    narrative: string;
    coverUrl: string;
    assetIds: string[];
  }) => Promise<string | null>;
  onCancel: () => void;
  isSaving?: boolean;
}

export function ImpactStoryEditor({
  draft,
  onSave,
  onCancel,
  isSaving = false,
}: ImpactStoryEditorProps) {
  const [headline, setHeadline] = useState(draft.headline);
  const [subtitle, setSubtitle] = useState(draft.subtitle);
  const [narrative, setNarrative] = useState(draft.narrative);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const wordCount = narrative.trim() ? narrative.trim().split(/\s+/).length : 0;
  const paragraphCount = narrative
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0).length;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() || !narrative.trim()) return;

    const url = await onSave({
      title: headline.trim(),
      subtitle: subtitle.trim(),
      narrative: narrative.trim(),
      coverUrl: draft.coverUrl,
      assetIds: draft.assetIds,
    });

    if (url) {
      setPublishedUrl(url);
    }
  };

  return (
    <div className="rounded-3xl bg-ink-soft border border-mist/20 p-6 sm:p-8 space-y-8 shadow-2xl">
      {/* Editor Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-mist/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-clay animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-clay font-bold">
              Donor Report Studio
            </span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-bone mt-1 tracking-tight">
            Review &amp; Refine Impact Story
          </h2>
          <p className="font-sans text-xs text-mist mt-1 max-w-xl">
            Edit the AI-synthesized draft below before publishing. The narrative is strictly anchored to the {draft.assetIds.length} verified evidence records selected.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl border border-mist/20 text-xs font-mono text-mist hover:text-bone hover:border-mist/40 transition-colors disabled:opacity-50"
          >
            Cancel Draft
          </button>
          {!publishedUrl && (
            <button
              type="button"
              disabled={isSaving || !headline.trim() || !narrative.trim()}
              onClick={handlePublish}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-moss hover:bg-moss-bright text-xs font-mono font-medium text-bone shadow-md transition-all disabled:opacity-50"
            >
              {isSaving ? (
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
                  <span>Publishing Report…</span>
                </>
              ) : (
                <>
                  <LeafIcon size={14} />
                  <span>Publish &amp; Share Story</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Published Success Alert */}
      {publishedUrl && (
        <div className="p-5 rounded-2xl bg-moss/20 border border-moss/40 text-bone space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-moss-bright uppercase tracking-wider font-bold inline-flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Impact Story Published Successfully</span>
            </span>
            <span className="text-[11px] font-mono text-mist">
              Public Link Ready
            </span>
          </div>
          <p className="text-sm font-sans text-bone">
            Your report is live and accessible to donors, auditors, and grant evaluators.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={publishedUrl}
              target="_blank"
              className="px-4 py-2 rounded-xl bg-moss text-bone text-xs font-mono font-medium hover:bg-moss-bright transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <span>View Public Report</span>
              <span>↗</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  navigator.clipboard.writeText(
                    window.location.origin + publishedUrl
                  );
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-ink-soft border border-mist/20 text-xs font-mono text-mist hover:text-bone transition-colors"
            >
              Copy Public Share Link
            </button>
          </div>
        </div>
      )}

      {/* Visual Cover Asset Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-mist uppercase tracking-widest text-[11px]">
            Cloudinary Composite Cover Collage
          </span>
          <span className="text-[10px] font-mono text-moss-bright">
            Auto-Assembled Transformation (1200×630)
          </span>
        </div>

        {draft.coverUrl ? (
          <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden bg-ink border border-mist/20 shadow-xl">
            <Image
              src={draft.coverUrl}
              alt="Assembled Report Cover Collage"
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
              priority
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-ink/80 backdrop-blur border border-mist/30 text-[10px] font-mono text-bone font-medium">
              Cover Visual
            </div>
            <a
              href={draft.coverUrl}
              target="_blank"
              rel="noopener noreferrer"
              download="evidra-impact-cover.jpg"
              className="absolute bottom-3 right-3 px-3 py-1.5 rounded-lg bg-ink/80 backdrop-blur border border-mist/30 text-[10px] font-mono text-bone hover:text-clay transition-colors flex items-center gap-1.5 shadow"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download Cover Image</span>
            </a>
          </div>
        ) : (
          <div className="w-full aspect-[2/1] rounded-2xl bg-ink border border-mist/20 flex items-center justify-center text-xs text-mist font-mono">
            No cover image available
          </div>
        )}
      </div>

      {/* Editable Content Fields */}
      <form onSubmit={handlePublish} className="space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <label className="block font-mono text-[11px] text-mist uppercase tracking-widest">
            Report Title / Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Headline summarizing ecological impact..."
            className="w-full px-4 py-3 rounded-xl bg-ink border border-mist/20 font-display text-xl sm:text-2xl text-bone placeholder:text-mist/40 focus:outline-none focus:border-moss focus:ring-1 focus:ring-moss/30 transition-all"
          />
        </div>

        {/* Subtitle Field */}
        <div className="space-y-2">
          <label className="block font-mono text-[11px] text-mist uppercase tracking-widest">
            Executive Summary / Subtitle
          </label>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="One-line summary for institutional review..."
            className="w-full px-4 py-2.5 rounded-xl bg-ink border border-mist/20 font-sans text-sm text-mist placeholder:text-mist/40 focus:outline-none focus:border-moss focus:ring-1 focus:ring-moss/30 transition-all"
          />
        </div>

        {/* Narrative Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block font-mono text-[11px] text-mist uppercase tracking-widest">
              Donor Narrative (Factual &amp; Metadata-Anchored)
            </label>
            <div className="flex items-center gap-3 text-[10px] font-mono text-mist/60">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{paragraphCount} paragraphs</span>
            </div>
          </div>
          <textarea
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            rows={10}
            placeholder="Write or edit the 2-3 paragraph report..."
            className="w-full p-4 rounded-2xl bg-ink border border-mist/20 font-sans text-sm text-bone/90 leading-relaxed placeholder:text-mist/40 focus:outline-none focus:border-moss focus:ring-1 focus:ring-moss/30 transition-all resize-y"
          />
        </div>

        {/* Selected Evidence Records Strip */}
        <div className="space-y-3 pt-4 border-t border-mist/10">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-mist">
              Source Evidence Strip ({draft.assetIds.length} Verified Records)
            </span>
            <span className="text-[10px] font-mono text-moss-bright flex items-center gap-1">
              <ShieldCheckIcon size={12} />
              <span>Immutable Chain Verified</span>
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {draft.evidenceSummary ? (
              draft.evidenceSummary.map((item, idx) => (
                <div
                  key={idx}
                  className="shrink-0 p-3 rounded-xl bg-ink border border-mist/15 text-xs space-y-1 min-w-[200px]"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-clay font-bold uppercase">
                      #{item.recordNumber} • {item.phase}
                    </span>
                    <span className="text-mist">{item.captureDate}</span>
                  </div>
                  <p className="text-[11px] text-bone/80 truncate">
                    {item.aiCaption}
                  </p>
                  <div className="pt-1 text-[9px] font-mono text-moss-bright">
                    {item.provenanceFingerprint}
                  </div>
                </div>
              ))
            ) : (
              <span className="text-xs text-mist font-mono">
                {draft.assetIds.length} assets attached
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-mist/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl border border-mist/20 text-xs font-mono text-mist hover:text-bone transition-colors"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={isSaving || !headline.trim() || !narrative.trim()}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-moss hover:bg-moss-bright text-xs font-mono font-medium text-bone shadow-md transition-all disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save & Publish Impact Story"}
          </button>
        </div>
      </form>
    </div>
  );
}
