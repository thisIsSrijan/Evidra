"use client";

import React from "react";

export function Footer() {
  return (
    <footer className="w-full bg-ink border-t border-mist/10 py-16 px-6 text-mist font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Left Column: Brand and brief summary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-display text-xl text-bone font-semibold">
              GroundTruth
            </span>
            <span className="text-xs text-mist/60 uppercase tracking-widest font-mono">
              v1.0
            </span>
          </div>
          <p className="text-xs text-mist/80 max-w-md leading-relaxed">
            Evidra turns raw field evidence into provable donor trust through cryptographic media provenance, spatial auto-pairing, and AI impact reporting.
          </p>
        </div>

        {/* Right Column: Hackathon attribution */}
        <div className="flex flex-col items-start md:items-end text-xs">
          <span className="font-mono text-bone font-medium">
            Code Cubicles 6.0
          </span>
          <span className="text-mist/70 mt-1">
            Cloudinary Track: AI-Powered Impact &amp; Sustainability Media Platform
          </span>
          <span className="text-mist/50 text-[11px] mt-2 font-mono">
            Evidra Engineering • All rights reserved
          </span>
        </div>
      </div>
    </footer>
  );
}
