"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Logo } from "./Logo";
import { MagneticButton } from "./MagneticButton";

export function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-mist/10 bg-ink/90 backdrop-blur-md transition-colors select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand identity on left */}
        <div className="flex items-center gap-3 shrink-0">
          <Logo size={30} asLink href="/" hideWordmarkOnMobile={true} />
          <span className="hidden md:inline-block text-[10px] uppercase font-sans tracking-widest text-mist/60 pl-2.5 border-l border-mist/20">
            by HouseOfStellar
          </span>
        </div>

        {/* Center / Ambient status indicator (hidden on smaller screens) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-mist/15 bg-ink-soft text-[11px] text-mist font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
          <span>Provenance Chain Active</span>
        </div>

        {/* Right side navigation & CTAs */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs font-mono text-mist truncate max-w-[140px]">
                {session?.user?.name || session?.user?.email}
              </span>
              <MagneticButton
                variant="primary"
                href="/dashboard"
                className="!py-2 !px-4 text-xs font-medium"
              >
                Dashboard →
              </MagneticButton>
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-sans font-medium text-mist hover:text-bone transition-colors px-1 py-1"
              >
                Log in
              </Link>
              <MagneticButton
                variant="primary"
                href="/signup"
                className="!py-2 !px-4 text-xs font-medium shadow-md"
              >
                Get started
              </MagneticButton>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
