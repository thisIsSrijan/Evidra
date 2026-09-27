"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheckIcon, SatellitePinIcon } from "@/components/Icons";
import { EmptyState } from "@/components/EmptyState";

interface ReportItem {
  _id: string;
  title: string;
  subtitle?: string;
  narrative: string;
  coverUrl?: string;
  shareSlug: string;
  createdAt: string;
  projectName: string;
  projectLocation?: { lat: number; lng: number; label: string } | null;
  assetCount: number;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/reports");
        if (res.ok) {
          const data = await res.json();
          setReports(data.reports || []);
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    }
    fetchReports();
  }, []);

  const handleCopyLink = (shareSlug: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/reports/${shareSlug}`);
      setCopiedSlug(shareSlug);
      setTimeout(() => setCopiedSlug(null), 2500);
    }
  };

  const formatDate = (val: string) => {
    try {
      return new Date(val).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return val;
    }
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-mist/10">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl text-bone tracking-tight">
            Impact Reports &amp; Stories
          </h1>
          <p className="font-sans text-mist text-sm mt-1">
            Pillar 3: Donor-ready narratives synthesized by Gemini with Cloudinary dynamic composite covers.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="px-4 py-2 rounded-xl bg-moss hover:bg-moss-bright text-bone text-xs font-mono font-medium transition-colors shadow-sm self-start sm:self-auto"
        >
          View Projects to Author Stories
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-mist/5 border border-mist/10" />
          ))}
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          variant="reports"
          title="No Impact Stories Authored Yet"
          description="Open any of your conservation projects, select field evidence or a verified Before & After pair, and click 'Generate Impact Story' to generate institutional donor reports."
          actionText="Go to Projects"
          actionHref="/dashboard"
          actionIcon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((rep) => (
            <div
              key={rep._id}
              className="rounded-3xl bg-ink-soft border border-mist/20 overflow-hidden flex flex-col justify-between hover:border-moss/40 transition-colors shadow-xl group"
            >
              {/* Cover visual */}
              {rep.coverUrl ? (
                <div className="relative aspect-[16/9] bg-ink overflow-hidden">
                  <Image
                    src={rep.coverUrl}
                    alt={rep.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-ink/80 backdrop-blur border border-mist/30 text-[10px] font-mono text-bone font-medium">
                    Cover Collage
                  </div>
                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-ink/80 backdrop-blur border border-mist/20 text-[10px] font-mono text-mist flex items-center gap-1">
                    <ShieldCheckIcon size={12} className="text-moss-bright" />
                    <span>{rep.assetCount} Verified Records</span>
                  </div>
                </div>
              ) : (
                <div className="aspect-[16/9] bg-ink flex items-center justify-center text-xs font-mono text-mist">
                  No cover preview
                </div>
              )}

              {/* Card Body */}
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-mist">
                    <span className="text-clay font-medium">{rep.projectName}</span>
                    <span>{formatDate(rep.createdAt)}</span>
                  </div>
                  <h3 className="font-display text-2xl text-bone leading-tight group-hover:text-moss-bright transition-colors">
                    {rep.title}
                  </h3>
                  {rep.subtitle && (
                    <p className="font-sans text-xs text-mist line-clamp-2 leading-relaxed">
                      {rep.subtitle}
                    </p>
                  )}
                  {rep.projectLocation?.label && (
                    <div className="flex items-center gap-1 text-[11px] font-mono text-mist/70 pt-1">
                      <SatellitePinIcon size={11} className="text-clay" />
                      <span>{rep.projectLocation.label}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-mist/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleCopyLink(rep.shareSlug)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-mist hover:text-bone transition-colors"
                  >
                    {copiedSlug === rep.shareSlug ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-moss-bright">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-moss-bright">Link Copied</span>
                      </>
                    ) : (
                      <span>Copy Share Link</span>
                    )}
                  </button>

                  <Link
                    href={`/reports/${rep.shareSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-moss hover:bg-moss-bright text-xs font-mono font-medium text-bone transition-colors shadow-sm"
                  >
                    <span>View Public Report</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M7 17L17 7M7 7h10v10" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
