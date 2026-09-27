"use client";

import React from "react";
import { ShieldCheckIcon } from "./Icons";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-mist/10 bg-ink/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-moss/30 border border-moss-bright/40 flex items-center justify-center text-moss-bright">
            <span className="font-display font-bold text-lg leading-none">E</span>
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg tracking-tight text-bone font-semibold leading-tight">
              GroundTruth
            </span>
            <span className="text-[10px] uppercase font-sans tracking-widest text-mist">
              By Evidra
            </span>
          </div>
        </div>

        {/* Verification status badge & action */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full border border-mist/20 bg-ink-soft text-xs text-mist">
            <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
            <span>Provenance Network Active</span>
          </div>

          <a
            href="#demo"
            className="inline-flex items-center gap-1.5 text-xs text-bone/90 hover:text-bone px-3 py-1.5 rounded-md border border-mist/20 hover:border-mist/50 transition-colors"
          >
            <ShieldCheckIcon size={14} className="text-clay" />
            <span>Verify Assets</span>
          </a>
        </div>
      </div>
    </header>
  );
}
