"use client";

import React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { LogoutIcon } from "@/components/Icons";

interface MobileHeaderProps {
  displayName: string;
}

export function MobileHeader({ displayName }: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-ink-soft/90 backdrop-blur-md border-b border-mist/15">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-moss/30 border border-moss-bright/40 flex items-center justify-center text-moss-bright font-bold text-xs">
          E
        </div>
        <span className="font-display font-medium text-sm text-bone">
          GroundTruth
        </span>
      </Link>

      <div className="flex items-center gap-2.5">
        <span className="block text-[11px] font-sans font-medium text-bone truncate max-w-[130px]">
          {displayName}
        </span>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign Out"
          aria-label="Sign Out"
          className="p-1.5 rounded-lg text-mist hover:text-clay hover:bg-ink transition-colors cursor-pointer"
        >
          <LogoutIcon size={15} />
        </button>
      </div>
    </header>
  );
}
