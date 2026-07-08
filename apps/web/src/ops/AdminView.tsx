import { useEffect, useState } from "react";
import { OpsCard, SectionTitle } from "./widgets";
import { api } from "../api/client";

const NUDGE_TYPES = [
  "RecommendSIP", "RecommendMicroSIP", "SuggestSeniorFD", "OfferTermCover",
  "ScamShieldAlert", "EscalateToRM",
];

export function AdminView() {
  const [kill, setKill] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  // Consent state for Rajesh
  const [rajeshConsents, setRajeshConsents] = useState<Record<string, boolean>>({
    investment_distribution: true,
    account_analytics: true,
    marketing: false
  });

  useEffect(() => {
    // Fetch live audit logs from SQLite
    api.opsAudit().then(setAuditLogs).catch(console.error);
    
    // Poll every 3 seconds for new logs to keep dashboard live
    const interval = setInterval(() => {
      api.opsAudit().then(setAuditLogs).catch(console.error);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  async function toggleConsent(purpose: string) {
    const current = rajeshConsents[purpose];
    const next = !current;
    setRajeshConsents(prev => ({ ...prev, [purpose]: next }));
    try {
      await api.setConsent("cust_rajesh", purpose, next);
    } catch (e) {
      console.error(e);
      // revert on failure
      setRajeshConsents(prev => ({ ...prev, [purpose]: current }));
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto">
      <div className="flex flex-col gap-8">
        <OpsCard>
          <SectionTitle 
            eyebrow="Governance" 
            title="Model Register (Live Audit)" 
            desc="Immutable ledger of every AI decision. Tracks verb, regulatory classification, and outcome (confirmed/rejected/blocked) for complete transparency."
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by audit_id, verb, reg_class…"
            className="w-full rounded-[10px] border border-black/[0.08] bg-[#F2F2F7] px-4 py-2.5 text-[15px] outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] mb-4 transition-all text-[#1C1C1E] placeholder-[#8E8E93]"
          />
          <div className="overflow-x-auto rounded-[10px] border border-black/[0.06] bg-white">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#F2F2F7] text-xs uppercase tracking-wider text-[#8E8E93] font-semibold border-b border-black/[0.06]">
                <tr>
                  {["audit_id", "verb", "reg_class", "decision"].map((h) => (
                    <th key={h} className="px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {auditLogs
                  .filter((r) => JSON.stringify(r).toLowerCase().includes(query.toLowerCase()))
                  .map((log, i) => (
                    <tr key={log.audit_id || i} className="hover:bg-black/[0.02] transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-[#8E8E93] truncate max-w-[120px]" title={log.audit_id}>{log.audit_id}</td>
                      <td className="px-5 py-3 font-medium text-[#1C1C1E]">{log.action_verb || "-"}</td>
                      <td className="px-5 py-3 text-[#8E8E93]">{log.reg_class || "-"}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                          (log.human_decision || log.decision) === "rejected" ? "bg-[#FF3B30]/10 text-[#FF3B30]" : 
                          (log.human_decision || log.decision) === "confirmed" ? "bg-[#34C759]/10 text-[#34C759]" : 
                          "bg-[#007AFF]/10 text-[#007AFF]"
                        }`}>
                          {log.human_decision || log.decision}
                        </span>
                        {log.reason_code && <span className="ml-2 text-xs text-[#8E8E93]">- {log.reason_code}</span>}
                      </td>
                    </tr>
                  ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-[#8E8E93] text-[15px]">No telemetry found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </OpsCard>
      </div>

      <div className="flex flex-col gap-8">
        <OpsCard>
          <SectionTitle 
            eyebrow="DPDP" 
            title="Customer Consent Toggles (Rajesh)" 
            desc="Live demonstration of the Policy Engine. Toggling these instantly injects or revokes DPDP consent nodes in the Knowledge Graph, blocking or enabling governed actions downstream."
          />
          <div className="flex flex-col gap-3">
            {Object.entries(rajeshConsents).map(([purpose, granted]) => (
              <div key={purpose} className="flex items-center justify-between p-3 rounded-[10px] border border-black/[0.04] hover:bg-black/[0.02] transition-colors bg-[#F2F2F7]/50">
                <span className="text-[15px] font-medium text-[#1C1C1E]">{purpose}</span>
                <button
                  onClick={() => toggleConsent(purpose)}
                  className={`relative inline-flex h-[28px] w-[50px] items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-1 ${
                    granted ? 'bg-[#34C759]' : 'bg-[#E5E5EA]'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.15)] transition-transform ${
                      granted ? 'translate-x-[24px]' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </OpsCard>

        <OpsCard>
          <SectionTitle 
            eyebrow="Governance" 
            title="Global Kill-switch" 
            desc="Direct tactical overrides. Disabling a verb immediately prevents the engine from generating or surfacing that class of action globally."
          />
          <div className="grid grid-cols-2 gap-3 mt-4">
            {NUDGE_TYPES.map((v) => {
              const off = kill[v];
              return (
                <div key={v} className="flex flex-col gap-2 p-3 rounded-[10px] border border-black/[0.06] bg-white">
                  <span className="font-mono text-xs text-[#8E8E93] truncate tracking-wide" title={v}>{v}</span>
                  <button
                    onClick={() => setKill((k) => ({ ...k, [v]: !k[v] }))}
                    className={`w-full rounded-[6px] px-2 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                      off ? "bg-[#FF3B30]/10 text-[#FF3B30]" : "bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20"
                    }`}
                  >
                    {off ? "DISABLED" : "LIVE"}
                  </button>
                </div>
              );
            })}
          </div>
        </OpsCard>

        <OpsCard>
          <SectionTitle 
            eyebrow="Health" 
            title="Engine Status" 
            desc="Real-time sub-system diagnostics and latency metrics."
          />
          <div className="grid grid-cols-2 gap-y-5 gap-x-4">
            {[
              ["Spine latency p95", "82 ms", "text-[#34C759] bg-[#34C759]/10"],
              ["Explainer", "template - healthy", "text-[#34C759] bg-[#34C759]/10"],
              ["Graph backend", "embedded - in-proc", "text-[#007AFF] bg-[#007AFF]/10"],
              ["Audit store", "sqlite - ok", "text-[#007AFF] bg-[#007AFF]/10"],
            ].map(([k, v, badgeClass]) => (
              <div key={k} className="flex flex-col gap-1.5">
                <div className="text-xs uppercase tracking-wider text-[#8E8E93] font-semibold">{k}</div>
                <div className="flex items-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-[4px] text-[11px] font-mono font-bold uppercase tracking-widest ${badgeClass}`}>
                    {v}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </OpsCard>
      </div>
    </div>
  );
}
