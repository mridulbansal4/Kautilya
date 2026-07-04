/**
 * Adoption Barrier Twin (BUILD_PROMPT §12). A users→friction-node graph with cohort shares
 * (aggregated / anonymised → DPDP-clean). Rendered as an SVG hub-and-spoke; node size ∝ cohort share.
 */
import { motion } from "framer-motion";
import type { BarrierResponse } from "../api/types";
import { OpsCard, SectionTitle } from "./widgets";

export function BarrierTwinView({ data }: { data: BarrierResponse | null }) {
  if (!data) return <div className="ai-shimmer h-72 rounded-3xl" />;
  const cx = 110;
  const cy = 170;
  const n = data.nodes.length;

  return (
    <OpsCard>
      <SectionTitle eyebrow="Friction intelligence" title="Adoption Barrier Twin" />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* hub-and-spoke svg */}
        <svg viewBox="0 0 340 340" className="w-full">
          {data.nodes.map((node, i) => {
            const angle = (i / n) * Math.PI - Math.PI / 2;
            const x = cx + 200 * Math.cos(angle);
            const y = cy + 150 * Math.sin(angle);
            const r = 14 + node.cohort_share * 60;
            return (
              <g key={node.node_id}>
                <line x1={cx} y1={cy} x2={x} y2={y} stroke="#e2e8f0" strokeWidth={1 + node.cohort_share * 6} />
                <motion.circle
                  cx={x} cy={y} r={r}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: i * 0.07, type: "spring", stiffness: 160, damping: 18 }}
                  fill="rgba(92,53,204,0.12)" stroke="#5C35CC" strokeWidth={1.5}
                />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                  className="fill-ai font-mono text-[11px] font-semibold">
                  {Math.round(node.cohort_share * 100)}%
                </text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={30} fill="#1A3F7A" />
          <text x={cx} y={cy - 2} textAnchor="middle" className="fill-white text-[10px] font-semibold">USERS</text>
          <text x={cx} y={cy + 11} textAnchor="middle" className="fill-white/70 text-[9px]">
            {data.total_users.toLocaleString("en-IN")}
          </text>
        </svg>

        {/* ranked list */}
        <div className="divide-y divide-slate-100">
          {data.nodes.map((node, i) => (
            <motion.div
              key={node.node_id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-4 py-3"
            >
              <span className="font-mono text-sm text-slate-400">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{node.label}</div>
                <div className="text-xs text-slate-400">
                  {node.screen} · severity {node.severity.toFixed(2)}
                </div>
              </div>
              <div className="w-28">
                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-ai" style={{ width: `${node.cohort_share * 100}%` }} />
                </div>
              </div>
              <span className="w-12 text-right font-mono text-sm font-semibold text-slate-900">
                {Math.round(node.cohort_share * 100)}%
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        Reliability / timeout is the #1 barrier. Aggregated, anonymised cohort shares only — no
        individual is identifiable (DPDP).
      </p>
    </OpsCard>
  );
}
