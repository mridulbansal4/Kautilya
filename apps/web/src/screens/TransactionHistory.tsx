/**
 * Transaction History — DESIGN.md §2.6 / §8. AISmartSearch (NL), AISummaryBar with AI spend trend,
 * date-grouped list with inline AITransactionTag. AI fails silent if disabled.
 */
import { useMemo, useState } from "react";
import { AISmartSearch } from "../components/ai/AISmartSearch";
import { AITransactionTag } from "../components/ai/AITransactionTag";
import { AISkeleton } from "../components/ai/AISkeleton";
import { FilterChip } from "../components/molecules/FilterChip";
import { TransactionRow, type Txn } from "../components/molecules/TransactionRow";
import { AppBar } from "../components/organisms/AppBar";
import { Sparkle } from "../lib/icons";
import { inr } from "../lib/format";
import { useUiStore } from "../store/uiStore";

interface Row extends Txn {
  date: string;
  category: string;
}

const TXNS: Row[] = [
  { id: "t1", merchant: "Salary credit", meta: "NEFT · 27 Jun, 9:00 AM", amount: 64000, icon: "CurrencyInr", date: "Today", category: "Income" },
  { id: "t2", merchant: "Swiggy", meta: "UPI · 27 Jun, 1:12 PM", amount: -428, icon: "ForkKnife", date: "Today", category: "Food" },
  { id: "t3", merchant: "Amazon", meta: "Card · 26 Jun, 7:48 PM", amount: -2149, icon: "ShoppingCart", date: "Yesterday", category: "Groceries" },
  { id: "t4", merchant: "Electricity bill", meta: "BBPS · 26 Jun, 8:00 AM", amount: -1840, icon: "Receipt", date: "Yesterday", category: "Bills" },
  { id: "t5", merchant: "Tuition fee", meta: "NEFT · 24 Jun", amount: -8000, icon: "GraduationCap", date: "Earlier", category: "Education" },
  { id: "t6", merchant: "Priya Sharma", meta: "UPI · 23 Jun", amount: -5000, icon: "ArrowsLeftRight", date: "Earlier", category: "Food" },
];

const FILTERS = ["All", "Credits", "Debits", "Food", "Bills"];

export default function TransactionHistory() {
  const aiEnabled = useUiStore((s) => s.aiEnabled);
  const [filter, setFilter] = useState("All");
  const [q, setQ] = useState("");
  const [interpreting, setInterpreting] = useState(false);

  const rows = useMemo(() => {
    let r = TXNS;
    if (filter === "Credits") r = r.filter((t) => t.amount > 0);
    else if (filter === "Debits") r = r.filter((t) => t.amount < 0);
    else if (filter !== "All") r = r.filter((t) => t.category === filter);
    if (q) r = r.filter((t) => (t.merchant + t.category).toLowerCase().includes(q.toLowerCase()));
    return r;
  }, [filter, q]);

  const groups = useMemo(() => {
    const g: Record<string, Row[]> = {};
    rows.forEach((t) => (g[t.date] ??= []).push(t));
    return g;
  }, [rows]);

  const credits = TXNS.filter((t) => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const debits = TXNS.filter((t) => t.amount < 0).reduce((a, t) => a + Math.abs(t.amount), 0);

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="Transactions" back />
      <div className="space-y-3 p-4">
        {aiEnabled ? (
          <AISmartSearch
            onQuery={(query, busy) => {
              setQ(query);
              setInterpreting(busy);
            }}
          />
        ) : null}

        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <FilterChip key={f} label={f} active={f === filter} onClick={() => setFilter(f)} />
          ))}
        </div>

        {/* AI spend-trend summary bar */}
        {aiEnabled && (
          <div className="flex items-center justify-between rounded-lg bg-ai-surface px-4 py-3">
            <div>
              <div className="inline-flex items-center gap-1 t-label-sm text-ai">
                <Sparkle size={14} weight="fill" /> AI spend trend
              </div>
              <div className="t-body-sm text-content-secondary">
                In {inr(credits)} · Out {inr(debits)} · net {inr(credits - debits)}
              </div>
            </div>
            <div className="flex h-8 items-end gap-1">
              {[6, 10, 7, 13, 9, 14].map((h, i) => (
                <span key={i} className="w-1.5 rounded-full bg-ai" style={{ height: h * 2 }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {interpreting ? (
        <div className="px-4">
          <AISkeleton height={64} />
        </div>
      ) : Object.keys(groups).length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="t-title-sm text-content-primary">No matches</p>
          <p className="t-body-sm text-content-tertiary">Try “largest transfers” or clear the search.</p>
        </div>
      ) : (
        Object.entries(groups).map(([date, list]) => (
          <section key={date}>
            <h2 className="bg-[var(--colour-neutral-100)] px-4 py-1.5 t-label-sm text-content-secondary">
              {date}
            </h2>
            <div className="divide-y divide-line">
              {list.map((t) => (
                <TransactionRow
                  key={t.id}
                  txn={t}
                  tag={aiEnabled ? <AITransactionTag category={t.category} /> : undefined}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
