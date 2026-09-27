"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloseIcon, PlusIcon, SatellitePinIcon } from "./Icons";
import { BRAND_EASING } from "@/lib/motion";

export interface CreatedProject {
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

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProject: CreatedProject) => void;
}

export function NewProjectModal({
  isOpen,
  onClose,
  onProjectCreated,
}: NewProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please provide a project name.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          location: {
            label: locationLabel.trim() || "Unspecified Location",
            lat: parseFloat(lat) || 0,
            lng: parseFloat(lng) || 0,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create project.");
        setIsSubmitting(false);
        return;
      }

      // Reset form & notify parent
      setName("");
      setDescription("");
      setLocationLabel("");
      setLat("");
      setLng("");
      setIsSubmitting(false);
      onProjectCreated(data.project);
      onClose();
    } catch {
      setError("Network error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-ink/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.35, ease: BRAND_EASING }}
            className="relative w-full max-w-lg bg-ink-soft border border-mist/20 rounded-2xl p-6 sm:p-8 shadow-2xl z-10 select-none max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-mist/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-moss/20 border border-moss-bright/30 flex items-center justify-center text-moss-bright">
                  <SatellitePinIcon size={16} />
                </div>
                <div>
                  <h3 className="font-display text-xl text-bone">
                    Register New Project
                  </h3>
                  <p className="text-xs text-mist font-sans">
                    Establish a verifiable site for evidence clustering.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-mist hover:text-bone hover:bg-ink rounded-lg transition-colors cursor-pointer"
              >
                <CloseIcon size={18} />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-clay/10 border border-clay/30 text-xs text-bone flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-clay shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-sans text-mist mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tsavo Watershed Basin #05"
                  className="w-full px-4 py-2.5 rounded-xl bg-ink border border-mist/20 text-bone placeholder-mist/40 text-sm focus:outline-none focus:border-moss-bright focus:ring-1 focus:ring-moss-bright transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-sans text-mist mb-1.5">
                  Conservation Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of ecological intervention, target hectares, and monitoring objectives..."
                  className="w-full px-4 py-2.5 rounded-xl bg-ink border border-mist/20 text-bone placeholder-mist/40 text-sm focus:outline-none focus:border-moss-bright focus:ring-1 focus:ring-moss-bright transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-sans text-mist mb-1.5">
                  Location Name / Community Zone
                </label>
                <input
                  type="text"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  placeholder="e.g. Taita Hills Catchment, Kenya"
                  className="w-full px-4 py-2.5 rounded-xl bg-ink border border-mist/20 text-bone placeholder-mist/40 text-sm focus:outline-none focus:border-moss-bright focus:ring-1 focus:ring-moss-bright transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-sans text-mist mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="-3.3167"
                    className="w-full px-4 py-2.5 rounded-xl bg-ink border border-mist/20 text-bone placeholder-mist/40 text-sm focus:outline-none focus:border-moss-bright focus:ring-1 focus:ring-moss-bright transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-sans text-mist mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="38.5833"
                    className="w-full px-4 py-2.5 rounded-xl bg-ink border border-mist/20 text-bone placeholder-mist/40 text-sm focus:outline-none focus:border-moss-bright focus:ring-1 focus:ring-moss-bright transition-colors font-mono"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-mist/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-mist/20 text-mist hover:text-bone hover:border-mist/50 text-xs font-sans font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-moss hover:bg-moss-bright text-bone text-xs font-sans font-medium tracking-wide transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-3.5 h-3.5 border-2 border-bone/30 border-t-bone rounded-full animate-spin" />
                  ) : (
                    <>
                      <PlusIcon size={14} />
                      <span>Establish Project</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
