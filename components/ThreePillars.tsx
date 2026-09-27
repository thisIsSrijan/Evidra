"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { FingerprintIcon, SatellitePinIcon, LeafIcon } from "./Icons";
import { BRAND_EASING } from "@/lib/motion";

interface Pillar {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: (props: { size?: number; className?: string }) => React.JSX.Element;
  features: string[];
}

const PILLARS: Pillar[] = [
  {
    number: "01",
    title: "Provenance Chain",
    subtitle: "Anti-Greenwashing Ingestion",
    description:
      "Every uploaded asset is cryptographically fingerprinted at ingestion using its Cloudinary public_id, version, signed delivery URL, and extracted EXIF geodata. Every piece of media receives a public chain-of-custody verification URL proving it was never altered.",
    badge: "Donor Trust Shield",
    icon: FingerprintIcon,
    features: [
      "Signed delivery URLs & SHA-256 fingerprinting",
      "Tamper-proof EXIF & timestamp preservation",
      "Public /verify/[assetId] audit page for donors",
    ],
  },
  {
    number: "02",
    title: "Auto-Pairing Before/After Engine",
    subtitle: "AI Spatial & Temporal Clustering",
    description:
      "Intelligently clusters media by project coordinates, capture chronology, and semantic similarity via Cloudinary auto-tags and Gemini reasoning. The engine auto-discovers before→after progression pairs ready for interactive comparison.",
    badge: "Gemini + Cloudinary Reasoning",
    icon: SatellitePinIcon,
    features: [
      "GPS coordinate clustering & telemetry matching",
      "Visual semantic similarity with Cloudinary AI captions",
      "Interactive draggable before/after slider generation",
    ],
  },
  {
    number: "03",
    title: "One-Click Impact Story Generator",
    subtitle: "Evidence-Backed Narrative & Montage",
    description:
      "Gemini synthesizes a compelling, data-grounded impact narrative from verified evidence clusters. Simultaneously, Cloudinary assembles dynamic visual collateral — from multi-asset transformation collages to short video montages.",
    badge: "Multi-Modal Synthesis",
    icon: LeafIcon,
    features: [
      "Donor-ready narrative reports grounded in verified data",
      "Cloudinary dynamic collages with g_auto face/subject focus",
      "Exportable, audited impact summaries with shareable slugs",
    ],
  },
];

export function ThreePillars() {
  const sectionRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "end 20%"],
  });

  return (
    <section
      id="pillars"
      ref={sectionRef}
      className="relative py-24 md:py-36 px-6 bg-ink-soft/40 border-t border-mist/10"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-2xl mb-16 md:mb-20">
          <span className="text-xs uppercase font-sans tracking-widest text-clay font-medium block mb-3">
            Core Architecture
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-bone leading-tight tracking-tight mb-4">
            The Three Pillars of GroundTruth
          </h2>
          <p className="font-sans text-mist text-base sm:text-lg leading-relaxed">
            Every feature in Evidra serves one core mission: turning fragmented field media into unassailable, donor-ready evidence.
          </p>
        </div>

        {/* Pillars Grid with Staggered Scroll-Linked Reveals */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;

            // Staggered scroll transforms per pillar card
            const startRange = index * 0.12;
            const endRange = startRange + 0.35;

            // eslint-disable-next-line react-hooks/rules-of-hooks
            const cardY = useTransform(
              scrollYProgress,
              [startRange, Math.min(endRange, 1)],
              shouldReduceMotion ? [0, 0] : [40, 0]
            );

            // eslint-disable-next-line react-hooks/rules-of-hooks
            const cardOpacity = useTransform(
              scrollYProgress,
              [startRange, Math.min(endRange, 1)],
              [0.3, 1]
            );

            return (
              <motion.div
                key={pillar.title}
                style={{ y: cardY, opacity: cardOpacity }}
                transition={{ ease: BRAND_EASING }}
                className="group relative flex flex-col justify-between p-8 rounded-2xl bg-ink border border-mist/15 hover:border-moss/50 transition-colors duration-300 overflow-hidden"
              >
                {/* Subtle top indicator bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-transparent group-hover:bg-moss transition-colors duration-300" />

                <div>
                  {/* Top row: Number & Icon */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-display text-2xl text-mist/40 font-normal">
                      {pillar.number}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-ink-soft border border-mist/20 flex items-center justify-center text-moss-bright group-hover:border-moss-bright/50 group-hover:bg-moss/10 transition-colors">
                      <Icon size={24} />
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="inline-block text-[11px] font-sans tracking-wider uppercase px-2.5 py-1 rounded bg-ink-soft border border-mist/20 text-mist mb-4">
                    {pillar.badge}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-display text-2xl text-bone mb-2 tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-clay font-sans uppercase tracking-wider mb-4">
                    {pillar.subtitle}
                  </p>

                  {/* Left-aligned description */}
                  <p className="font-sans text-mist text-sm leading-relaxed mb-8">
                    {pillar.description}
                  </p>
                </div>

                {/* Features checklist (single-weight stroke tick) */}
                <div className="pt-6 border-t border-mist/10 space-y-2.5">
                  {pillar.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5 text-xs text-bone/80">
                      <span className="mt-0.5 text-moss-bright font-mono text-[11px]">→</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
