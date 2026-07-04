/**
 * Account Summary — DESIGN.md §2.5. Account card, action row, AI account-health widget, mini
 * statement with inline AI tags, linked services.
 */
import { useNavigate } from "react-router-dom";
import { AITransactionTag } from "../components/ai/AITransactionTag";
import { AccountCard } from "../components/molecules/AccountCard";
import { SectionHeader } from "../components/molecules/SectionHeader";
import { TransactionRow } from "../components/molecules/TransactionRow";
import { AppBar } from "../components/organisms/AppBar";
import { SBIButton } from "../components/atoms/SBIButton";
import { PhIcon, Sparkle } from "../lib/icons";
import { bandToAmount } from "../lib/format";
import { useAdaptive } from "../lib/adaptive";
import { useUiStore } from "../store/uiStore";

const MINI = [
  { id: "m1", merchant: "Salary credit", meta: "27 Jun · NEFT", amount: 64000, icon: "CurrencyInr", cat: "Income" },
  { id: "m2", merchant: "Swiggy", meta: "27 Jun · UPI", amount: -428, icon: "ForkKnife", cat: "Food" },
  { id: "m3", merchant: "Amazon", meta: "26 Jun · Card", amount: -2149, icon: "ShoppingCart", cat: "Groceries" },
];

export default function AccountSummary() {
  const { customer } = useAdaptive();
  const aiEnabled = useUiStore((s) => s.aiEnabled);
  const nav = useNavigate();
  const a = customer?.accounts[0];

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="Account" back />
      <div className="screen-stack p-4">
        {a && (
          <AccountCard
            holder={customer!.display_name}
            type={a.type}
            amount={bandToAmount(a.balance_band, a.type)}
            accountId={a.account_id}
          />
        )}

        <div className="grid grid-cols-3 gap-2">
          {[
            { i: "FileText", l: "Statement" },
            { i: "ArrowsLeftRight", l: "Transfer", to: "/app/pay" },
            { i: "PiggyBank", l: "New FD", to: "/app/fd/new" },
          ].map((x) => (
            <button
              key={x.l}
              onClick={() => x.to && nav(x.to)}
              className="flex flex-col items-center gap-2 rounded-lg bg-bg-surface py-3 shadow-e1"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand">
                <PhIcon name={x.i} size={20} />
              </span>
              <span className="t-label-sm text-content-secondary">{x.l}</span>
            </button>
          ))}
        </div>

        {/* AI account-health widget */}
        {aiEnabled && (
          <section className="rounded-lg border border-ai-border bg-bg-surface p-4 shadow-e2">
            <div className="inline-flex items-center gap-1.5 t-label-sm text-ai">
              <Sparkle size={14} weight="fill" /> AI account health
            </div>
            <div className="mt-2 grid grid-cols-3 gap-3 text-center">
              {[
                { k: "Savings rate", v: "21%" },
                { k: "Avg balance", v: "↑ 6%" },
                { k: "FD in", v: "7 days" },
              ].map((m) => (
                <div key={m.k}>
                  <div className="t-title-sm text-content-primary">{m.v}</div>
                  <div className="t-label-sm text-content-tertiary">{m.k}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div>
          <SectionHeader action={{ label: "View all", onClick: () => nav("/app/transactions") }}>
            Mini statement
          </SectionHeader>
          <div className="divide-y divide-line rounded-lg bg-bg-surface shadow-e1">
            {MINI.map((m) => (
              <TransactionRow
                key={m.id}
                txn={m}
                tag={aiEnabled ? <AITransactionTag category={m.cat} /> : undefined}
              />
            ))}
          </div>
        </div>

        <SBIButton variant="secondary" full onClick={() => nav("/app/transactions")}>
          See full transaction history
        </SBIButton>
      </div>
    </div>
  );
}
