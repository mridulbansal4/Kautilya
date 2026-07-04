/**
 * <SBIButton> — DESIGN.md §5.1. Variants: primary | secondary | ghost | danger | ai.
 * States: default · hover · pressed (scale 0.97) · focused (ring) · disabled.
 * The `ai` variant is the ONLY button permitted purple (DESIGN.md §8.3 Rule 5).
 */
import { motion } from "framer-motion";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { PhIcon } from "../../lib/icons";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "ai";

// framer-motion's drag/animation handlers clash with React's native ones — drop them.
type NativeButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd"
>;

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-brand text-content-inverse shadow-e2 hover:bg-brand-dark active:bg-[var(--colour-blue-900)]",
  secondary:
    "bg-transparent text-brand border-2 border-brand hover:bg-brand-50",
  ghost: "bg-transparent text-brand hover:underline",
  danger: "bg-debit text-content-inverse hover:brightness-95",
  ai: "bg-ai text-white shadow-ai hover:brightness-110",
};

export function SBIButton({
  variant = "primary",
  icon,
  children,
  full,
  className = "",
  disabled,
  ...rest
}: {
  variant?: Variant;
  icon?: string;
  children: ReactNode;
  full?: boolean;
} & NativeButtonProps) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97, y: 1 }}
      transition={{ duration: 0.08 }}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-sm px-6 t-label",
        "min-h-[48px] select-none transition-colors duration-150",
        "disabled:bg-line disabled:text-content-disabled disabled:shadow-none disabled:cursor-not-allowed",
        full ? "w-full" : "",
        VARIANT[variant],
        className,
      ].join(" ")}
      {...rest}
    >
      {icon && <PhIcon name={icon} size={18} weight="bold" />}
      <span style={{ letterSpacing: "0.02em" }}>{children}</span>
    </motion.button>
  );
}
