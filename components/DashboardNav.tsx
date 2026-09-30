"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ProjectsIcon,
  UploadIcon,
  SearchIcon,
  ReportsIcon,
  LogoutIcon,
} from "@/components/Icons";
import { Logo } from "@/components/Logo";

interface DashboardNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    orgName?: string | null;
  };
}

const NAV_ITEMS = [
  { name: "Projects", href: "/dashboard", icon: ProjectsIcon },
  { name: "Upload", href: "/upload", icon: UploadIcon },
  { name: "Search", href: "/search", icon: SearchIcon },
  { name: "Reports", href: "/reports", icon: ReportsIcon },
];

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* 1. Desktop Left Sidebar (lg and above) */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-30 w-64 flex-col justify-between bg-ink-soft border-r border-mist/15 select-none">
        {/* Brand identity header */}
        <div className="p-6">
          <Link href="/dashboard" className="flex flex-col gap-1.5 group">
            <Logo size={28} hideWordmarkOnMobile={false} />
            <span className="text-[10px] uppercase font-sans tracking-widest text-mist/60 pl-0.5">
              by HouseOfStellar
            </span>
          </Link>

          {/* Org tag */}
          <div className="mt-6 px-3 py-2 rounded-xl bg-ink border border-mist/15">
            <span className="block text-[10px] uppercase tracking-wider font-mono text-clay">
              Verified Organization
            </span>
            <span className="block text-xs font-sans text-bone truncate mt-0.5 font-medium">
              {user.orgName || "Conservation Partner"}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-sans text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-moss text-bone shadow-sm"
                      : "text-mist hover:text-bone hover:bg-ink"
                  }`}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-bone" : "text-mist"}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out footer */}
        <div className="p-4 m-3 rounded-xl bg-ink border border-mist/15">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-bone truncate">
                {user.name || "Field Officer"}
              </p>
              <p className="text-[11px] font-mono text-mist/70 truncate">
                {user.email || ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              title="Sign Out"
              className="p-2 rounded-lg text-mist hover:text-clay hover:bg-ink-soft transition-colors cursor-pointer"
            >
              <LogoutIcon size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Bottom Tab Bar (below lg breakpoint) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-ink-soft/95 backdrop-blur-lg border-t border-mist/15 px-3 py-2 select-none">
        <div className="grid grid-cols-4 items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-center transition-colors ${
                  isActive ? "text-moss-bright" : "text-mist hover:text-bone"
                }`}
              >
                <div
                  className={`p-1 rounded-md ${
                    isActive ? "bg-moss/20" : "bg-transparent"
                  }`}
                >
                  <Icon size={18} />
                </div>
                <span className="text-[10px] font-sans font-medium mt-1">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
