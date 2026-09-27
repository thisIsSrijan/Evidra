"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";
import { SearchIcon, CloseIcon } from "@/components/Icons";

interface SearchBarProps {
  projectId: string;
  onResults: (results: SearchResult[]) => void;
  onClear: () => void;
  onSearching: (isSearching: boolean) => void;
}

export interface SearchResult {
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

interface SearchMeta {
  interpretation: string;
  structuredFilter: {
    phase?: string;
    tags?: string[];
    keywords?: string[];
    [key: string]: unknown;
  };
}

export function SearchBar({
  projectId,
  onResults,
  onClear,
  onSearching,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [meta, setMeta] = useState<SearchMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;

    // Abort any pending search
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsSearching(true);
    setError(null);
    onSearching(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
        signal: controller.signal,
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
      setHasSearched(true);
      onResults(data.results || []);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Search failed");
      onResults([]);
    } finally {
      setIsSearching(false);
      onSearching(false);
    }
  }, [query, projectId, onResults, onSearching]);

  const handleClear = useCallback(() => {
    setQuery("");
    setHasSearched(false);
    setMeta(null);
    setError(null);
    onClear();
    inputRef.current?.focus();
  }, [onClear]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") {
      if (hasSearched) {
        handleClear();
      } else {
        inputRef.current?.blur();
      }
    }
  };

  // Cleanup abort on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return (
    <div className="space-y-3">
      {/* Search input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          {isSearching ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
            >
              <svg
                width="18"
                height="18"
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
            <SearchIcon size={18} className="text-mist" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search with natural language... e.g. &quot;flooded fields near the river in March&quot;"
          className="w-full pl-11 pr-24 py-3.5 rounded-xl bg-ink-soft border border-mist/15 text-bone text-sm font-sans placeholder:text-mist/50 focus:outline-none focus:border-moss/50 focus:ring-1 focus:ring-moss/20 transition-all"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {hasSearched && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg text-mist hover:text-bone transition-colors cursor-pointer"
              title="Clear search"
            >
              <CloseIcon size={14} />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-3 py-1.5 rounded-lg bg-moss hover:bg-moss-bright disabled:opacity-40 disabled:hover:bg-moss text-bone text-xs font-sans font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {isSearching ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {/* Search interpretation & filter chips */}
      <AnimatePresence>
        {hasSearched && meta && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: BRAND_EASING }}
            className="overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl bg-ink-soft/50 border border-mist/10">
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

              {/* Filter chips */}
              {meta.structuredFilter && (
                <div className="flex flex-wrap gap-1.5 sm:ml-auto">
                  {meta.structuredFilter.phase &&
                    meta.structuredFilter.phase !== "any" && (
                      <span className="px-2 py-0.5 rounded-md bg-clay/10 border border-clay/20 text-[10px] font-mono text-clay">
                        phase: {String(meta.structuredFilter.phase)}
                      </span>
                    )}
                  {Array.isArray(meta.structuredFilter.tags) &&
                    (meta.structuredFilter.tags as string[]).slice(0, 3).map((t: string) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-moss/10 border border-moss/20 text-[10px] font-mono text-moss-bright"
                      >
                        {t}
                      </span>
                    ))}
                  {Array.isArray(meta.structuredFilter.keywords) &&
                    (meta.structuredFilter.keywords as string[]).slice(0, 2).map((k: string) => (
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

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-3 rounded-xl bg-clay/10 border border-clay/30 text-xs text-clay font-sans"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SearchBar;
