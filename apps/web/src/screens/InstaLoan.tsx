/**
 * Insta Loan — real-YONO Pre-Approved Personal Loan (PAPL), disbursed in minutes.
 * MY AI layer: eligibility is persona/DCS-adaptive — a real pre-approved offer for the mid-career
 * customer, a credit-builder path for the student (no shaming), and a branch-assisted path for the
 * senior (EscalateToRM). The reasoning stays governed; only the surface adapts. SYNTHETIC.
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "../components/organisms/AppBar";
import { ConfirmationSheet } from "../components/organisms/ConfirmationSheet";
import { SBIButton } from "../components/atoms/SBIButton";
import { FilterChip } from "../components/molecules/FilterChip";
import { Sparkle } from "../lib/icons";
import { inr } from "../lib/format";
import { useAdaptive } from "../lib/adaptive";

const RATE = 0.105;
const TENORS = [12, 24, 36, 48];

function emi(p: number, months: number): number {
  const r = RATE / 12;
  return Math.round((p * r * (1 + r) ** months) / ((1 + r) ** months - 1));
}

export default function InstaLoan() {
  const { customer, profile } = useAdaptive();
  const nav = useNavigate();
  const archetype = profile?.archetype ?? "mid_career";
  const creditScore = customer?.dcs.credit ?? 0;

  // persona-adaptive pre-approved ceiling (engine-flavoured, DCS-gated)
  const preApproved = archetype === "mid_career" ? 840000 : archetype === "senior" ? 300000 : 0;
  const [amount, setAmount] = useState(Math.min(300000, preApproved));
  const [tenor, setTenor] = useState(24);
  const [confirm, setConfirm] = useState(false);
  const monthly = useMemo(() => emi(amount, tenor), [amount, tenor]);

  // STUDENT — no big loan; AI offers the credit-building path instead (never shaming)
  if (archetype === "young_student") {
    return (
      <div className="phone-scroll flex-1 overflow-y-auto pb-24">
        <AppBar title="Loans" back />
        <div className="screen-stack p-4">
          <div className="rounded-lg border border-ai-border bg-ai-surface p-5">
            <div className="flex items-center gap-1.5 t-label-sm text-ai">
              <Sparkle size={14} weight="fill" /> AI · build first, borrow later
            </div>
            <h2 className="mt-2 t-title-lg text-ai-text">Build a credit score, unlock bigger limits</h2>
            <p className="mt-1 t-body text-content-secondary">
              You're {creditScore}/100 on credit. A Secured Credit Builder Card reports to bureaus and
              can lift you to pre-approved loans in a few months. No shame in starting small.
            </p>
            <SBIButton variant="ai" full className="mt-4" onClick={() => nav("/app/invest")}>
              Start the Credit Builder
            </SBIButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="Pre-approved Loan" back />
      <div className="screen-stack p-4">
        <div
          className="rounded-lg p-5 text-white shadow-e3"
          style={{ background: "linear-gradient(135deg, var(--colour-blue-700), var(--colour-blue-500))" }}
        >
          <span className="t-label-sm uppercase text-white/70">You're pre-approved for</span>
          <div className="mt-1 t-headline">{inr(preApproved)}</div>
          <span className="t-body-sm text-white/70">10.5% p.a. · disbursed in minutes · no paperwork</span>
        </div>

        {/* SENIOR — branch-assisted path offered prominently */}
        {archetype === "senior" && (
          <div className="rounded-lg border border-ai-border bg-ai-surface p-4">
            <div className="flex items-center gap-1.5 t-label-sm text-ai">
              <Sparkle size={14} weight="fill" /> AI suggestion
            </div>
            <p className="mt-1 t-body text-content-secondary">
              Prefer to talk it through? Your branch manager can explain the terms and set this up for you.
            </p>
            <SBIButton variant="ai" full className="mt-3">Ask branch manager to call</SBIButton>
          </div>
        )}

        <div className="rounded-lg bg-bg-surface p-4 shadow-e1">
          <div className="flex items-center justify-between">
            <span className="t-section">Loan amount</span>
            <span className="t-title-sm text-brand">{inr(amount)}</span>
          </div>
          <input
            type="range" min={50000} max={preApproved} step={10000}
            value={amount} onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--colour-brand-primary)]"
            aria-label="Loan amount"
          />
          <div className="mt-4 t-section">Tenure (months)</div>
          <div className="mt-2 flex gap-2">
            {TENORS.map((t) => (
              <FilterChip key={t} label={`${t}`} active={t === tenor} onClick={() => setTenor(t)} />
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-[var(--colour-neutral-100)] p-3">
            <span className="t-body-sm text-content-secondary">Monthly EMI</span>
            <span className="t-title-sm text-content-primary">{inr(monthly)}</span>
          </div>
        </div>

        <SBIButton full onClick={() => setConfirm(true)}>Accept &amp; disburse</SBIButton>
      </div>

      <ConfirmationSheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Confirm loan"
        headline={inr(amount)}
        rows={[
          { k: "Rate", v: "10.5% p.a." },
          { k: "Tenure", v: `${tenor} months` },
          { k: "Monthly EMI", v: inr(monthly) },
          { k: "Credited to", v: "Savings ••• 4521" },
        ]}
        confirmLabel="Approve with MPIN"
        successLabel="Loan disbursed"
        onConfirm={() => {}}
      />
    </div>
  );
}
