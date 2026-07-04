/**
 * Home — the demo money-shot (BUILD_PROMPT §14 Act 1) and the persona showpiece (Act 2).
 * Reads the AdaptiveUIProfile + the authored next-best-action from the backend and morphs:
 * which AI components surface, font scale, density, contrast, choice count, copy tone — all
 * engine-driven. The reasoning path is identical across personas (see the inspector).
 */
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { AIAlertBanner } from "../components/ai/AIAlertBanner";
import { AIInsightCard } from "../components/ai/AIInsightCard";
import { AIMaturityCountdownCard } from "../components/ai/AIMaturityCountdown";
import { AISkeleton } from "../components/ai/AISkeleton";
import { AISpendingSummaryWidget } from "../components/ai/AISpendingSummaryWidget";
import { DCSRing } from "../components/DCSRing";
import { AccountCard } from "../components/molecules/AccountCard";
import { QuickActionItem } from "../components/molecules/QuickActionItem";
import { SectionHeader } from "../components/molecules/SectionHeader";
import { BottomSheet } from "../components/organisms/BottomSheet";
import { CarouselBanner } from "../components/organisms/CarouselBanner";
import { ConfirmationSheet } from "../components/organisms/ConfirmationSheet";
import { ReasoningPathInspector } from "../components/ReasoningPathInspector";
import { SBIBadge } from "../components/atoms/SBIBadge";
import { bandToAmount, inr } from "../lib/format";
import { Bell, CheckCircle, Confetti } from "../lib/icons";
import { useAdaptive } from "../lib/adaptive";
import { useUiStore } from "../store/uiStore";

const QUICK_ALL = [
  { icon: "QrCode", label: "Scan & Pay", to: "/app/pay/scan" },
  { icon: "CurrencyInr", label: "YONO Cash", to: "/app/yono-cash" },
  { icon: "Receipt", label: "Pay Bills", to: "/app/bills" },
  { icon: "TrendUp", label: "Invest", to: "/app/invest" },
];

export default function Home() {
  const { customer, profile, nba, loading } = useAdaptive();
  const nav = useNavigate();
  const dismissed = useUiStore((s) => s.dismissedInsights);
  const dismissInsight = useUiStore((s) => s.dismissInsight);
  const aiEnabled = useUiStore((s) => s.aiEnabled);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [done, setDone] = useState(false);

  // Act-1 beat is driven by the provider's real fetch: each persona switch re-runs the spine, so
  // `loading` is briefly true → the "AI is analysing" skeleton shows → the authored nudge replaces it.
  // Reset the confirmed state per persona (customer_id is stable; audit_id is freshly minted per run).
  useEffect(() => {
    setDone(false);
  }, [customer?.customer_id]);

  const surfaced = profile?.surfaced_ai_components ?? [];
  const simplify = profile?.simplify_ui ?? false;
  const maxChoices = profile?.max_choices ?? 3;
  const account = customer?.accounts[0];
  const action = nba?.action;
  const insightId = nba?.audit_id ?? "insight";
  const showInsight =
    aiEnabled && nba?.decision === "recommend" && !dismissed[insightId] && !done;

  const quickActions = useMemo(
    () => (simplify ? QUICK_ALL.slice(0, 2) : QUICK_ALL),
    [simplify],
  );

  async function confirmNudge() {
    if (nba?.audit_id) await api.confirm(nba.audit_id, "approved");
    setDone(true);
  }

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      {/* header */}
      <div className="bg-brand px-4 pb-6 pt-3 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="t-body-sm text-white/70">Welcome back</p>
            <h1 className={simplify ? "t-headline" : "t-headline-sm"}>{profile?.greeting}</h1>
          </div>
          <button
            onClick={() => nav("/app/notifications")}
            aria-label="Notifications"
            className="relative grid h-11 w-11 place-items-center rounded-full hover:bg-white/10"
          >
            <Bell size={24} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-debit" />
          </button>
        </div>
      </div>

      <div className="screen-stack -mt-3 px-4">
        {/* account */}
        {account && (
          <AccountCard
            holder={customer!.display_name}
            type={account.type}
            amount={bandToAmount(account.balance_band, account.type)}
            accountId={account.account_id}
          />
        )}

        {/* AI slot 0 — scam-shield for senior (DESIGN.md §8.3 slot 0) */}
        {aiEnabled && surfaced.includes("AIAlertBanner") && (
          <AIAlertBanner
            title="Scam-shield is watching your account"
            body="Never share an OTP or PIN on a call. The bank will never ask. Tap below if anyone has asked you for one."
            primary="I'm safe, thanks"
            secondary="Someone asked me"
            onPrimary={() => {}}
            onSecondary={() => {}}
          />
        )}

        {/* AI slot 1 — the engine-authored nudge (or success after confirm). Plain conditional so
            exactly one card is mounted at a time; each has its own entrance motion. */}
        {done ? (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg border border-ai-border bg-ai-surface p-4 shadow-ai"
          >
            <div className="flex items-center gap-2 text-credit">
              <CheckCircle size={22} weight="fill" />
              <span className="t-title-sm text-content-primary">Activated — nice move.</span>
              <Confetti size={20} weight="fill" className="ml-auto text-ai" />
            </div>
            <p className="mt-1 t-body text-content-secondary">
              {action?.product_name} started at {inr(action?.suggested_ticket ?? 0)}. You moved from{" "}
              <strong>dormant → active</strong>, products-per-customer +1. The desk dashboard just ticked.
            </p>
          </motion.section>
        ) : aiEnabled && loading ? (
          <div>
            <div className="mb-1 flex items-center gap-2">
              <SBIBadge variant="ai">AI is analysing your account…</SBIBadge>
            </div>
            <AISkeleton height={128} />
          </div>
        ) : showInsight && nba?.content ? (
          <AIInsightCard
            content={nba.content}
            confidence={nba.confidence}
            onPrimary={() => setConfirmOpen(true)}
            onDismiss={() => dismissInsight(insightId)}
            onWhy={() => setWhyOpen(true)}
          />
        ) : null}

        {/* quick actions (capped by max_choices for choice-overload mitigation) */}
        <div>
          <SectionHeader>Quick actions</SectionHeader>
          <div className={"grid " + (simplify ? "grid-cols-2 gap-3" : "grid-cols-4 gap-2")}>
            {quickActions.map((q) => (
              <QuickActionItem key={q.label} icon={q.icon} label={q.label} onClick={() => q.to && nav(q.to)} />
            ))}
          </div>
        </div>

        {/* AI slot 2 — DCS ring (student) / spending widget (others) */}
        {aiEnabled && surfaced.includes("DCSRing") && customer && (
          <DCSRing dcs={customer.dcs} />
        )}
        {aiEnabled && surfaced.includes("AISpendingSummaryWidget") && !simplify && (
          <AISpendingSummaryWidget onExpand={() => nav("/app/transactions")} />
        )}

        {/* AI slot 3 — FD maturity (mid-career + senior) */}
        {aiEnabled && surfaced.includes("AIMaturityCountdown") && (
          <AIMaturityCountdownCard onRenew={() => nav("/app/fd")} onWithdraw={() => nav("/app/fd")} />
        )}

        {/* secondary content — trimmed for the simplified senior layout */}
        {!simplify && (
          <>
            <div>
              <SectionHeader action={{ label: "View all", onClick: () => nav("/app/account") }}>
                My accounts
              </SectionHeader>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {customer?.accounts.map((a) => (
                  <button
                    key={a.account_id}
                    onClick={() => nav("/app/account")}
                    className="min-w-[150px] rounded-lg border border-line bg-bg-surface p-3 text-left shadow-e1"
                  >
                    <span className="t-label-sm text-content-tertiary uppercase">{a.type}</span>
                    <span className="mt-1 block t-title-sm text-content-primary">
                      {inr(bandToAmount(a.balance_band, a.type))}
                    </span>
                    <span className="t-mono text-content-tertiary" style={{ fontSize: 11 }}>
                      ••• {a.account_id.slice(-4)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <SectionHeader>For you</SectionHeader>
              <CarouselBanner />
            </div>
          </>
        )}

        <p className="pt-2 text-center t-label-sm text-content-tertiary">
          All figures SYNTHETIC · not real SBI customer data
        </p>
      </div>

      {/* HITL confirm gate (money-touching → human approval) */}
      {action && (
        <ConfirmationSheet
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirm — human in the loop"
          headline={inr(action.suggested_ticket ?? action.min_ticket ?? 0)}
          rows={[
            { k: "Action", v: action.product_name ?? action.verb },
            { k: "Type", v: action.reg_class.replace(/_/g, " ") },
            { k: "From", v: `${account?.type} ••• ${account?.account_id.slice(-4)}` },
            { k: "Approval", v: "Human-in-the-loop" },
          ]}
          confirmLabel="Approve with MPIN"
          successLabel="Activated"
          onConfirm={confirmNudge}
        />
      )}

      {/* "Why am I seeing this?" → the actual ontology path */}
      <BottomSheet open={whyOpen} onClose={() => setWhyOpen(false)} title="Why am I seeing this?" height="80%">
        {nba?.explanation && (
          <p className="mb-3 rounded-lg bg-ai-surface p-3 t-body text-ai-text">{nba.explanation}</p>
        )}
        {nba && (
          <ReasoningPathInspector
            path={nba.reasoning_path}
            audit_id={nba.audit_id}
            confidence={nba.confidence}
            compact
          />
        )}
        <p className="mt-3 t-body-sm text-content-tertiary">
          Based on your declared goals and consented signals from the last 90 days. The recommendation
          was authored by a deterministic engine; the language model only explained it.
        </p>
      </BottomSheet>
    </div>
  );
}
