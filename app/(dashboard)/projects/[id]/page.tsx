"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";
import { UploadZone } from "@/components/UploadZone";
import { PhaseSelector } from "@/components/PhaseSelector";
import { AssetGrid, AssetItem } from "@/components/AssetGrid";
import { SearchBar, SearchResult } from "@/components/SearchBar";
import {
  SatellitePinIcon,
  ShieldCheckIcon,
  ProjectsIcon,
  SearchIcon,
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadPhase, setUploadPhase] = useState("unclassified");
  const [filterPhase, setFilterPhase] = useState("all");

  // Search state
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Clustering state
  const [isClustering, setIsClustering] = useState(false);
  const [clusterCount, setClusterCount] = useState<number | null>(null);

  const fetchProjectAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/projects/${projectId}/assets`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Project not found.");
          return;
        }
        throw new Error("Failed to load project data.");
      }
      const data = await res.json();
      setProject(data.project);
      setAssets(data.assets || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to load project data."
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectAssets();
  }, [fetchProjectAssets]);

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

  const handleUploadComplete = useCallback((newAsset: AssetItem) => {
    setAssets((prev) => [newAsset, ...prev]);
  }, []);

  const handleSearchResults = useCallback((results: SearchResult[]) => {
    setSearchResults(results);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchResults(null);
  }, []);

  const handleSearching = useCallback((searching: boolean) => {
    setIsSearching(searching);
  }, []);

  // Determine which assets to display
  const displayAssets = searchResults !== null ? searchResults : assets;

  // Asset stats
  const stats = {
    total: assets.length,
    before: assets.filter((a) => a.phase === "before").length,
    after: assets.filter((a) => a.phase === "after").length,
    progress: assets.filter((a) => a.phase === "progress").length,
    withGeo: assets.filter((a) => a.geo).length,
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
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.05, ease: BRAND_EASING }}
      >
        <SearchBar
          projectId={projectId}
          onResults={handleSearchResults}
          onClear={handleSearchClear}
          onSearching={handleSearching}
        />
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: BRAND_EASING }}
        className="space-y-4"
      >
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
      </motion.div>

      {/* Asset Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: BRAND_EASING }}
        className="space-y-4"
      >
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
      </motion.div>
    </div>
  );
}
