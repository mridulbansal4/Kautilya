/** Framer Motion presets bound to DESIGN.md §6 (duration + easing tokens). */
import type { Transition, Variants } from "framer-motion";

export const EASE = {
  standard: [0.2, 0, 0, 1] as const,
  decelerate: [0, 0, 0, 1] as const,
  accelerate: [0.3, 0, 1, 1] as const,
};

export const SPRING: Transition = { type: "spring", stiffness: 320, damping: 30, mass: 0.9 };
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 140, damping: 20 };

// AIInsightCard entry (DESIGN.md §8.2): translateY(+16 → 0) + fade, 300ms, ease-decelerate
export const aiCardEnter: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: EASE.decelerate } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: EASE.accelerate } },
};

// staggered list/grid reveal
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: EASE.decelerate } },
};

// persona morph — the whole phone re-renders; cross-fade + soft rise
export const personaMorph: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE.decelerate } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: EASE.accelerate } },
};

// bottom sheet
export const sheet: Variants = {
  hidden: { y: "100%" },
  show: { y: 0, transition: { duration: 0.3, ease: EASE.decelerate } },
  exit: { y: "100%", transition: { duration: 0.25, ease: EASE.accelerate } },
};
