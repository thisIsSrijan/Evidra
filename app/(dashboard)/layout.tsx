import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { DashboardNav } from "@/components/DashboardNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-ink text-bone font-sans flex flex-col">
      {/* Navigation (Sidebar on Desktop, Tab Bar on Mobile) */}
      <DashboardNav
        user={{
          name: session.user.name,
          email: session.user.email,
          orgName: (session.user as { orgName?: string }).orgName,
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* Mobile Top Header (below lg) */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-ink-soft/90 backdrop-blur-md border-b border-mist/15">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-moss/30 border border-moss-bright/40 flex items-center justify-center text-moss-bright font-bold text-xs">
              E
            </div>
            <span className="font-display font-medium text-sm text-bone">
              GroundTruth
            </span>
          </div>

          <div className="text-right">
            <span className="block text-[11px] font-sans font-medium text-bone truncate max-w-[140px]">
              {(session.user as { orgName?: string }).orgName || session.user.name}
            </span>
          </div>
        </header>

        {/* Inner Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 pb-28 lg:pb-12 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
