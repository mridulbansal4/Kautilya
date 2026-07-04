/**
 * <AISpendingSummaryWidget> — DESIGN.md §8.2. Monthly spend + category bars. White card (NOT
 * purple — it's a widget, the AI ✦ badge is the only AI marker). Reserves height ⇒ CLS-safe.
 */
import { motion } from "framer-motion";
import { Sparkle } from "../../lib/icons";
import { inr } from "../../lib/format";

const CATS = [
  { key: "Food", pct: 32, cls: "bg-cat-food" },
  { key: "Bills", pct: 24, cls: "bg-cat-bills" },
  { key: "Shopping", pct: 20, cls: "bg-cat-shopping" },
  { key: "Travel", pct: 14, cls: "bg-cat-travel" },
  { key: "Health", pct: 10, cls: "bg-cat-health" },
];

export function AISpendingSummaryWidget({ total = 12450, onExpand }: { total?: number; onExpand?: () => void }) {
  return (
    <section
      aria-label={`This month you spent ${inr(total)}, up 8 percent versus last month`}
      className="rounded-lg bg-bg-surface p-4 shadow-e2"
      style={{ minHeight: 156 }}
    >
      <div className="flex items-center justify-between">
        <span className="t-section">This Month</span>
        <span className="inline-flex items-center gap-1 t-label-sm text-ai">
          <Sparkle size={14} weight="fill" /> AI
        </span>
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="t-headline-sm text-content-primary">{inr(total)}</span>
        <span className="t-body-sm text-debit">↑ 8% vs last month</span>
      </div>

      <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-full">
        {CATS.map((c) => (
          <motion.span
            key={c.key}
            initial={{ width: 0 }}
            animate={{ width: `${c.pct}%` }}
            transition={{ duration: 0.5, ease: [0, 0, 0, 1] }}
            className={c.cls}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-x-2 gap-y-1">
        {CATS.map((c) => (
          <span key={c.key} className="inline-flex items-center gap-1.5 t-label-sm text-content-secondary">
            <span className={"h-2 w-2 rounded-full " + c.cls} /> {c.key} {c.pct}%
          </span>
        ))}
      </div>
      <button onClick={onExpand} className="mt-3 t-label-sm text-brand">
        See full breakdown →
      </button>
    </section>
  );
}
