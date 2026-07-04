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
import { Microphone } from "@phosphor-icons/react";
import { useAdaptive } from "../lib/adaptive";
import { useUiStore } from "../store/uiStore";

const QUICK_ALL = [
  { icon: "QrCode", label: "Scan & Pay", to: "/app/pay/scan" },
  { icon: "CurrencyInr", label: "YONO Cash", to: "/app/yono-cash" },
  { icon: "Receipt", label: "Pay Bills", to: "/app/bills" },
  { icon: "TrendUp", label: "Invest", to: "/app/invest" },
];

import { ShieldCheck } from "@phosphor-icons/react";

export default function Home() {
  const { customer, profile, nba, loading } = useAdaptive();
  const nav = useNavigate();
  const dismissed = useUiStore((s) => s.dismissedInsights);
  const dismissInsight = useUiStore((s) => s.dismissInsight);
  const aiEnabled = useUiStore((s) => s.aiEnabled);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
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
    <div className="phone-scroll flex-1 overflow-y-auto pb-28 bg-slate-50/50">
      {/* header */}
      <div className="bg-brand px-5 pb-8 pt-6 text-white shadow-sm relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
               <p className="text-[13px] text-white/70 font-medium tracking-wide">Welcome back</p>
               {aiEnabled && (
                 <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-emerald-300">
                   <ShieldCheck weight="fill" size={12} /> AI Active
                 </span>
               )}
            </div>
            <h1 className="text-[28px] font-bold tracking-tight leading-tight">{profile?.greeting}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Subtle DCS Surface in header */}
            {customer?.dcs && (
               <div className="flex flex-col items-end justify-center mr-1">
                 <span className="text-[10px] text-white/60 font-medium uppercase tracking-widest">DCS</span>
                 <span className="text-[14px] font-bold text-white leading-none">{customer.dcs.composite}</span>
               </div>
            )}
            <button
              onClick={() => nav("/app/notifications")}
              aria-label="Notifications"
              className="relative grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-rose-500 border-2 border-brand" />
            </button>
          </div>
        </div>
      </div>

      <div className="screen-stack -mt-4 px-5 space-y-6 relative z-20">
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

        {/* AI slot 1 — the engine-authored nudge (or success after confirm). */}
        {done ? (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm"
          >
            <div className="flex items-center gap-3 text-emerald-600 mb-2">
              <CheckCircle size={24} weight="fill" />
              <span className="text-[16px] font-bold tracking-tight">Priority Complete</span>
              <Confetti size={20} weight="fill" className="ml-auto text-emerald-500" />
            </div>
            <p className="text-[14px] text-emerald-800 leading-relaxed">
              {action?.product_name} started at {inr(action?.suggested_ticket ?? 0)}. You moved from{" "}
              <strong>dormant → active</strong>. The desk dashboard just ticked.
            </p>
          </motion.section>
        ) : aiEnabled && loading ? (
          <div className="animate-pulse flex flex-col gap-3 p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-4 bg-ai/20 rounded-full" />
              <div className="h-3 w-32 bg-slate-200 rounded" />
            </div>
            <div className="h-6 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-1/2 bg-slate-100 rounded" />
            <div className="mt-4 flex gap-3">
              <div className="h-10 w-24 bg-slate-200 rounded-xl" />
            </div>
          </div>
        ) : showInsight && nba?.content ? (
          <div className="flex flex-col gap-2">
            <h2 className="text-[12px] font-bold tracking-widest text-slate-400 uppercase ml-1">Today's Financial Priority</h2>
            <AIInsightCard
              content={nba.content}
              confidence={nba.confidence}
              onPrimary={() => setConfirmOpen(true)}
              onDismiss={() => dismissInsight(insightId)}
              onWhy={() => setWhyOpen(true)}
            />
          </div>
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

        <p className="pt-6 pb-2 text-center t-label-sm text-slate-400 font-medium tracking-wide">
          All figures SYNTHETIC · not real SBI customer data
        </p>
      </div>

      {/* Voice-First Interface for Dadaji (Senior Profile) */}
      {profile?.archetype === "senior" && (
        <button 
          onClick={() => setVoiceOpen(true)}
          className="fixed bottom-24 right-6 h-16 w-16 rounded-full bg-brand text-white shadow-xl shadow-brand/30 flex items-center justify-center hover:scale-105 transition-transform z-40 border-4 border-white"
        >
          <Microphone size={28} weight="fill" />
        </button>
      )}

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
        <p className="mt-4 t-body-sm text-slate-500 leading-relaxed">
          Based on your declared goals and consented signals from the last 90 days. The recommendation
          was authored by a deterministic engine; the language model only explained it.
        </p>

        {/* Mock Session Memory (DPDP Data Minimization) */}
        <div className="mt-8 border-t border-slate-100 pt-6">
          <h4 className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-4">Distilled Session Memories</h4>
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
             <div className="flex items-start gap-4">
               <span className="h-2 w-2 rounded-full bg-red-400 mt-1.5 shrink-0 shadow-sm" />
               <p className="text-[13px] text-slate-500 font-mono leading-relaxed"><span className="text-slate-800 font-semibold font-sans text-sm">VKYC Abandonment</span><br/>Screen: 'Onboarding' · Severity: 0.8<br/><span className="text-slate-400 text-xs">2026-07-03</span></p>
             </div>
             <div className="h-px w-full bg-slate-50" />
             <div className="flex items-start gap-4">
               <span className="h-2 w-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-sm" />
               <p className="text-[13px] text-slate-500 font-mono leading-relaxed"><span className="text-slate-800 font-semibold font-sans text-sm">Read KFS Document</span><br/>Subject: 'Retirement' · Dwell: 45s<br/><span className="text-slate-400 text-xs">2026-06-28</span></p>
             </div>
          </div>
        </div>
      </BottomSheet>

      {/* Voice Assistant Modal */}
      <BottomSheet open={voiceOpen} onClose={() => setVoiceOpen(false)} title="Voice Assistant" height="55%">
        <div className="flex flex-col h-full pt-6">
          <div className="flex justify-end mb-6">
            <div className="bg-brand text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-[85%] text-[15px] shadow-sm font-medium">
              Beta, FD kaise start karein?
            </div>
          </div>
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-5 py-4 max-w-[90%] text-[15px] shadow-sm leading-relaxed border border-slate-200">
              Pranam Dadaji. Aapki pension par <strong className="text-brand font-semibold">7.5% interest</strong> milega. Kya main Branch Manager ko call karne ke liye kahun?
            </div>
          </div>
          <div className="mt-auto flex justify-center pb-12 pt-10">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-24 w-24 bg-brand/10 rounded-full animate-ping" />
              <div className="absolute h-20 w-20 bg-brand/20 rounded-full animate-pulse" />
              <div className="relative h-16 w-16 bg-brand text-white rounded-full flex items-center justify-center shadow-lg shadow-brand/40 z-10">
                <Microphone size={32} weight="fill" />
              </div>
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
