"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheckIcon,
  SatellitePinIcon,
  LeafIcon,
} from "@/components/Icons";

interface VerifiedEvidenceRecord {
  _id: string;
  cloudinaryPublicId: string;
  cloudinaryVersion: string;
  resourceType: "image" | "video";
  phase: string;
  aiCaption?: string;
  aiTags: string[];
  capturedAt?: string | null;
  createdAt: string;
  provenanceHash?: string | null;
  verifyUrl: string;
  thumbnailUrl: string;
}

interface ReportDetail {
  _id: string;
  title: string;
  subtitle?: string;
  narrative: string;
  coverUrl?: string;
  shareSlug: string;
  createdAt: string;
  uploaderOrg: string;
  project?: {
    _id: string;
    name: string;
    location?: { lat: number; lng: number; label: string } | null;
  } | null;
  evidenceRecords: VerifiedEvidenceRecord[];
}

export default function PublicReportPage() {
  const params = useParams();
  const shareSlug = params.shareSlug as string;

  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function fetchReport() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/reports/${shareSlug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("This impact report could not be found.");
            return;
          }
          throw new Error("Failed to load impact report.");
        }
        const data = await res.json();
        setReport(data.report);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while loading this report."
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (shareSlug) {
      fetchReport();
    }
  }, [shareSlug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const formatDate = (val?: string | null) => {
    if (!val) return "";
    try {
      return new Date(val).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return String(val);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ink text-bone font-sans flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4 text-center">
          <div className="w-10 h-10 mx-auto rounded-full border-2 border-mist/20 border-t-clay animate-spin" />
          <p className="font-mono text-xs text-mist tracking-wider uppercase">
            Loading Verified Impact Report &amp; Evidence Strip…
          </p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-ink text-bone font-sans flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-ink-soft border border-mist/20 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-clay/10 border border-clay/30 flex items-center justify-center text-clay">
            <ShieldCheckIcon size={24} />
          </div>
          <h1 className="font-display text-2xl text-bone">Report Not Found</h1>
          <p className="text-mist text-xs leading-relaxed">{error}</p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-4 py-2 rounded-xl bg-ink hover:bg-mist/10 text-mist hover:text-bone text-xs font-mono border border-mist/20 transition-colors"
            >
              ← Return to Evidra
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const paragraphs = report.narrative
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-ink text-bone font-sans antialiased selection:bg-clay/30 selection:text-bone">
      {/* Editorial Navigation Header */}
      <header className="border-b border-mist/10 bg-ink/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-opacity hover:opacity-80"
            >
              <div className="w-7 h-7 rounded-lg bg-moss/20 border border-moss/40 flex items-center justify-center text-moss-bright">
                <LeafIcon size={16} />
              </div>
              <span className="font-display text-lg tracking-tight text-bone">
                Evidra
              </span>
            </Link>
            <span className="text-mist/40 text-xs">/</span>
            <span className="font-mono text-xs text-mist uppercase tracking-widest hidden sm:inline">
              Verified Impact Story
            </span>
          </div>

          <div className="flex items-center gap-3">
            {report.coverUrl && (
              <a
                href={report.coverUrl}
                target="_blank"
                rel="noopener noreferrer"
                download="impact-report-cover.jpg"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink-soft hover:bg-mist/10 border border-mist/20 text-xs font-mono text-mist hover:text-bone transition-all"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Download Cover</span>
              </a>
            )}

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-moss hover:bg-moss-bright border border-moss-bright/30 text-xs font-mono text-bone transition-all shadow-sm"
            >
              {copiedLink ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Link Copied</span>
                </>
              ) : (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <span>Share Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Editorial Article */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-16 space-y-12">
        {/* Article Meta Bar */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-mist">
            <span className="px-2.5 py-1 rounded-full bg-clay/15 border border-clay/30 text-clay font-medium">
              Verified Donor Report
            </span>
            <span>•</span>
            <span className="text-bone font-medium">{report.uploaderOrg}</span>
            <span>•</span>
            <span>{formatDate(report.createdAt)}</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl text-bone tracking-tight leading-[1.1]">
            {report.title}
          </h1>

          {report.subtitle && (
            <p className="font-sans text-base sm:text-lg text-mist max-w-3xl leading-relaxed">
              {report.subtitle}
            </p>
          )}

          {report.project && (
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-mist/80 pt-2 border-t border-mist/10">
              <span className="text-bone font-medium">
                {report.project.name}
              </span>
              {report.project.location?.label && (
                <span className="flex items-center gap-1">
                  <SatellitePinIcon size={12} className="text-clay" />
                  <span>{report.project.location.label}</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-moss-bright">
                <ShieldCheckIcon size={12} />
                <span>{report.evidenceRecords.length} Provenance-Backed Records</span>
              </span>
            </div>
          )}
        </div>

        {/* Cloudinary Composite Cover Visual */}
        {report.coverUrl && (
          <div className="relative rounded-3xl overflow-hidden bg-ink-soft border border-mist/20 shadow-2xl space-y-0">
            <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] bg-ink">
              <Image
                src={report.coverUrl}
                alt={report.title}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
                priority
              />
            </div>
            <div className="px-5 py-3.5 bg-ink-soft border-t border-mist/15 flex items-center justify-between text-xs font-mono">
              <span className="text-mist text-[11px]">
                Composite Cover Visual: Auto-Assembled on Cloudinary CDN
              </span>
              <a
                href={report.coverUrl}
                target="_blank"
                rel="noopener noreferrer"
                download="report-cover.jpg"
                className="text-clay hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Download High-Res Cover</span>
                <span className="text-[10px]">↓</span>
              </a>
            </div>
          </div>
        )}

        {/* Narrative Prose */}
        <article className="space-y-6 pt-2">
          {paragraphs.map((para, index) => (
            <p
              key={index}
              className={`font-sans text-base sm:text-lg text-bone/90 leading-relaxed ${
                index === 0
                  ? "first-letter:text-4xl first-letter:font-display first-letter:text-clay first-letter:mr-2 first-letter:float-left first-letter:leading-none"
                  : ""
              }`}
            >
              {para}
            </p>
          ))}
        </article>

        {/* Verified Evidence Strip (Pillar 1 Integration) */}
        <section className="space-y-6 pt-10 border-t border-mist/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheckIcon size={16} className="text-clay" />
                <h2 className="font-display text-2xl text-bone">
                  Verified Evidence Strip
                </h2>
              </div>
              <p className="font-sans text-xs text-mist mt-0.5">
                Every claim in this report links back to an untouched original media asset and its cryptographic Chain of Custody.
              </p>
            </div>

            <span className="px-3 py-1 rounded-full bg-clay/10 border border-clay/30 text-clay font-mono text-xs shrink-0">
              Audit-Ready Proof
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {report.evidenceRecords.map((asset, idx) => (
              <div
                key={asset._id}
                className="rounded-2xl bg-ink-soft border border-mist/20 overflow-hidden flex flex-col justify-between hover:border-clay/40 transition-colors shadow-lg group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] bg-ink overflow-hidden">
                  <Image
                    src={asset.thumbnailUrl}
                    alt={asset.aiCaption || "Verified Evidence"}
                    fill
                    sizes="(max-width: 600px) 100vw, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-ink/80 backdrop-blur border border-mist/30 text-[9px] font-mono text-bone uppercase">
                    Record #{idx + 1} • {asset.phase}
                  </div>
                  {asset.capturedAt && (
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-ink/80 backdrop-blur text-[9px] font-mono text-mist">
                      {new Date(asset.capturedAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  )}
                </div>

                {/* Card Meta */}
                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                  {asset.aiCaption && (
                    <p className="font-sans text-xs text-bone/80 line-clamp-2 leading-relaxed">
                      {asset.aiCaption}
                    </p>
                  )}

                  <div className="pt-2 border-t border-mist/10 flex items-center justify-between">
                    <span className="font-mono text-[9px] text-mist/70 truncate max-w-[120px]">
                      {asset.provenanceHash
                        ? `#${asset.provenanceHash.slice(0, 10)}…`
                        : "Hash stored"}
                    </span>
                    <Link
                      href={asset.verifyUrl}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-clay hover:underline"
                    >
                      <ShieldCheckIcon size={12} />
                      <span>Audit Record</span>
                      <span>↗</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Institutional Signoff & Verification Footer */}
        <footer className="p-8 rounded-3xl bg-ink-soft border border-mist/20 text-center space-y-4">
          <div className="w-10 h-10 mx-auto rounded-xl bg-moss/20 border border-moss/40 flex items-center justify-center text-moss-bright">
            <ShieldCheckIcon size={20} />
          </div>
          <h3 className="font-display text-xl text-bone">
            Evidra GroundTruth Verification Seal
          </h3>
          <p className="font-sans text-xs text-mist max-w-md mx-auto leading-relaxed">
            This impact report was authored from tamper-evident media assets. Independent auditors can review each source photo, camera EXIF coordinates, and SHA-256 custody fingerprints via the links above.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs font-mono">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-moss hover:bg-moss-bright text-bone transition-colors"
            >
              {copiedLink ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <span>Copy Shareable Report Link</span>
              )}
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl border border-mist/20 text-mist hover:text-bone transition-colors"
            >
              Explore Evidra Platform
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
