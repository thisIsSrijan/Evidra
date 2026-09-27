"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";
import { UploadIcon, ProjectsIcon } from "@/components/Icons";

interface ProjectItem {
  _id: string;
  name: string;
  description?: string;
  location?: { lat: number; lng: number; label: string };
}

export default function UploadPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data.projects || []);
        }
      } catch {
        // silent fail
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: BRAND_EASING }}
        className="pb-6 border-b border-mist/10"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-mist/20 bg-ink-soft text-xs text-mist mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-moss-bright" />
          <span>Ingestion Pipeline</span>
        </div>
        <h1 className="font-display text-3xl text-bone tracking-tight">
          Field Media Ingestion
        </h1>
        <p className="font-sans text-mist text-sm mt-1 max-w-xl">
          Select a project to upload raw photos and videos. Each upload is
          fingerprinted with a provenance hash and analyzed with AI content
          tagging.
        </p>
      </motion.div>

      {/* Project Selection Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-ink-soft border border-mist/15 animate-pulse space-y-3"
            >
              <div className="h-5 bg-mist/10 rounded w-2/3" />
              <div className="h-4 bg-mist/10 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="py-16 px-6 rounded-2xl bg-ink-soft border border-mist/15 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-ink border border-mist/20 flex items-center justify-center text-mist mb-4">
            <ProjectsIcon size={24} />
          </div>
          <h3 className="font-display text-lg text-bone mb-1">
            No projects available
          </h3>
          <p className="font-sans text-mist text-xs max-w-sm mb-4">
            Create a project from the dashboard first, then return here to
            upload media.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-moss hover:bg-moss-bright text-bone font-sans text-xs font-medium tracking-wide transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, index) => (
            <Link key={project._id} href={`/projects/${project._id}`}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.06,
                  ease: BRAND_EASING,
                }}
                className="group p-6 rounded-2xl bg-ink-soft border border-mist/15 hover:border-moss/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-ink border border-mist/20 flex items-center justify-center group-hover:border-moss/30 transition-colors">
                    <UploadIcon
                      size={20}
                      className="text-mist group-hover:text-moss-bright transition-colors"
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-bone leading-tight">
                      {project.name}
                    </h3>
                    {project.location?.label && (
                      <p className="font-sans text-[11px] text-mist">
                        {project.location.label}
                      </p>
                    )}
                  </div>
                </div>
                <p className="font-sans text-xs text-mist/70 group-hover:text-mist transition-colors">
                  Tap to open ingestion pipeline →
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
