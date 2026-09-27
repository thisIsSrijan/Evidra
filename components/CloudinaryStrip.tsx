"use client";

import React from "react";
import { ShieldCheckIcon, SatellitePinIcon, LeafIcon } from "./Icons";

export function CloudinaryStrip() {
  return (
    <section className="py-16 px-6 bg-ink-soft/60 border-t border-b border-mist/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left badge / title */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-ink border border-mist/20 flex items-center justify-center text-moss-bright">
              {/* Cloud / storage geometric mark */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
              </svg>
            </div>
            <div>
              <span className="block text-[11px] font-mono uppercase tracking-widest text-clay">
                Infrastructure Partner
              </span>
              <h3 className="font-display text-xl text-bone">
                Built on Cloudinary Media Cloud
              </h3>
            </div>
          </div>

          {/* Clean horizontal capability strip (not a bullet list) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full lg:w-auto">
            {/* Capability 1 */}
            <div className="p-4 rounded-xl bg-ink/70 border border-mist/15 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheckIcon size={16} className="text-moss-bright" />
                <span className="font-sans text-xs font-semibold text-bone">
                  Signed Provenance
                </span>
              </div>
              <p className="font-sans text-xs text-mist leading-relaxed">
                Immutable version tracking, cryptographic signatures & tamper-evident delivery URLs.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="p-4 rounded-xl bg-ink/70 border border-mist/15 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <SatellitePinIcon size={16} className="text-moss-bright" />
                <span className="font-sans text-xs font-semibold text-bone">
                  AI Content Analysis
                </span>
              </div>
              <p className="font-sans text-xs text-mist leading-relaxed">
                Automated scene tagging, contextual captions & smart gravity-aware focal centering.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="p-4 rounded-xl bg-ink/70 border border-mist/15 flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <LeafIcon size={16} className="text-moss-bright" />
                <span className="font-sans text-xs font-semibold text-bone">
                  Structured Metadata
                </span>
              </div>
              <p className="font-sans text-xs text-mist leading-relaxed">
                Persistent GPS coordinates, capture dates, and phase taxonomy preserved at scale.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
