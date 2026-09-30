"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { LogoutIcon } from "@/components/Icons";
import { Logo } from "@/components/Logo";

interface MobileHeaderProps {
  displayName: string;
}

export function MobileHeader({ displayName }: MobileHeaderProps) {
  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-ink-soft/90 backdrop-blur-md border-b border-mist/15 select-none">
      <Logo size={24} asLink href="/dashboard" hideWordmarkOnMobile={false} wordmarkClassName="font-display font-semibold text-base text-bone lowercase tracking-tight" />

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
