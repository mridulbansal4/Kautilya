/**
 * Admin controls (BUILD_PROMPT §12). Model health, consent-status monitor, audit-log search, and a
 * kill-switch per nudge type. Demo-interactive (toggles are local state).
 */
import { useState } from "react";
import { OpsCard, SectionTitle } from "./widgets";

const NUDGE_TYPES = [
  "RecommendSIP", "RecommendMicroSIP", "SuggestSeniorFD", "OfferTermCover",
  "ScamShieldAlert", "EscalateToRM",
];

export function AdminView() {
  const [kill, setKill] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <OpsCard>
        <SectionTitle eyebrow="Governance" title="Kill-switch per nudge type" />
        <div className="divide-y divide-slate-100">
          {NUDGE_TYPES.map((v) => {
            const off = kill[v];
            return (
              <div key={v} className="flex items-center justify-between py-3">
                <span className="font-mono text-sm text-slate-700">{v}</span>
                <button
                  onClick={() => setKill((k) => ({ ...k, [v]: !k[v] }))}
                  className={
                    "rounded-full px-3 py-1 text-xs font-semibold " +
                    (off ? "bg-[var(--colour-red-50)] text-debit" : "bg-emerald-500/10 text-emerald-600")
                  }
                >
                  {off ? "DISABLED" : "LIVE"}
                </button>
              </div>
            );
          })}
        </div>
      </OpsCard>

      <div className="flex flex-col gap-6">
        <OpsCard>
          <SectionTitle eyebrow="Health" title="Model & engine" />
          <div className="grid grid-cols-2 gap-4">
            {[
              ["Spine latency p95", "82 ms"],
              ["Explainer", "template · healthy"],
              ["Graph backend", "embedded · in-proc"],
              ["Audit store", "sqlite · ok"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[11px] uppercase tracking-wide text-slate-400">{k}</div>
                <div className="font-mono text-sm font-semibold text-slate-900">{v}</div>
              </div>
            ))}
          </div>
        </OpsCard>

        <OpsCard>
          <SectionTitle eyebrow="DPDP" title="Consent-status monitor" />
          <div className="flex flex-col gap-2">
            {[
              ["investment_distribution", "98.2%"],
              ["account_analytics", "94.7%"],
              ["marketing", "61.3%"],
            ].map(([p, pct]) => (
              <div key={p} className="flex items-center gap-3">
                <span className="w-44 font-mono text-xs text-slate-600">{p}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-brand" style={{ width: pct }} />
                </div>
                <span className="w-12 text-right font-mono text-xs text-slate-900">{pct}</span>
              </div>
            ))}
          </div>
        </OpsCard>
      </div>

      <OpsCard className="lg:col-span-2">
        <SectionTitle eyebrow="Auditability" title="Audit-log search" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by audit_id, verb, reg_class…"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-ai"
        />
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
              <tr>
                {["audit_id", "verb", "reg_class", "decision"].map((h) => (
                  <th key={h} className="px-4 py-2 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="font-mono text-xs text-slate-700">
              {[
                ["aud_…rajesh", "RecommendSIP", "distribution_allowed", "authored"],
                ["aud_…aarav", "RecommendMicroSIP", "distribution_allowed", "authored"],
                ["aud_…mohan", "SuggestSeniorFD", "distribution_allowed", "authored"],
                ["aud_…rej1", "—", "—", "rejected · consent_missing"],
              ]
                .filter((r) => r.join(" ").toLowerCase().includes(query.toLowerCase()))
                .map((r, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {r.map((c, j) => (
                      <td key={j} className="px-4 py-2">{c}</td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </OpsCard>
    </div>
  );
}
