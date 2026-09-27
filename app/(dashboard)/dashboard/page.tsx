"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";
import { PlusIcon, SatellitePinIcon, ShieldCheckIcon } from "@/components/Icons";
import { NewProjectModal } from "@/components/NewProjectModal";
import { EmptyState } from "@/components/EmptyState";

interface ProjectItem {
  _id: string;
  name: string;
  description?: string;
  location?: {
    lat: number;
    lng: number;
    label: string;
  };
  createdAt: string;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/projects");
      if (!res.ok) {
        throw new Error("Failed to load projects.");
      }
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectCreated = (newProject: ProjectItem) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  return (
    <div className="space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-mist/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-mist/20 bg-ink-soft text-xs text-mist mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-clay" />
            <span>Field Evidence Repository</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-bone tracking-tight">
            Conservation Projects
          </h1>
          <p className="font-sans text-mist text-sm mt-1 max-w-xl">
            Verified field initiatives with active media ingestion, EXIF telemetry, and provenance chains.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-moss hover:bg-moss-bright text-bone font-sans text-xs font-medium tracking-wide transition-colors shadow-md cursor-pointer"
          >
            <PlusIcon size={16} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-clay/10 border border-clay/30 text-xs text-bone flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchProjects}
            className="text-moss-bright underline ml-4 hover:opacity-80"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-ink-soft border border-mist/15 animate-pulse space-y-4"
            >
              <div className="h-6 bg-mist/10 rounded w-3/4" />
              <div className="h-4 bg-mist/10 rounded w-1/2" />
              <div className="h-16 bg-mist/5 rounded w-full" />
              <div className="h-4 bg-mist/10 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          variant="projects"
          title="No conservation projects registered"
          description="Create your first project boundary to begin ingesting verified field media, tracking environmental restoration, and assembling cryptographic proof."
          actionText="Register First Project"
          actionIcon={<PlusIcon size={14} />}
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        /* Projects Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <Link
              key={project._id}
              href={`/projects/${project._id}`}
              className="block"
            >
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.08, ease: BRAND_EASING }}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-ink-soft border border-mist/15 hover:border-moss/50 transition-colors duration-200 h-full"
              >
              <div>
                {/* Status indicator top right */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-ink border border-mist/15 text-[10px] font-mono text-moss-bright">
                    <span className="w-1.5 h-1.5 rounded-full bg-moss-bright" />
                    <span>Active Telemetry</span>
                  </div>

                  <span className="text-[11px] font-mono text-mist/60">
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Project Title */}
                <h3 className="font-display text-xl text-bone group-hover:text-bone leading-tight tracking-tight mb-2">
                  {project.name}
                </h3>

                {/* Description */}
                <p className="font-sans text-mist text-xs leading-relaxed line-clamp-3 mb-6">
                  {project.description || "No conservation description provided for this site."}
                </p>
              </div>

              {/* Location telemetry footer */}
              <div className="pt-4 border-t border-mist/10 space-y-2">
                <div className="flex items-center gap-2 text-xs text-bone/90">
                  <SatellitePinIcon size={14} className="text-clay shrink-0" />
                  <span className="truncate">{project.location?.label || "Coordinate Locked"}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-mist/70 pt-1">
                  <span>
                    {project.location?.lat?.toFixed(4) || "0.0000"}°, {project.location?.lng?.toFixed(4) || "0.0000"}°
                  </span>
                  <span className="text-clay hover:underline cursor-pointer flex items-center gap-1">
                    <ShieldCheckIcon size={12} />
                    <span>Audit Chain</span>
                  </span>
                </div>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
