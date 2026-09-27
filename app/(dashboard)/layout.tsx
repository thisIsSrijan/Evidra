import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { DashboardNav } from "@/components/DashboardNav";
import { MobileHeader } from "@/components/MobileHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  const displayName =
    (session.user as { orgName?: string }).orgName || session.user.name || "Field Officer";

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
        <MobileHeader displayName={displayName} />

        {/* Inner Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 pb-28 lg:pb-12 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
