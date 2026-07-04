/**
 * <AISmartSearch> — DESIGN.md §8.2. Natural-language search over transactions. Suggested-query
 * chips before typing, 300ms debounce + shimmer while "interpreting", filtered results upstream.
 */
import { useEffect, useState } from "react";
import { MagnifyingGlass, Sparkle, X } from "../../lib/icons";

const SUGGESTED = ["Subscriptions this month", "ATM withdrawals", "Largest transfers", "UPI to Priya"];

export function AISmartSearch({
  onQuery,
}: {
  onQuery: (q: string, interpreting: boolean) => void;
}) {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!q) {
      onQuery("", false);
      return;
    }
    onQuery(q, true);
    const t = setTimeout(() => onQuery(q, false), 300);
    return () => clearTimeout(t);
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="flex items-center gap-2 rounded-full border border-ai-border bg-bg-surface px-3 min-h-[48px]">
        <MagnifyingGlass size={20} className="text-ai" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder="Try 'all Swiggy orders last month'"
          className="flex-1 bg-transparent outline-none t-body"
          aria-label="AI smart search"
        />
        <Sparkle size={16} weight="fill" className="text-ai" />
        {q && (
          <button onClick={() => setQ("")} aria-label="Clear">
            <X size={18} className="text-content-tertiary" />
          </button>
        )}
      </div>
      {focused && !q && (
        <div className="mt-2 flex flex-wrap gap-2">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onMouseDown={() => setQ(s)}
              className="rounded-full border border-ai-border px-3 py-1.5 t-label-sm text-ai"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
