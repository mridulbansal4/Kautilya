/**
 * <AITransactionTag> — DESIGN.md §8.2. Inline category chip after a merchant name. 18dp,
 * never wraps. Icon-only fallback if space is tight. (No emojis — Phosphor category icons.)
 */
import { PhIcon } from "../../lib/icons";

const CAT: Record<string, { icon: string; cls: string }> = {
  Groceries: { icon: "ShoppingCart", cls: "text-cat-shopping" },
  Food: { icon: "ForkKnife", cls: "text-cat-food" },
  Bills: { icon: "Receipt", cls: "text-cat-bills" },
  Education: { icon: "GraduationCap", cls: "text-cat-travel" },
  Income: { icon: "CurrencyInr", cls: "text-credit" },
};

export function AITransactionTag({ category, iconOnly }: { category: string; iconOnly?: boolean }) {
  const meta = CAT[category] ?? { icon: "ChartPieSlice", cls: "text-content-tertiary" };
  return (
    <span
      title={`AI category: ${category}`}
      aria-label={`category: ${category}`}
      className={[
        "inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 t-label-sm whitespace-nowrap",
        "bg-ai-surface " + meta.cls,
      ].join(" ")}
    >
      <PhIcon name={meta.icon} size={12} weight="fill" />
      {!iconOnly && category}
    </span>
  );
}
