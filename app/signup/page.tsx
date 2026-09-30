"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";
import { LeafIcon } from "@/components/Icons";
import { Logo } from "@/components/Logo";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    orgName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create account.");
        setIsLoading(false);
        return;
      }

      // Automatically sign in the newly registered user
      const loginRes = await signIn("credentials", {
        email: formData.email.trim(),
        password: formData.password,
        redirect: false,
      });

      if (loginRes?.error) {
        // If auto login fails for any reason, redirect to login page
        router.push("/login?registered=true");
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
            Register your organization
          </h1>
          <p className="mt-2 text-sm text-mist font-sans">
            Start issuing cryptographic field evidence and impact reports.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs uppercase tracking-wider font-sans text-mist mb-1.5"
              >
                Your Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. Jane M. Kariuki"
                className="w-full px-4 py-3 rounded-xl bg-ink border border-mist/20 text-bone placeholder-mist/40 text-sm focus:outline-none focus:border-moss-bright focus:ring-1 focus:ring-moss-bright transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="orgName"
                className="block text-xs uppercase tracking-wider font-sans text-mist mb-1.5"
              >
                Organization / NGO Name
              </label>
              <input
                id="orgName"
                name="orgName"
                type="text"
                required
                value={formData.orgName}
                onChange={handleChange}
                placeholder="East Africa Watershed Conservation Alliance"
                className="w-full px-4 py-3 rounded-xl bg-ink border border-mist/20 text-bone placeholder-mist/40 text-sm focus:outline-none focus:border-moss-bright focus:ring-1 focus:ring-moss-bright transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-wider font-sans text-mist mb-1.5"
              >
                Work Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@conservation.org"
                className="w-full px-4 py-3 rounded-xl bg-ink border border-mist/20 text-bone placeholder-mist/40 text-sm focus:outline-none focus:border-moss-bright focus:ring-1 focus:ring-moss-bright transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs uppercase tracking-wider font-sans text-mist mb-1.5"
              >
                Password (min 6 characters)
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-xl bg-ink border border-mist/20 text-bone placeholder-mist/40 text-sm focus:outline-none focus:border-moss-bright focus:ring-1 focus:ring-moss-bright transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-moss hover:bg-moss-bright text-bone font-sans text-sm font-medium tracking-wide transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-bone/30 border-t-bone rounded-full animate-spin" />
              ) : (
                <>
                  <LeafIcon size={16} className="text-bone" />
                  <span>Create Organization Account</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom link */}
          <div className="mt-8 pt-6 border-t border-mist/10 flex items-center justify-between text-xs font-sans text-mist">
            <span>Already have an account?</span>
            <Link
              href="/login"
              className="text-moss-bright hover:underline font-medium"
            >
              Log in →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
