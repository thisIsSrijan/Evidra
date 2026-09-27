"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { BRAND_EASING } from "@/lib/motion";

interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "accent" | "outline";
  className?: string;
  href?: string;
}

export function MagneticButton({
  children,
  onClick,
  variant = "primary",
  className = "",
  href,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth magnetic pull spring physics
  const springX = useSpring(x, { stiffness: 140, damping: 14, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 140, damping: 14, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Calculate distance from center, capped dampening
    const distanceX = (e.clientX - centerX) * 0.32;
    const distanceY = (e.clientY - centerY) * 0.32;
    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const baseStyles =
    "relative inline-flex items-center justify-center font-sans text-sm font-medium tracking-wide px-6 py-3.5 rounded-full transition-colors duration-200 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-moss-bright/50";

  const variantStyles = {
    primary: "bg-moss text-bone hover:bg-moss-bright shadow-sm active:bg-moss",
    accent: "bg-clay text-ink hover:brightness-105 shadow-sm active:bg-clay",
    outline: "border border-mist/40 text-bone hover:border-bone hover:bg-ink-soft active:bg-ink-soft",
  };

  const content = (
    <motion.div
      ref={ref}
      style={shouldReduceMotion ? undefined : { x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={shouldReduceMotion ? {} : { scale: 1.025 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.975 }}
      transition={{ ease: BRAND_EASING, duration: 0.3 }}
      className="inline-block"
    >
      <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
        {children}
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} onClick={onClick} className="inline-block">
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className="inline-block bg-transparent border-0 p-0 focus:outline-none">
      {content}
    </button>
  );
}
