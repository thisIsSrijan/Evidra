"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ShieldCheckIcon,
  FingerprintIcon,
  SatellitePinIcon,
  LeafIcon,
} from "@/components/Icons";

interface VerificationData {
  _id: string;
  cloudinaryPublicId: string;
  cloudinaryVersion: string;
  resourceType: "image" | "video";
  phase: string;
  signedOriginalUrl: string;
  uploadTimestamp: string;
  capturedAt: string | null;
  uploaderOrg: string;
  projectName: string;
  projectLocation?: { lat: number; lng: number; label: string } | null;
  geo?: { lat: number; lng: number } | null;
  aiCaption?: string | null;
  aiTags: string[];
  provenanceHash: string | null;
  verification: {
    isVerified: boolean;
    tamperDetected: boolean;
    calculatedHash: string;
    storedHash?: string;
    algorithm: string;
    verifiedAt: string;
  };
}

export default function VerifyAssetPage() {
  const params = useParams();
  const assetId = params.assetId as string;

  const [data, setData] = useState<VerificationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    async function fetchVerification() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/verify/${assetId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("This asset was not found in the public verification registry.");
            return;
          }
          throw new Error("Failed to verify asset provenance.");
        }
        const json = await res.json();
        setData(json.asset);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "An unexpected error occurred while verifying provenance."
        );
      } finally {
        setIsLoading(false);
      }
    }

    if (assetId) {
      fetchVerification();
    }
  }, [assetId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyHash = (hash: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2500);
    }
  };

  const formatDate = (val?: string | null) => {
    if (!val) return "Timestamp not recorded";
    try {
      return new Date(val).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
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
            Querying Provenance Chain &amp; Computing SHA-256 Fingerprint…
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-ink text-bone font-sans flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-ink-soft border border-mist/20 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-clay/10 border border-clay/30 flex items-center justify-center text-clay">
            <ShieldCheckIcon size={24} />
          </div>
          <h1 className="font-display text-2xl text-bone">Verification Failed</h1>
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

  const { isVerified, calculatedHash, algorithm, verifiedAt } =
    data.verification;

  return (
    <div className="min-h-screen bg-ink text-bone font-sans antialiased selection:bg-clay/30 selection:text-bone">
      {/* Calm Institutional Header */}
      <header className="border-b border-mist/10 bg-ink/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
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
            <span className="font-mono text-xs text-mist uppercase tracking-widest">
              Provenance Chain Registry
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-ink-soft hover:bg-mist/10 border border-mist/20 text-xs font-mono text-bone transition-all"
            >
              {copiedLink ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-moss-bright">
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
                    className="text-mist"
                  >
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <span>Share Verification Link</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-16 space-y-12">
        {/* Verification Status Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-mist/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono text-mist uppercase tracking-widest">
              <span>Public Audit Record</span>
              <span>•</span>
              <span>Asset #{data._id.slice(-8)}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-bone tracking-tight">
              Cryptographic Chain of Custody
            </h1>
            <p className="text-mist text-sm max-w-2xl leading-relaxed">
              This media asset was fingerprinted at the exact moment of ingestion and cryptographically signed on the Cloudinary delivery layer. Any tampering or metadata alteration will invalidate this record.
            </p>
          </div>

          {/* Real-time Verification Badge */}
          <div className="shrink-0">
            {isVerified ? (
              <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-clay/10 border-2 border-clay shadow-xl">
                <div className="w-9 h-9 rounded-xl bg-clay flex items-center justify-center text-ink shrink-0 shadow-md">
                  <ShieldCheckIcon size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-clay tracking-wider uppercase">
                      VERIFIED AUTHENTIC
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
                  </div>
                  <span className="font-sans text-[11px] text-bone/90 block">
                    Hash Re-verification Passed (100% Match)
                  </span>
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-clay/10 border-2 border-clay/60">
                <div className="w-9 h-9 rounded-xl bg-clay/20 border border-clay/40 flex items-center justify-center text-clay shrink-0">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-clay tracking-wider uppercase block">
                    FINGERPRINT MISMATCH
                  </span>
                  <span className="font-sans text-[11px] text-mist block">
                    Stored hash does not match current parameters
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Two-Column Grid: Original Asset vs Chain of Custody */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Full Original Unaltered Asset */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-mist uppercase tracking-widest">
                Untouched Original Asset
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-ink-soft border border-mist/20 text-[10px] font-mono text-moss-bright">
                <span>Signed Delivery</span>
              </span>
            </div>

            {/* Media Container */}
            <div className="relative rounded-2xl overflow-hidden bg-ink-soft border border-mist/20 shadow-2xl">
              {data.resourceType === "video" ? (
                <video
                  src={data.signedOriginalUrl}
                  controls
                  className="w-full h-auto aspect-[16/10] object-cover bg-black"
                />
              ) : (
                <div className="relative w-full aspect-[16/10] sm:aspect-[4/3] bg-ink">
                  <Image
                    src={data.signedOriginalUrl}
                    alt={data.aiCaption || "Unaltered original evidence"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 600px"
                    className="object-contain"
                    priority
                  />
                </div>
              )}

              {/* Immutable Original Stamp */}
              <div className="p-4 bg-ink-soft border-t border-mist/15 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-clay" />
                  <span className="font-mono font-medium text-bone uppercase tracking-wider text-[11px]">
                    Original — unaltered
                  </span>
                </div>
                <span className="font-mono text-[10px] text-mist/70">
                  Delivery: Full Resolution
                </span>
              </div>
            </div>

            {/* AI Observation & Subject Metadata */}
            {data.aiCaption && (
              <div className="p-4 rounded-xl bg-ink-soft/60 border border-mist/15 text-xs text-bone space-y-1">
                <span className="font-mono text-[10px] text-mist uppercase tracking-wider block">
                  AI Context Analysis:
                </span>
                <p className="text-mist leading-relaxed italic">
                  &ldquo;{data.aiCaption}&rdquo;
                </p>
                {data.aiTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {data.aiTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md bg-mist/10 border border-mist/15 text-[10px] font-mono text-mist"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Clean Vertical Chain of Custody Timeline */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <h2 className="font-display text-xl text-bone">
                Chain of Custody Timeline
              </h2>
              <p className="text-mist text-xs mt-0.5">
                Sequential audit trail recorded at each step from field capture to tamper-proof storage.
              </p>
            </div>

            {/* Vertical Timeline Component */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-mist/15">
              {/* Step 1: Capture & Ground Context */}
              <div className="relative group">
                {/* Node indicator */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-ink border-2 border-moss flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-moss-bright" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-moss-bright font-bold">
                      1. Field Capture &amp; Observation
                    </span>
                    <span className="font-mono text-[10px] text-mist">
                      {data.phase.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-ink-soft border border-mist/15 text-xs space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-mist">Capture Timestamp:</span>
                      <span className="font-mono text-bone">
                        {formatDate(data.capturedAt)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-mist">Project:</span>
                      <span className="text-bone font-medium">
                        {data.projectName}
                      </span>
                    </div>

                    {data.geo ? (
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-mist/10">
                        <span className="text-mist flex items-center gap-1">
                          <SatellitePinIcon size={12} className="text-clay" />
                          <span>EXIF Geodata:</span>
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${data.geo.lat},${data.geo.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-clay hover:underline flex items-center gap-1"
                        >
                          <span>
                            {data.geo.lat.toFixed(4)}°, {data.geo.lng.toFixed(4)}°
                          </span>
                          <span className="text-[10px]">↗</span>
                        </a>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-[11px] pt-1 border-t border-mist/10 text-mist/60 font-mono">
                        <span>EXIF Coordinates:</span>
                        <span>Not attached to file</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step 2: Custody & Organization Ingestion */}
              <div className="relative group">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-ink border-2 border-clay flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-clay" />
                </div>

                <div className="space-y-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-clay font-bold block">
                    2. Ingestion &amp; Fingerprint Generation
                  </span>

                  <div className="p-3.5 rounded-xl bg-ink-soft border border-mist/15 text-xs space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-mist">Uploader Organization:</span>
                      <span className="font-medium text-bone">
                        {data.uploaderOrg}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-mist">Ingestion Timestamp:</span>
                      <span className="font-mono text-bone">
                        {formatDate(data.uploadTimestamp)}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-mist/10 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-mist flex items-center gap-1">
                          <FingerprintIcon size={12} className="text-clay" />
                          <span>Stored SHA-256 Hash:</span>
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyHash(data.provenanceHash || calculatedHash)
                          }
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-clay hover:underline cursor-pointer"
                        >
                          {copiedHash ? (
                            <>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-moss-bright">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                              <span className="text-moss-bright">Copied</span>
                            </>
                          ) : (
                            <span>Copy Hash</span>
                          )}
                        </button>
                      </div>
                      <div className="p-2 rounded bg-ink border border-mist/15 font-mono text-[10px] text-mist/90 break-all select-all">
                        {data.provenanceHash || calculatedHash}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Cloudinary Vault & Delivery Signature */}
              <div className="relative group">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-ink border-2 border-mist flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-mist" />
                </div>

                <div className="space-y-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-mist font-bold block">
                    3. Cloudinary Immutable Vault Record
                  </span>

                  <div className="p-3.5 rounded-xl bg-ink-soft border border-mist/15 text-xs space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-mist">Public ID:</span>
                      <span className="font-mono text-bone text-[11px]">
                        {data.cloudinaryPublicId}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-mist">Storage Version:</span>
                      <span className="font-mono text-bone">
                        v{data.cloudinaryVersion}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-mist/10">
                      <span className="text-mist">Delivery Protocol:</span>
                      <span className="font-mono text-moss-bright text-[11px]">
                        Signed Delivery URL (HMAC Secret Verified)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4: Live Re-Verification Check */}
              <div className="relative group">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-ink border-2 border-clay flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-clay" />
                </div>

                <div className="space-y-1.5">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-clay font-bold block">
                    4. Real-time Audit Re-verification
                  </span>

                  <div className="p-3.5 rounded-xl bg-clay/5 border border-clay/30 text-xs space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-mist">Re-verification Timestamp:</span>
                      <span className="font-mono text-bone">
                        {formatDate(verifiedAt)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-mist">Hashing Engine:</span>
                      <span className="font-mono text-bone">{algorithm}</span>
                    </div>

                    <div className="flex justify-between items-center text-[11px] pt-1 border-t border-clay/20">
                      <span className="text-mist">Audit Result:</span>
                      <span className="font-mono font-bold text-clay">
                        {isVerified
                          ? "FINGERPRINT MATCH — 0 ALTERATIONS"
                          : "TAMPER DETECTED"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Auditor Guidance Note */}
            <div className="p-4 rounded-xl bg-ink-soft border border-mist/10 text-xs text-mist leading-relaxed space-y-1">
              <span className="font-mono text-[10px] text-bone uppercase tracking-wider block font-semibold">
                For Donors &amp; Environmental Auditors:
              </span>
              <p>
                This permanent verification link provides independent proof of evidence origin. The SHA-256 fingerprint binds the unedited media payload to the conservation project record before any presentation transformations occur.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
