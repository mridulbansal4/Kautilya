/**
 * Investments — the real-YONO Invest hub: Mutual Funds / SIP, Fixed Deposits, Insurance (life &
 * general), NPS, Demat / Stocks.
 *
 * MY AI layer: the persona's engine-authored next-best-action (RecommendSIP / RecommendMicroSIP /
 * SuggestSeniorFD) surfaces here too, so the Home "Review" nudge deep-links here and completes
 * through the human-in-the-loop gate. SYNTHETIC.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { AIInsightCard } from "../components/ai/AIInsightCard";
import { HubTile } from "../components/molecules/HubTile";
import { SectionHeader } from "../components/molecules/SectionHeader";
import { AppBar } from "../components/organisms/AppBar";
import { ConfirmationSheet } from "../components/organisms/ConfirmationSheet";
import { ReasoningPathInspector } from "../components/ReasoningPathInspector";
import { BottomSheet } from "../components/organisms/BottomSheet";
import { CheckCircle } from "../lib/icons";
import { inr } from "../lib/format";
import { useAdaptive } from "../lib/adaptive";
import { useUiStore } from "../store/uiStore";

export default function Investments() {
  const nav = useNavigate();
  const { customer, nba } = useAdaptive();
  const aiEnabled = useUiStore((s) => s.aiEnabled);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [done, setDone] = useState(false);
  const action = nba?.action;

  const TILES = [
    { icon: "ChartLineUp", label: "Mutual Funds & SIP", sub: "Explore funds", accent: "ai" as const },
    { icon: "PiggyBank", label: "Fixed Deposits", sub: "Up to 7.5%", to: "/app/fd" },
    { icon: "ShieldCheck", label: "Insurance", sub: "Life & general" },
    { icon: "TrendUp", label: "NPS", sub: "Retirement, tax-saving" },
    { icon: "Receipt", label: "Demat & Stocks", sub: "Open in minutes" },
    { icon: "Gauge", label: "Goal planner", sub: "Plan & track" },
  ];

  async function confirm() {
    if (nba?.audit_id) await api.confirm(nba.audit_id, "approved");
    setDone(true);
  }

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="Invest" back />
      <div className="screen-stack p-4">
        <div
          className="rounded-lg p-5 text-white shadow-e3"
          style={{ background: "linear-gradient(135deg, var(--colour-blue-700), var(--colour-blue-500))" }}
        >
          <span className="t-label-sm uppercase text-white/70">Investment portfolio</span>
          <div className="mt-1 t-headline">{inr(customer?.products_per_customer ? 412300 : 389600)}</div>
          <span className="t-body-sm text-white/70">
            {customer?.products_per_customer ?? 0} product(s) · investment readiness {customer?.dcs.investments ?? 0}/100
          </span>
        </div>

        {/* MY AI nudge — surfaces the persona's authored action; completes via HITL */}
        {aiEnabled && action && nba?.content && nba.decision === "recommend" && !done && (
          <AIInsightCard
            content={{ ...nba.content, primary_cta: `Start ${action.product_name}` }}
            confidence={nba.confidence}
            onPrimary={() => setConfirmOpen(true)}
            onWhy={() => setWhyOpen(true)}
          />
        )}
        {done && (
          <div className="flex items-center gap-2 rounded-lg border border-ai-border bg-ai-surface p-4">
            <CheckCircle size={22} weight="fill" className="text-credit" />
            <span className="t-body text-content-secondary">
              {action?.product_name} started at {inr(action?.suggested_ticket ?? 0)}. Products-per-customer +1.
            </span>
          </div>
        )}

        <div>
          <SectionHeader>Explore</SectionHeader>
          <div className="grid grid-cols-2 gap-3">
            {TILES.map((t) => (
              <HubTile key={t.label} icon={t.icon} label={t.label} sub={t.sub} accent={t.accent} onClick={() => t.to && nav(t.to)} />
            ))}
          </div>
        </div>
      </div>

      {action && (
        <ConfirmationSheet
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirm — human in the loop"
          headline={inr(action.suggested_ticket ?? action.min_ticket ?? 0)}
          rows={[
            { k: "Product", v: action.product_name ?? action.verb },
            { k: "Type", v: action.reg_class.replace(/_/g, " ") },
            { k: "From", v: "Savings ••• 4521" },
            { k: "Approval", v: "Human-in-the-loop" },
          ]}
          confirmLabel="Approve with MPIN"
          successLabel="Started"
          onConfirm={confirm}
        />
      )}

      <BottomSheet open={whyOpen} onClose={() => setWhyOpen(false)} title="Why am I seeing this?" height="80%">
        {nba?.explanation && <p className="mb-3 rounded-lg bg-ai-surface p-3 t-body text-ai-text">{nba.explanation}</p>}
        {nba && <ReasoningPathInspector path={nba.reasoning_path} audit_id={nba.audit_id} confidence={nba.confidence} compact />}
      </BottomSheet>
    </div>
  );
}
