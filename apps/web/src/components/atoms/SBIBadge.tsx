/** <SBIBadge> — DESIGN.md §5.1 status badge. Variants incl. AI (purple). */
import type { ReactNode } from "react";

type Variant = "success" | "warning" | "error" | "neutral" | "ai" | "brand";

const VARIANT: Record<Variant, string> = {
  success: "bg-[var(--colour-green-50)] text-credit",
  warning: "bg-[var(--colour-amber-50)] text-[var(--colour-amber-900)]",
  error: "bg-[var(--colour-red-50)] text-debit",
  neutral: "bg-[var(--colour-neutral-100)] text-content-secondary",
  ai: "bg-ai-surface text-ai border border-ai-border",
  brand: "bg-brand-50 text-brand",
};

export function SBIBadge({
  variant = "neutral",
  children,
  className = "",
}: {
  variant?: Variant;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-1 t-label-sm whitespace-nowrap",
        VARIANT[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
