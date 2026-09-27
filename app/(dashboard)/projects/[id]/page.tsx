"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";
import { UploadZone } from "@/components/UploadZone";
import { PhaseSelector } from "@/components/PhaseSelector";
import { AssetGrid, AssetItem } from "@/components/AssetGrid";
import { SearchBar, SearchResult } from "@/components/SearchBar";
import { SuggestedPairings } from "@/components/SuggestedPairings";
import { PairingData } from "@/components/PairingSlider";
import { ImpactStoryEditor, ImpactStoryDraft } from "@/components/ImpactStoryEditor";
import {
  SatellitePinIcon,
  ProjectsIcon,
  SearchIcon,
  SlidersIcon,
  LeafIcon,
  ReportsIcon,
} from "@/components/Icons";
import { EmptyState } from "@/components/EmptyState";

interface ProjectInfo {
  _id: string;
  name: string;
  description?: string;
  location?: { lat: number; lng: number; label: string };
}

interface ProjectReport {
  _id: string;
  title: string;
  subtitle?: string;
  narrative: string;
  coverUrl?: string;
  shareSlug: string;
  createdAt: string;
  assetIds?: string[];
}

const FILTER_PHASES = [
  { key: "all", label: "All" },
  { key: "before", label: "Before" },
  { key: "progress", label: "Progress" },
  { key: "after", label: "After" },
  { key: "unclassified", label: "Unclassified" },
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [pairings, setPairings] = useState<PairingData[]>([]);
  const [reports, setReports] = useState<ProjectReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadPhase, setUploadPhase] = useState("unclassified");
  const [filterPhase, setFilterPhase] = useState("all");

  // Tab view: gallery vs pairings vs reports
  const [currentView, setCurrentView] = useState<"gallery" | "pairings" | "reports">("gallery");

  // Multi-select for report generation
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Impact story generator draft
  const [reportDraft, setReportDraft] = useState<ImpactStoryDraft | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isSavingStory, setIsSavingStory] = useState(false);

  // Search state
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Clustering state
  const [isClustering, setIsClustering] = useState(false);
  const [clusterCount, setClusterCount] = useState<number | null>(null);

  // Auto-pairing generation state
  const [isGeneratingPairings, setIsGeneratingPairings] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  const fetchProjectData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [assetsRes, pairingsRes, reportsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/assets`),
        fetch(`/api/projects/${projectId}/pairings`),
        fetch(`/api/projects/${projectId}/reports`),
      ]);

      if (!assetsRes.ok) {
        if (assetsRes.status === 404) {
          setError("Project not found.");
          return;
        }
        throw new Error("Failed to load project data.");
      }

      const assetsData = await assetsRes.json();
      setProject(assetsData.project);
      setAssets(assetsData.assets || []);

      if (pairingsRes.ok) {
        const pairingsData = await pairingsRes.json();
        setPairings(pairingsData.pairings || []);
      }

      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load project data."
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  // Auto-trigger clustering when assets load (>= 2 assets)
  useEffect(() => {
    if (assets.length >= 2 && !isClustering && clusterCount === null) {
      triggerClustering();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assets.length]);

  const triggerClustering = async () => {
    try {
      setIsClustering(true);
      const res = await fetch(`/api/projects/${projectId}/cluster`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        setClusterCount(data.clusters?.length ?? 0);
      }
    } catch {
      // Silent fail — clustering is background work
    } finally {
      setIsClustering(false);
    }
  };

  const handleGeneratePairings = async () => {
    try {
      setIsGeneratingPairings(true);
      setGenerationNotice("Gemini is reviewing asset clusters and timestamps…");
      const res = await fetch(`/api/projects/${projectId}/pairings/generate`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setPairings(data.pairings || []);
        setGenerationNotice(
          data.newCount > 0
            ? `Generated ${data.newCount} new before/after pair suggestion${data.newCount > 1 ? "s" : ""}!`
            : "Reviewed clusters — all valid pairings are up to date."
        );
        setCurrentView("pairings");
        setTimeout(() => setGenerationNotice(null), 5000);
      } else {
        setGenerationNotice(data.error || "Failed to generate pairings.");
      }
    } catch {
      setGenerationNotice("Error contacting Gemini auto-pairing engine.");
    } finally {
      setIsGeneratingPairings(false);
    }
  };

  const handlePairingStatusUpdate = async (
    pairingId: string,
    status: "confirmed" | "rejected"
  ) => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/pairings/${pairingId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setPairings((prev) =>
          prev.map((p) => (p._id === pairingId ? data.pairing : p))
        );

        if (status === "confirmed") {
          const assetsRes = await fetch(`/api/projects/${projectId}/assets`);
          if (assetsRes.ok) {
            const assetsData = await assetsRes.json();
            setAssets(assetsData.assets || []);
          }
        }
      }
    } catch (err) {
      console.error("Failed to update pairing status:", err);
    }
  };

  // Generate impact story draft
  const handleGenerateImpactStory = async (targetAssetIds?: string[]) => {
    let idsToUse = targetAssetIds;
    if (!idsToUse || idsToUse.length === 0) {
      idsToUse =
        selectedAssetIds.length > 0
          ? selectedAssetIds
          : assets.map((a) => a._id);
    }

    if (idsToUse.length === 0) {
      setGenerationNotice("Please upload or select at least 1 asset to generate a story.");
      return;
    }

    try {
      setIsGeneratingStory(true);
      setGenerationNotice("Gemini is synthesizing a donor-ready narrative & assembling Cloudinary cover…");
      const res = await fetch(`/api/projects/${projectId}/reports/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetIds: idsToUse }),
      });

      const data = await res.json();
      if (res.ok) {
        setReportDraft(data.draft);
        setGenerationNotice(null);
      } else {
        setGenerationNotice(data.error || "Failed to draft impact story.");
      }
    } catch {
      setGenerationNotice("Error communicating with report generator service.");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handleSaveReport = async (payload: {
    title: string;
    subtitle: string;
    narrative: string;
    coverUrl: string;
    assetIds: string[];
  }): Promise<string | null> => {
    try {
      setIsSavingStory(true);
      const res = await fetch(`/api/projects/${projectId}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setReports((prev) => [data.report, ...prev]);
        return data.shareUrl;
      }
      return null;
    } catch {
      return null;
    } finally {
      setIsSavingStory(false);
    }
  };

  const toggleSelectAsset = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleUploadComplete = useCallback((newAsset: AssetItem) => {
    setAssets((prev) => [newAsset, ...prev]);
  }, []);

  const handleSearchResults = useCallback((results: SearchResult[]) => {
    setSearchResults(results);
    setCurrentView("gallery");
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchResults(null);
  }, []);

  const handleSearching = useCallback((searching: boolean) => {
    setIsSearching(searching);
  }, []);

  const displayAssets = searchResults !== null ? searchResults : assets;

  const suggestedPairingsCount = pairings.filter(
    (p) => p.status === "suggested"
  ).length;
  const confirmedPairingsCount = pairings.filter(
    (p) => p.status === "confirmed"
  ).length;

  const stats = {
    total: assets.length,
    before: assets.filter((a) => a.phase === "before").length,
    after: assets.filter((a) => a.phase === "after").length,
    progress: assets.filter((a) => a.phase === "progress").length,
    pairings: confirmedPairingsCount,
    reports: reports.length,
    withProvenance: assets.filter((a) => a.provenanceHash).length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-mist/10 rounded w-1/3" />
          <div className="h-4 bg-mist/10 rounded w-2/3" />
          <div className="h-12 bg-mist/5 rounded-xl" />
          <div className="h-48 bg-mist/5 rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-mist/5 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="font-sans text-mist text-sm mb-4">{error}</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 rounded-xl bg-moss hover:bg-moss-bright text-bone text-xs font-sans transition-colors"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 select-none">
      {/* Project Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: BRAND_EASING }}
        className="pb-6 border-b border-mist/10"
      >
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-1.5 text-mist hover:text-bone text-xs font-sans mb-3 transition-colors cursor-pointer"
        >
          <ProjectsIcon size={14} />
          <span>All Projects</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-bone tracking-tight">
              {project?.name}
            </h1>
            {project?.description && (
              <p className="font-sans text-mist text-sm mt-1 max-w-xl">
                {project.description}
              </p>
            )}
            {project?.location && (
              <div className="flex items-center gap-2 text-xs text-mist mt-2">
                <SatellitePinIcon size={14} className="text-clay shrink-0" />
                <span>{project.location.label}</span>
                <span className="font-mono text-[10px] text-mist/60">
                  {project.location.lat?.toFixed(4)}°,{" "}
                  {project.location.lng?.toFixed(4)}°
                </span>
              </div>
            )}
          </div>

          {/* Telemetry Stats */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3 py-2 rounded-xl bg-ink-soft border border-mist/15 text-center min-w-[64px]">
              <p className="font-mono text-lg text-bone">{stats.total}</p>
              <p className="font-sans text-[9px] text-mist uppercase tracking-wider">
                Assets
              </p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-ink-soft border border-mist/15 text-center min-w-[64px]">
              <p className="font-mono text-lg text-clay">{stats.before}</p>
              <p className="font-sans text-[9px] text-mist uppercase tracking-wider">
                Before
              </p>
            </div>
            <div className="px-3 py-2 rounded-xl bg-ink-soft border border-mist/15 text-center min-w-[64px]">
              <p className="font-mono text-lg text-moss-bright">{stats.after}</p>
              <p className="font-sans text-[9px] text-mist uppercase tracking-wider">
                After
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentView("pairings")}
              className="px-3 py-2 rounded-xl bg-ink-soft hover:bg-moss/20 border border-mist/15 hover:border-moss/40 text-center min-w-[64px] transition-colors cursor-pointer"
            >
              <p className="font-mono text-lg text-moss-bright flex items-center justify-center gap-1">
                {stats.pairings}
                {suggestedPairingsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-clay animate-pulse" />
                )}
              </p>
              <p className="font-sans text-[9px] text-mist uppercase tracking-wider">
                Pairs
              </p>
            </button>
            <button
              type="button"
              onClick={() => setCurrentView("reports")}
              className="px-3 py-2 rounded-xl bg-ink-soft hover:bg-clay/20 border border-mist/15 hover:border-clay/40 text-center min-w-[64px] transition-colors cursor-pointer"
            >
              <p className="font-mono text-lg text-clay">{stats.reports}</p>
              <p className="font-sans text-[9px] text-mist uppercase tracking-wider">
                Reports
              </p>
            </button>
          </div>
        </div>

        {/* View Switcher Tabs & Generation Shortcuts */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-mist/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentView("gallery")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                currentView === "gallery"
                  ? "bg-moss text-bone shadow-md"
                  : "bg-ink-soft text-mist hover:text-bone border border-mist/15"
              }`}
            >
              <LeafIcon size={14} />
              <span>Evidence Gallery ({assets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentView("pairings")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                currentView === "pairings"
                  ? "bg-moss text-bone shadow-md"
                  : "bg-ink-soft text-mist hover:text-bone border border-mist/15"
              }`}
            >
              <SlidersIcon size={14} />
              <span>Before &amp; After ({pairings.length})</span>
              {suggestedPairingsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-clay text-ink text-[10px] font-bold">
                  {suggestedPairingsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setCurrentView("reports")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all ${
                currentView === "reports"
                  ? "bg-moss text-bone shadow-md"
                  : "bg-ink-soft text-mist hover:text-bone border border-mist/15"
              }`}
            >
              <ReportsIcon size={14} />
              <span>Donor Reports ({reports.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGeneratingStory || assets.length === 0}
              onClick={() => handleGenerateImpactStory()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-clay hover:bg-clay/90 text-ink font-mono font-medium text-xs shadow-md transition-all disabled:opacity-40"
            >
              {isGeneratingStory ? (
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
                  <span>Synthesizing Story…</span>
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="m12 2 2.4 7.4 7.6 2.6-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6L12 2Z" />
                  </svg>
                  <span>Generate Impact Story</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Status Notice */}
        <AnimatePresence>
          {generationNotice && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 rounded-xl bg-ink-soft border border-moss/30 text-xs font-mono text-moss-bright flex items-center justify-between"
            >
              <span>{generationNotice}</span>
              <button
                type="button"
                onClick={() => setGenerationNotice(null)}
                className="text-mist hover:text-bone p-1"
                aria-label="Dismiss notice"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Inline Impact Story Editor (Pillar 3) */}
      <AnimatePresence>
        {reportDraft && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: BRAND_EASING }}
          >
            <ImpactStoryEditor
              draft={reportDraft}
              onSave={handleSaveReport}
              onCancel={() => setReportDraft(null)}
              isSaving={isSavingStory}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content: Depending on active tab */}
      {currentView === "reports" ? (
        <motion.div
          key="reports-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: BRAND_EASING }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-mist/10">
            <div>
              <h2 className="font-display text-2xl text-bone">
                Published Donor Impact Reports
              </h2>
              <p className="font-sans text-xs sm:text-sm text-mist mt-1">
                Pillar 3: Verified narratives with Cloudinary cover collages and immutable audit links.
              </p>
            </div>

            <button
              type="button"
              disabled={isGeneratingStory || assets.length === 0}
              onClick={() => handleGenerateImpactStory()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-clay text-ink font-mono text-xs font-medium hover:bg-clay/90 transition-colors shadow-sm disabled:opacity-40"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="m12 2 2.4 7.4 7.6 2.6-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6L12 2Z" />
              </svg>
              <span>Create New Report</span>
            </button>
          </div>

          {reports.length === 0 ? (
            <EmptyState
              variant="reports"
              title="No impact stories published yet"
              description="Generate your first donor report from field photos. Gemini will synthesize a factual narrative and Cloudinary will construct the composite cover visual."
              actionText="Generate First Impact Story"
              onAction={() => handleGenerateImpactStory()}
              actionIcon={
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m12 2 2.4 7.4 7.6 2.6-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6L12 2Z" />
                </svg>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reports.map((rep) => (
                <div
                  key={rep._id}
                  className="rounded-2xl bg-ink-soft border border-mist/20 overflow-hidden flex flex-col justify-between hover:border-moss/40 transition-colors shadow-xl group"
                >
                  {/* Cover Visual */}
                  {rep.coverUrl ? (
                    <div className="relative aspect-[16/9] bg-ink overflow-hidden">
                      <Image
                        src={rep.coverUrl}
                        alt={rep.title}
                        fill
                        sizes="(max-width: 600px) 100vw, 400px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-ink/80 backdrop-blur border border-mist/30 text-[10px] font-mono text-bone">
                        Cover Collage
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-ink flex items-center justify-center text-xs text-mist font-mono">
                      No cover image
                    </div>
                  )}

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] font-mono text-mist">
                        <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                        <span className="text-clay">Verified Report</span>
                      </div>
                      <h3 className="font-display text-xl text-bone leading-tight group-hover:text-moss-bright transition-colors">
                        {rep.title}
                      </h3>
                      {rep.subtitle && (
                        <p className="font-sans text-xs text-mist line-clamp-2">
                          {rep.subtitle}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-mist/10 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (typeof window !== "undefined") {
                            navigator.clipboard.writeText(
                              `${window.location.origin}/reports/${rep.shareSlug}`
                            );
                            setGenerationNotice("Copied report link to clipboard!");
                            setTimeout(() => setGenerationNotice(null), 3000);
                          }
                        }}
                        className="text-xs font-mono text-mist hover:text-bone transition-colors"
                      >
                        Copy Share Link
                      </button>

                      <Link
                        href={`/reports/${rep.shareSlug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-moss hover:bg-moss-bright text-xs font-mono text-bone transition-colors shadow-sm"
                      >
                        <span>View Report</span>
                        <span>↗</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      ) : currentView === "pairings" ? (
        <motion.div
          key="pairings-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: BRAND_EASING }}
        >
          <SuggestedPairings
            projectId={projectId}
            pairings={pairings}
            onRefreshPairings={fetchProjectData}
            onStatusUpdate={handlePairingStatusUpdate}
            isGenerating={isGeneratingPairings}
            onGenerateClick={handleGeneratePairings}
            onGenerateStoryFromPair={(p) => {
              const pairAssetIds = [
                p.beforeAsset?._id,
                p.afterAsset?._id,
              ].filter(Boolean) as string[];
              handleGenerateImpactStory(pairAssetIds);
            }}
          />
        </motion.div>
      ) : (
        <motion.div
          key="gallery-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: BRAND_EASING }}
          className="space-y-8"
        >
          {/* Natural Language Search Bar */}
          <SearchBar
            projectId={projectId}
            onResults={handleSearchResults}
            onClear={handleSearchClear}
            onSearching={handleSearching}
          />

          {/* Upload Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl text-bone tracking-tight">
                  Ingest Field Media
                </h2>
                <p className="font-sans text-mist text-xs mt-0.5">
                  Select a phase, then upload. Provenance hashing and AI analysis
                  run automatically.
                </p>
              </div>
              <PhaseSelector value={uploadPhase} onChange={setUploadPhase} />
            </div>

            <UploadZone
              projectId={projectId}
              phase={uploadPhase}
              onUploadComplete={handleUploadComplete}
            />
          </div>

          {/* Asset Gallery */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-mist/10">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl text-bone tracking-tight">
                  {searchResults !== null ? "Search Results" : "Media Registry"}
                </h2>
                {searchResults !== null && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-moss/10 border border-moss/20 text-[10px] font-mono text-moss-bright">
                    <SearchIcon size={10} />
                    {searchResults.length} match
                    {searchResults.length !== 1 ? "es" : ""}
                  </span>
                )}
                {isClustering && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-clay/10 border border-clay/20 text-[10px] font-mono text-clay animate-pulse">
                    Clustering…
                  </span>
                )}
                {clusterCount !== null && !isClustering && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-mist/10 border border-mist/15 text-[10px] font-mono text-mist">
                    {clusterCount} cluster{clusterCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Action bar: Filter tabs + Select Mode Toggle */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSelectMode(!isSelectMode);
                    if (isSelectMode) setSelectedAssetIds([]);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors border ${
                    isSelectMode
                      ? "bg-clay text-ink font-medium border-clay"
                      : "bg-ink-soft text-mist hover:text-bone border-mist/15"
                  }`}
                >
                  {isSelectMode
                    ? `Done Selecting (${selectedAssetIds.length})`
                    : "Select for Report"}
                </button>

                {isSelectMode && selectedAssetIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleGenerateImpactStory(selectedAssetIds)}
                    disabled={isGeneratingStory}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-moss hover:bg-moss-bright text-bone text-xs font-mono transition-colors shadow-sm"
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                      <path d="m12 2 2.4 7.4 7.6 2.6-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6L12 2Z" />
                    </svg>
                    <span>Create Story ({selectedAssetIds.length})</span>
                  </button>
                )}

                {/* Filter Tabs */}
                {searchResults === null && (
                  <div className="flex items-center gap-1 bg-ink-soft rounded-lg border border-mist/15 p-0.5">
                    {FILTER_PHASES.map((fp) => (
                      <button
                        key={fp.key}
                        type="button"
                        onClick={() => setFilterPhase(fp.key)}
                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-sans transition-colors cursor-pointer ${
                          filterPhase === fp.key
                            ? "bg-moss/30 text-bone"
                            : "text-mist hover:text-bone"
                        }`}
                      >
                        {fp.label}
                        {fp.key !== "all" && (
                          <span className="ml-1 text-[9px] font-mono text-mist/50">
                            {assets.filter((a) => a.phase === fp.key).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Searching indicator */}
            {isSearching && (
              <div className="py-8 flex flex-col items-center justify-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full border-2 border-moss/30 border-t-moss-bright"
                />
                <p className="font-sans text-xs text-mist">
                  Gemini is analyzing your query against {assets.length} assets…
                </p>
              </div>
            )}

            {!isSearching && (
              <AssetGrid
                assets={displayAssets}
                filterPhase={searchResults !== null ? "all" : filterPhase}
                selectable={isSelectMode}
                selectedIds={selectedAssetIds}
                onToggleSelect={toggleSelectAsset}
              />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
