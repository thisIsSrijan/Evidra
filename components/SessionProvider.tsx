"use client";

import React from "react";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { MotionConfig } from "framer-motion";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </NextAuthSessionProvider>
  );
}
