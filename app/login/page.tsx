"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";
import { ShieldCheckIcon } from "@/components/Icons";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error || "Authentication failed. Please verify credentials.");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An unexpected network error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex flex-col justify-center py-12 sm:px-6 lg:px-8 grain-overlay select-none">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand header */}
        <div className="text-left mb-8">
          <div className="mb-4">
            <Logo size={32} asLink href="/" hideWordmarkOnMobile={false} />
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-bone font-normal tracking-tight">
            Sign in to your console
          </h1>
          <p className="mt-2 text-sm text-mist font-sans">
            Access verified field evidence and provenance reports.
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: BRAND_EASING }}
          className="bg-ink-soft border border-mist/20 rounded-2xl p-6 sm:p-8 shadow-2xl relative"
        >
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-clay/10 border border-clay/30 text-xs text-bone flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-clay mt-1.5 shrink-0" />
              <div className="flex-1 font-sans">{error}</div>
            </div>
          )}

          {/* Judge & Demo Credentials Callout */}
          <div className="mb-6 p-4 rounded-xl bg-ink border border-moss/30 shadow-inner">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-moss-bright font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-clay animate-pulse" />
                Judge &amp; Demo Credentials
              </span>
              <button
                type="button"
                onClick={() => {
                  setEmail("wangari@greenbelt.org");
                  setPassword("password123");
                }}
                className="text-[11px] font-mono text-clay hover:underline focus:outline-none cursor-pointer"
              >
                Auto-fill ⚡
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-ink-soft border border-mist/10 text-mist">
                <span className="text-mist/60 block text-[10px] uppercase">Email</span>
                <span className="text-bone select-all font-medium">wangari@greenbelt.org</span>
              </div>
              <div className="p-2 rounded bg-ink-soft border border-mist/10 text-mist">
                <span className="text-mist/60 block text-[10px] uppercase">Password</span>
                <span className="text-bone select-all font-medium">password123</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-wider font-sans text-mist mb-2"
              >
                Work Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.org"
                className="w-full px-4 py-3 rounded-xl bg-ink border border-mist/20 text-bone placeholder-mist/40 text-sm focus:outline-none focus:border-moss-bright focus:ring-1 focus:ring-moss-bright transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs uppercase tracking-wider font-sans text-mist mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-ink border border-mist/20 text-bone placeholder-mist/40 text-sm focus:outline-none focus:border-moss-bright focus:ring-1 focus:ring-moss-bright transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-6 rounded-xl bg-moss hover:bg-moss-bright text-bone font-sans text-sm font-medium tracking-wide transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-bone/30 border-t-bone rounded-full animate-spin" />
              ) : (
                <>
                  <ShieldCheckIcon size={16} className="text-bone" />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom link */}
          <div className="mt-8 pt-6 border-t border-mist/10 flex items-center justify-between text-xs font-sans text-mist">
            <span>New here?</span>
            <Link
              href="/signup"
              className="text-moss-bright hover:underline font-medium"
            >
              Create an account →
            </Link>
          </div>
        </motion.div>

        {/* Audit footer note */}
        <p className="mt-8 text-center text-xs font-mono text-mist/50">
          Encrypted Session • SHA-256 Verified
        </p>
      </div>
    </div>
  );
}
