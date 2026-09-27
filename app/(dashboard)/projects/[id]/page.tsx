"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";
import { UploadZone } from "@/components/UploadZone";
import { PhaseSelector } from "@/components/PhaseSelector";
import { AssetGrid, AssetItem } from "@/components/AssetGrid";
import { SearchBar, SearchResult } from "@/components/SearchBar";
import { SuggestedPairings } from "@/components/SuggestedPairings";
import { PairingData } from "@/components/PairingSlider";
import {
  SatellitePinIcon,
  ShieldCheckIcon,
  ProjectsIcon,
  SearchIcon,
  SlidersIcon,
  LeafIcon,
} from "@/components/Icons";

interface ProjectInfo {
  _id: string;
  name: string;
  description?: string;
  location?: { lat: number; lng: number; label: string };
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadPhase, setUploadPhase] = useState("unclassified");
  const [filterPhase, setFilterPhase] = useState("all");

  // Tab view: gallery vs pairings
  const [currentView, setCurrentView] = useState<"gallery" | "pairings">("gallery");

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
      const [assetsRes, pairingsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}/assets`),
        fetch(`/api/projects/${projectId}/pairings`),
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
        // Update local pairing state
        setPairings((prev) =>
          prev.map((p) => (p._id === pairingId ? data.pairing : p))
        );

        // If confirmed, refresh assets to reflect newly tagged phase fields
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

  // Determine which assets to display in gallery
  const displayAssets = searchResults !== null ? searchResults : assets;

  // Counts
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
            <div className="px-3 py-2 rounded-xl bg-ink-soft border border-mist/15 text-center min-w-[64px]">
              <p className="font-mono text-lg text-moss-bright">
                {stats.withProvenance}
              </p>
              <p className="font-sans text-[9px] text-mist uppercase tracking-wider flex items-center gap-0.5 justify-center">
                <ShieldCheckIcon size={10} />
                Verified
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs & Auto-Pair Shortcut */}
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
              <span>Before &amp; After Proof ({pairings.length})</span>
              {suggestedPairingsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-clay text-ink text-[10px] font-bold">
                  {suggestedPairingsCount}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            disabled={isGeneratingPairings || assets.length < 2}
            onClick={handleGeneratePairings}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-clay/10 hover:bg-clay/20 border border-clay/30 text-clay text-xs font-mono transition-colors disabled:opacity-40"
          >
            {isGeneratingPairings ? (
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
                <span>Analyzing Clusters…</span>
              </>
            ) : (
              <>
                <SlidersIcon size={14} />
                <span>Auto-Pair with Gemini</span>
              </>
            )}
          </button>
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
                className="text-mist hover:text-bone"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Main Content: Depending on active tab */}
      {currentView === "pairings" ? (
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

              {/* Filter Tabs — hide during search */}
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
              />
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
