/**
 * Bill Pay & Recharge — real-YONO BBPS billers + mobile/FASTag recharge.
 * MY AI layer: bill auto-reminders + bundling (DESIGN.md §8.4 / pain-point #12) — "3 bills due this
 * week, ₹X total" — and a one-tap pay-all. SYNTHETIC.
 */
import { useState } from "react";
import { AppBar } from "../components/organisms/AppBar";
import { ConfirmationSheet } from "../components/organisms/ConfirmationSheet";
import { HubTile } from "../components/molecules/HubTile";
import { SectionHeader } from "../components/molecules/SectionHeader";
import { PhIcon, Sparkle } from "../lib/icons";
import { inr } from "../lib/format";
import { useUiStore } from "../store/uiStore";

const BILLERS = [
  { icon: "Lightning", label: "Electricity" },
  { icon: "CurrencyInr", label: "Mobile" },
  { icon: "Storefront", label: "DTH" },
  { icon: "ShieldCheck", label: "Insurance" },
  { icon: "Receipt", label: "Broadband" },
  { icon: "ArrowsLeftRight", label: "FASTag" },
  { icon: "House", label: "Gas / Water" },
  { icon: "Gift", label: "Credit card" },
];

const DUE = [
  { name: "MSEB Electricity", amount: 1840, due: "in 2 days" },
  { name: "Airtel Postpaid", amount: 499, due: "in 4 days" },
  { name: "Tata Sky DTH", amount: 350, due: "in 6 days" },
];

export default function BillPay() {
  const aiEnabled = useUiStore((s) => s.aiEnabled);
  const [confirm, setConfirm] = useState<null | "all" | string>(null);
  const total = DUE.reduce((a, b) => a + b.amount, 0);
  const target = confirm === "all" ? null : DUE.find((d) => d.name === confirm);
  const amt = confirm === "all" ? total : target?.amount ?? 0;

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="Bills & Recharge" back />
      <div className="screen-stack p-4">
        {aiEnabled && (
          <div className="rounded-lg border border-ai-border bg-ai-surface p-4">
            <div className="flex items-center gap-1.5 t-label-sm text-ai">
              <Sparkle size={14} weight="fill" /> AI bill reminder
            </div>
            <p className="mt-1 t-body text-content-secondary">
              <strong>3 bills</strong> totalling <strong>{inr(total)}</strong> are due this week. Pay them together?
            </p>
            <button
              onClick={() => setConfirm("all")}
              className="mt-3 min-h-[44px] rounded-sm bg-ai px-4 t-label text-white"
            >
              Pay all {inr(total)}
            </button>
          </div>
        )}

        <div>
          <SectionHeader>Due soon</SectionHeader>
          <div className="divide-y divide-line rounded-lg bg-bg-surface shadow-e1">
            {DUE.map((d) => (
              <div key={d.name} className="flex items-center gap-3 px-4 py-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand">
                  <PhIcon name="Receipt" size={18} />
                </span>
                <div className="flex-1">
                  <div className="t-title-sm text-content-primary">{d.name}</div>
                  <div className="t-body-sm text-content-tertiary">Due {d.due}</div>
                </div>
                <button onClick={() => setConfirm(d.name)} className="t-label text-brand">
                  {inr(d.amount)} →
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader>All billers</SectionHeader>
          <div className="grid grid-cols-4 gap-2">
            {BILLERS.map((b) => (
              <button key={b.label} className="flex flex-col items-center gap-1.5 rounded-lg bg-bg-surface py-3 shadow-e1">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-50 text-brand">
                  <PhIcon name={b.icon} size={18} />
                </span>
                <span className="t-label-sm text-content-secondary">{b.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <ConfirmationSheet
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === "all" ? "Pay all bills" : "Pay bill"}
        headline={inr(amt)}
        rows={
          confirm === "all"
            ? DUE.map((d) => ({ k: d.name, v: inr(d.amount) }))
            : [
                { k: "Biller", v: target?.name ?? "" },
                { k: "From", v: "Savings ••• 4521" },
                { k: "Due", v: target?.due ?? "" },
              ]
        }
        onConfirm={() => {}}
        successLabel="Paid"
      />
    </div>
  );
}
