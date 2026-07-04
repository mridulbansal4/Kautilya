/**
 * Activation Dashboard (BUILD_PROMPT §12). KPI tiles mirroring SBI's scorecard + the dormant→active
 * funnel that TICKS LIVE when a nudge is confirmed on the phone (via the WS stream).
 */
import { motion } from "framer-motion";
import type { ActivationResponse } from "../api/types";
import { Kpi, OpsCard, SectionTitle } from "./widgets";

const MAXW = 100;

export function ActivationView({ data, pulse }: { data: ActivationResponse | null; pulse: number }) {
  if (!data) return <Loading />;
  const max = Math.max(...data.funnel.map((f) => f.count), 1);

  return (
    <div className="flex flex-col gap-6">
      <OpsCard>
        <SectionTitle eyebrow="North-star scorecard" title="Activation & cross-sell" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {data.kpis.map((k) => (
            <Kpi key={k.key} tile={k} flash={pulse > 0} />
          ))}
        </div>
      </OpsCard>

      <OpsCard>
        <div className="flex items-center justify-between">
          <SectionTitle eyebrow="The 9 crore you already have" title="Dormant → Active funnel" />
          <motion.span
            key={pulse}
            initial={{ scale: pulse ? 1.3 : 1, color: "#5C35CC" }}
            animate={{ scale: 1, color: "#94a3b8" }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-2 text-xs font-medium"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            live · {data.confirmed_today} activated this session
          </motion.span>
        </div>

        <div className="flex flex-col gap-3">
          {data.funnel.map((f, i) => {
            const w = (f.count / max) * MAXW;
            const isActive = f.key === "active";
            return (
              <div key={f.key} className="flex items-center gap-4">
                <span className="w-24 shrink-0 text-sm font-medium text-slate-500">{f.label}</span>
                <div className="relative h-9 flex-1 overflow-hidden rounded-xl bg-slate-100">
                  <motion.div
                    animate={{ width: `${w}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 22 }}
                    className={
                      "flex h-full items-center justify-end rounded-xl pr-3 " +
                      (isActive
                        ? "bg-gradient-to-r from-ai to-[var(--colour-ai-secondary)]"
                        : i === 1
                        ? "bg-slate-300"
                        : "bg-brand")
                    }
                  >
                    <motion.span
                      key={f.count}
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="font-mono text-sm font-semibold text-white"
                    >
                      {f.count.toLocaleString("en-IN")}
                    </motion.span>
                  </motion.div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-slate-500">
          We don't acquire more users. We wake up the ones already registered — each confirmed nudge
          moves one customer dormant → active and lifts products-per-customer.
        </p>
      </OpsCard>
    </div>
  );
}

function Loading() {
  return <div className="ai-shimmer h-64 rounded-3xl" />;
}
