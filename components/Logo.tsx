"use client";

import React from "react";
import Link from "next/link";

interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 30, className = "" }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Leaf shape: moss #3F5A44 */}
      <path
        d="M12 30 C12 18 24 8 36 8 C36 20 24 30 12 30 Z"
        fill="#3F5A44"
      />
      {/* Leaf vein */}
      <line
        x1="14"
        y1="28"
        x2="33"
        y2="11"
        stroke="#F5F1E8"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Verified badge: clay #D98E4A */}
      <circle cx="34" cy="34" r="8" fill="#D98E4A" />
      {/* Checkmark: ink #0F1210 */}
      <path
        d="M30 34 L33 37 L39 30"
        fill="none"
        stroke="#0F1210"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  hideWordmarkOnMobile?: boolean;
  className?: string;
  asLink?: boolean;
  href?: string;
}

export function Logo({
  size = 30,
  showWordmark = true,
  wordmarkClassName = "text-xl font-display font-medium lowercase tracking-tight text-bone",
  hideWordmarkOnMobile = true,
  className = "",
  asLink = false,
  href = "/",
}: LogoProps) {
  const content = (
    <span className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <LogoMark size={size} />
      {showWordmark && (
        <span
          className={`${wordmarkClassName} ${
            hideWordmarkOnMobile ? "hidden sm:inline-block" : "inline-block"
          }`}
        >
          evidra
        </span>
      )}
    </span>
  );

  if (asLink) {
    return (
      <Link
        href={href}
        className="inline-flex items-center focus:outline-none hover:opacity-90 transition-opacity"
      >
        {content}
      </Link>
    );
  }

  return content;
}
