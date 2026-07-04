/**
 * /ops — the executive surface (DESIGN.md §9.4 desktop 3-pane; BUILD_PROMPT §12). Rail + content.
 * The funnel ticks live from the WS stream the instant a nudge is confirmed on the phone.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChartLineUp, Gauge } from "@phosphor-icons/react";
import { PhIcon } from "../lib/icons";
import { ActivationView } from "./ActivationView";
import { AdminView } from "./AdminView";
import { BarrierTwinView } from "./BarrierTwinView";
import { ObservabilityView } from "./ObservabilityView";
import { useOps } from "./useOps";

const NAV = [
  { key: "activation", label: "Activation", icon: "TrendUp" },
  { key: "barriers", label: "Barrier Twin", icon: "ChartPieSlice" },
  { key: "observability", label: "AI Observability", icon: "ShieldCheck" },
  { key: "admin", label: "Admin", icon: "Sliders" },
] as const;

type View = (typeof NAV)[number]["key"];

export function OpsApp() {
  const [view, setView] = useState<View>("activation");
  const { activation, barriers, obs, pulse } = useOps();

  return (
    <div className="min-h-[100dvh] bg-[#f7f8fb] text-slate-900">
      <div className="mx-auto flex max-w-[1400px]">
        {/* rail */}
        <aside className="sticky top-0 hidden h-[100dvh] w-60 shrink-0 flex-col border-r border-slate-200/70 bg-white px-4 py-6 md:flex">
          <div className="flex items-center gap-2 px-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-ai text-white">
              <Gauge size={18} weight="bold" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold">DAIE · Ops</div>
              <div className="text-[11px] text-slate-400">Executive console</div>
            </div>
          </div>

          <nav className="mt-8 flex flex-col gap-1">
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => setView(n.key)}
                className={
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
                  (view === n.key ? "bg-ai-surface text-ai" : "text-slate-500 hover:bg-slate-50")
                }
              >
                <PhIcon name={n.icon} size={18} weight={view === n.key ? "fill" : "regular"} />
                {n.label}
              </button>
            ))}
          </nav>

          <Link
            to="/app/home"
            className="mt-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
          >
            <ChartLineUp size={16} /> Back to the app
          </Link>
        </aside>

        {/* content */}
        <main className="min-w-0 flex-1 px-5 py-6 md:px-10 md:py-10">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {NAV.find((n) => n.key === view)?.label}
              </h1>
              <p className="text-sm text-slate-400">
                Digital Adoption Intelligence Engine · all data SYNTHETIC
              </p>
            </div>
            <Link
              to="/app/home"
              className="rounded-full bg-ai px-4 py-2 text-sm font-medium text-white shadow-ai md:hidden"
            >
              App
            </Link>
          </header>

          {view === "activation" && <ActivationView data={activation} pulse={pulse} />}
          {view === "barriers" && <BarrierTwinView data={barriers} />}
          {view === "observability" && <ObservabilityView data={obs} pulse={pulse} />}
          {view === "admin" && <AdminView />}
        </main>
      </div>
    </div>
  );
}
