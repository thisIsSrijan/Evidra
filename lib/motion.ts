import { Transition } from "framer-motion";

/**
 * Evidra Motion House Rules:
 * - Custom cubic-bezier easing [0.22, 1, 0.36, 1] everywhere, never default ease.
 * - Respect prefers-reduced-motion and disable non-essential motion for that setting.
 */
export const BRAND_EASING: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const defaultTransition: Transition = {
  duration: 0.6,
  ease: BRAND_EASING,
};

export const springTransition: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 20,
};
