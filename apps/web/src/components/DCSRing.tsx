/**
 * <DCSRing> — the Digital Confidence Score surfaced to the user as a gamified ring
 * (BUILD_PROMPT §6.1). Shown for the student persona (streak energy); the same score reads to
 * execs as cross-sell-readiness on /ops.
 */
import { motion } from "framer-motion";
import type { DcsBreakdown } from "../api/types";
import { Fire } from "../lib/icons";

export function DCSRing({ dcs, streak = 4 }: { dcs: DcsBreakdown; streak?: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const pct = dcs.composite / 100;
  return (
    <section className="flex items-center gap-4 rounded-lg bg-bg-surface p-4 shadow-e2">
      <div className="relative grid place-items-center" style={{ width: 84, height: 84 }}>
        <svg width="84" height="84" className="-rotate-90">
          <circle cx="42" cy="42" r={r} fill="none" stroke="var(--colour-neutral-200)" strokeWidth="8" />
          <motion.circle
            cx="42" cy="42" r={r} fill="none" stroke="var(--colour-ai-primary)" strokeWidth="8"
            strokeLinecap="round" strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: c * (1 - pct) }}
            transition={{ duration: 0.8, ease: [0, 0, 0, 1] }}
          />
        </svg>
        <div className="absolute text-center">
          <div className="t-title-lg text-ai-text leading-none">{dcs.composite}</div>
          <div className="t-label-sm text-content-tertiary">DCS</div>
        </div>
      </div>
      <div className="min-w-0">
        <div className="inline-flex items-center gap-1.5 t-title-sm text-content-primary">
          Financial confidence
        </div>
        <div className="mt-0.5 inline-flex items-center gap-1 t-body-sm text-[var(--colour-amber-900)]">
          <Fire size={16} weight="fill" /> {streak}-week streak · keep it alive
        </div>
        <div className="mt-2 flex gap-1.5">
          {(["payments", "savings", "investments", "credit"] as const).map((p) => (
            <span key={p} className="flex-1">
              <span className="block h-1.5 rounded-full bg-neutral-200" style={{ background: "var(--colour-neutral-200)" }}>
                <span
                  className="block h-1.5 rounded-full bg-ai"
                  style={{ width: `${dcs[p]}%` }}
                />
              </span>
              <span className="mt-1 block t-label-sm capitalize text-content-tertiary" style={{ fontSize: 9 }}>
                {p.slice(0, 4)}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
