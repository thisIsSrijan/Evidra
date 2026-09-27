"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";
import { AssetGrid, AssetItem } from "@/components/AssetGrid";
import { SearchIcon, CloseIcon, ProjectsIcon } from "@/components/Icons";

interface ProjectItem {
  _id: string;
  name: string;
  description?: string;
}

interface SearchMeta {
  interpretation: string;
  structuredFilter: {
    phase?: string;
    tags?: string[];
    keywords?: string[];
    [key: string]: unknown;
  };
}

export default function SearchPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<AssetItem[] | null>(null);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
          if (data.projects?.length > 0) {
            setSelectedProject(data.projects[0]._id);
          }
        }
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q || !selectedProject) return;

    setIsSearching(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${selectedProject}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Search failed");
      }

      const data = await res.json();
      setMeta({
        interpretation: data.interpretation || "",
        structuredFilter: data.structuredFilter || {},
      });
      setResults(data.results || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Search failed");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query, selectedProject]);

  const handleClear = useCallback(() => {
    setQuery("");
    setResults(null);
    setMeta(null);
    setError(null);
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") handleClear();
  };

  const selectedProjectName =
    projects.find((p) => p._id === selectedProject)?.name || "Select project";

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: BRAND_EASING }}
        className="pb-6 border-b border-mist/10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-mist/20 bg-ink-soft text-xs text-mist mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-moss-bright" />
          <span>Gemini-Powered</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-bone tracking-tight">
          Semantic Search
        </h1>
        <p className="font-sans text-mist text-sm mt-1 max-w-xl">
          Query field assets using natural language. Gemini translates your query
          into structured filters against AI tags, captions, dates, and geodata.
        </p>
      </motion.div>

      {/* Project selector + search bar */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: BRAND_EASING }}
        className="space-y-3"
      >
        {/* Project selector */}
        {!isLoading && projects.length > 0 && (
          <div className="flex items-center gap-2">
            <ProjectsIcon size={14} className="text-mist shrink-0" />
            <span className="font-sans text-xs text-mist">Searching in:</span>
            <select
              value={selectedProject || ""}
              onChange={(e) => {
                setSelectedProject(e.target.value);
                setResults(null);
                setMeta(null);
              }}
              className="bg-ink-soft border border-mist/15 rounded-lg px-3 py-1.5 text-xs font-sans text-bone focus:outline-none focus:border-moss/50 cursor-pointer appearance-none"
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            {isSearching ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="text-moss-bright"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              </motion.div>
            ) : (
              <SearchIcon size={20} className="text-mist" />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={"Describe what you're looking for... e.g. \"deforested areas before restoration\""}
            className="w-full pl-12 pr-28 py-4 rounded-xl bg-ink-soft border border-mist/15 text-bone text-sm font-sans placeholder:text-mist/50 focus:outline-none focus:border-moss/50 focus:ring-1 focus:ring-moss/20 transition-all"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {results !== null && (
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg text-mist hover:text-bone transition-colors cursor-pointer"
              >
                <CloseIcon size={14} />
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim() || !selectedProject}
              className="px-4 py-2 rounded-lg bg-moss hover:bg-moss-bright disabled:opacity-40 disabled:hover:bg-moss text-bone text-xs font-sans font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isSearching ? "Searching…" : "Search"}
            </button>
          </div>
        </div>

        {/* Interpretation + filter chips */}
        <AnimatePresence>
          {meta && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: BRAND_EASING }}
              className="overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 rounded-xl bg-ink-soft/50 border border-mist/10">
                <div className="flex items-center gap-1.5 shrink-0">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="text-moss-bright"
                  >
                    <path d="m22 2-7 20-4-9-9-4z" />
                    <path d="M22 2 11 13" />
                  </svg>
                  <span className="font-sans text-xs text-mist">
                    Gemini interpreted:
                  </span>
                </div>
                <p className="font-sans text-xs text-bone">
                  {meta.interpretation}
                </p>

                {meta.structuredFilter && (
                  <div className="flex flex-wrap gap-1.5 sm:ml-auto">
                    {meta.structuredFilter.phase &&
                      meta.structuredFilter.phase !== "any" && (
                        <span className="px-2 py-0.5 rounded-md bg-clay/10 border border-clay/20 text-[10px] font-mono text-clay">
                          phase: {String(meta.structuredFilter.phase)}
                        </span>
                      )}
                    {Array.isArray(meta.structuredFilter.tags) &&
                      (meta.structuredFilter.tags as string[])
                        .slice(0, 3)
                        .map((t: string) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-moss/10 border border-moss/20 text-[10px] font-mono text-moss-bright"
                          >
                            {t}
                          </span>
                        ))}
                    {Array.isArray(meta.structuredFilter.keywords) &&
                      (meta.structuredFilter.keywords as string[])
                        .slice(0, 2)
                        .map((k: string) => (
                          <span
                            key={k}
                            className="px-2 py-0.5 rounded-md bg-mist/10 border border-mist/20 text-[10px] font-mono text-mist"
                          >
                            &quot;{k}&quot;
                          </span>
                        ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="p-3 rounded-xl bg-clay/10 border border-clay/30 text-xs text-clay font-sans">
            {error}
          </div>
        )}
      </motion.div>

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-4">
          <div className="h-12 bg-mist/5 rounded-xl animate-pulse" />
          <div className="h-48 bg-mist/5 rounded-2xl animate-pulse" />
        </div>
      )}

      {/* No projects */}
      {!isLoading && projects.length === 0 && (
        <div className="py-16 px-6 rounded-2xl bg-ink-soft border border-mist/15 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-ink border border-mist/20 flex items-center justify-center text-mist mb-4">
            <ProjectsIcon size={24} />
          </div>
          <h3 className="font-display text-lg text-bone mb-1">
            No projects to search
          </h3>
          <p className="font-sans text-mist text-xs max-w-sm">
            Create a project and upload media first.
          </p>
        </div>
      )}

      {/* Searching indicator */}
      {isSearching && (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-full border-2 border-moss/30 border-t-moss-bright"
          />
          <p className="font-sans text-xs text-mist">
            Gemini is analyzing your query against project &quot;{selectedProjectName}&quot;…
          </p>
        </div>
      )}

      {/* Results */}
      {!isSearching && results !== null && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: BRAND_EASING }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl text-bone tracking-tight">
              Results
            </h2>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-moss/10 border border-moss/20 text-[10px] font-mono text-moss-bright">
              <SearchIcon size={10} />
              {results.length} match{results.length !== 1 ? "es" : ""}
            </span>
          </div>
          <AssetGrid assets={results} filterPhase="all" />
        </motion.div>
      )}

      {/* Empty search state */}
      {!isSearching && results === null && !isLoading && selectedProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-ink-soft border border-mist/15 flex items-center justify-center text-mist mx-auto mb-4">
            <SearchIcon size={32} />
          </div>
          <h3 className="font-display text-xl text-bone mb-2">
            Ready to search
          </h3>
          <p className="font-sans text-mist text-xs max-w-md mx-auto leading-relaxed">
            Type a natural language query to find field assets. Try descriptions
            like &quot;aerial view of reforestation progress&quot; or &quot;water
            samples from the eastern plot in June&quot;.
          </p>
        </motion.div>
      )}
    </div>
  );
}
