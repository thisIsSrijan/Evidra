"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";

export function TheProblem() {
  const containerRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 85%", "end 20%"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], shouldReduceMotion ? [0, 0] : [30, -10]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.3], [0.4, 1]);

  return (
    <section
      id="problem"
      ref={containerRef}
      className="relative py-24 md:py-36 px-6 bg-ink border-t border-mist/10"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div
          style={{ y: contentY, opacity: contentOpacity }}
          transition={{ ease: BRAND_EASING }}
        >
          {/* Section Marker */}
          <div className="mb-6">
            <span className="text-xs uppercase font-sans tracking-widest text-clay font-medium">
              The Reality Gap
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Headline Column */}
            <div className="lg:col-span-6">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-bone leading-[1.15] tracking-tight">
                Authentic field impact is lost in chat threads, missing EXIF tags, and donor skepticism.
              </h2>
            </div>

            {/* Right Editorial Copy Column */}
            <div className="lg:col-span-6 space-y-6 text-mist font-sans text-base sm:text-lg leading-relaxed">
              <p>
                Environmental NGOs and conservationists do heroic on-the-ground restoration across thousands of remote hectares. Yet when reporting back to donors, institutional funds, and carbon verifiers, they hit a wall of well-founded skepticism.
              </p>

              <p>
                Field staff capture thousands of before-and-after photos on personal phones and messaging apps. Critical geodata is stripped on upload, capture dates blur into unorganized folders, and manually finding matching camera angles years later takes weeks of tedious spreadsheet detective work.
              </p>

              <p>
                In the absence of an unbroken, cryptographic chain of custody, legitimate impact stories get diluted into glossy marketing — indistinguishable from greenwashing.
              </p>

              {/* Data Callout Block in ink-soft with clay accent */}
              <div className="pt-4">
                <div className="p-6 rounded-xl bg-ink-soft border border-mist/15 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-clay" />
                  <p className="text-sm text-bone font-medium mb-1">
                    The Donor Dilemma
                  </p>
                  <p className="text-xs text-mist leading-normal">
                    Over 68% of impact donors cite lack of verified visual evidence as their primary hesitation before re-committing multi-year grant funding.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
