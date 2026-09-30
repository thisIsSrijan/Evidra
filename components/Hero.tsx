"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useSession } from "next-auth/react";
import { MagneticButton } from "./MagneticButton";
import { ArrowDownIcon, ShieldCheckIcon } from "./Icons";
import { BRAND_EASING } from "@/lib/motion";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const primaryCtaHref = isAuthenticated ? "/dashboard" : "/signup";
  const primaryCtaLabel = isAuthenticated ? "Go to Dashboard" : "Start a project";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: BRAND_EASING,
      },
    },
  };

  return (
    <section className="relative min-h-[90vh] flex flex-col justify-between pt-16 md:pt-24 pb-12 px-6 overflow-hidden grain-overlay">
      {/* Background ambient lighting subtle tint */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-moss/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full relative z-10 my-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl"
        >
          {/* Integrity Pill Tag */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-mist/25 bg-ink-soft/80 backdrop-blur-sm text-xs text-mist mb-8">
            <span className="w-2 h-2 rounded-full bg-clay" />
            <span className="font-sans tracking-wide">
              The Anti-Greenwashing Media Platform for NGOs
            </span>
          </motion.div>

          {/* Fraunces Headline */}
          <motion.h1
            variants={itemVariants}
            className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] text-bone font-normal leading-[1.06] tracking-[-0.03em] mb-6"
          >
            Turn raw field evidence into provable impact.
          </motion.h1>

          {/* One-line subhead */}
          <motion.p
            variants={itemVariants}
            className="font-sans text-mist text-lg md:text-xl lg:text-2xl font-light leading-relaxed max-w-3xl mb-10"
          >
            Evidra turns unstructured conservation photos into cryptographic provenance, auto-paired timelines, and donor-ready impact intelligence.
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <MagneticButton variant="primary" href={primaryCtaHref}>
              {primaryCtaLabel}
            </MagneticButton>

            <MagneticButton variant="outline" href="#pillars">
              <span className="flex items-center gap-2">
                <ShieldCheckIcon size={16} className="text-clay" />
                How verification works
              </span>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll-cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="max-w-6xl mx-auto w-full flex items-center justify-between pt-12 border-t border-mist/10 text-xs text-mist font-sans"
      >
        <span className="tracking-widest uppercase text-[11px] text-mist/80">
          Scroll to explore the architecture
        </span>
        <motion.a
          href="#problem"
          aria-label="Scroll down to problem statement"
          animate={shouldReduceMotion ? {} : { y: [0, 6, 0] }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            ease: BRAND_EASING,
          }}
          className="p-2 rounded-full border border-mist/20 text-bone/70 hover:text-bone hover:border-mist/60 transition-colors"
        >
          <ArrowDownIcon size={16} />
        </motion.a>
      </motion.div>
    </section>
  );
}
