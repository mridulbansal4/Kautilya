/**
 * AI Observability (BUILD_PROMPT §12). Hallucination attempts contained, policy violations prevented,
 * retrieval failures, accept/reject, and confidence evolution. Reads the live audit store.
 */
import { motion } from "framer-motion";
import type { ObservabilityResponse } from "../api/types";
import { OpsCard, SectionTitle } from "./widgets";

function Stat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</span>
      <span className={"font-mono text-3xl font-semibold tracking-tight " + accent}>{value}</span>
    </div>
  );
}

export function ObservabilityView({ data, pulse }: { data: ObservabilityResponse | null; pulse: number }) {
  if (!data) return <div className="ai-shimmer h-72 rounded-3xl" />;
  const evo = data.confidence_evolution;
  const max = Math.max(...evo, 1);

  return (
    <div className="flex flex-col gap-6">
      <OpsCard>
        <SectionTitle eyebrow="Trust & safety" title="AI Observability" />
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
          <Stat label="Hallucinations contained" value={data.hallucinations_contained} accent="text-emerald-600" />
          <Stat label="Policy violations prevented" value={data.policy_violations_prevented} accent="text-sky-600" />
          <Stat label="Retrieval failures (fail-closed)" value={data.retrieval_failures} accent="text-amber-600" />
          <motion.div key={pulse} initial={{ scale: pulse ? 1.06 : 1 }} animate={{ scale: 1 }}>
            <Stat label="Accept rate" value={`${Math.round(data.accept_rate * 100)}%`} accent="text-ai" />
          </motion.div>
        </div>
      </OpsCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <OpsCard>
          <SectionTitle eyebrow="Calibration" title="Confidence evolution" />
          <div className="flex h-40 items-end gap-2">
            {evo.map((c, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: Math.max(12, (c / max) * 128) }}
                  transition={{ delay: i * 0.05, type: "spring", stiffness: 120, damping: 20 }}
                  className="w-full rounded-t-md bg-ai"
                />
                <span className="font-mono text-[10px] text-slate-400">{c.toFixed(2)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Every surfaced action cleared the 0.70 confidence gate. Below it, the spine stays silent.
          </p>
        </OpsCard>

        <OpsCard>
          <SectionTitle eyebrow="Decision ledger" title="Accept vs reject" />
          <div className="flex flex-col gap-4">
            <LedgerRow label="Accepted (confirmed)" value={data.recommendations_accepted} total={Math.max(1, data.recommendations_accepted + data.recommendations_rejected)} cls="bg-emerald-500" />
            <LedgerRow label="Declined by human" value={data.recommendations_rejected} total={Math.max(1, data.recommendations_accepted + data.recommendations_rejected)} cls="bg-slate-400" />
            <LedgerRow label="Blocked pre-author" value={data.policy_violations_prevented + data.hallucinations_contained} total={Math.max(1, data.policy_violations_prevented + data.hallucinations_contained)} cls="bg-debit" />
          </div>
          <p className="mt-3 text-sm text-slate-500">
            The proposing chain (NBA) is separate from the approving gate (human). Nothing touches money
            without a confirm.
          </p>
        </OpsCard>
      </div>
    </div>
  );
}

function LedgerRow({ label, value, total, cls }: { label: string; value: number; total: number; cls: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-slate-600">{label}</span>
        <span className="font-mono font-semibold text-slate-900">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={"h-full rounded-full " + cls} style={{ width: `${(value / total) * 100}%` }} />
      </div>
    </div>
  );
}
