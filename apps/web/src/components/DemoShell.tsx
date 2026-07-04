/**
 * DemoShell — the stage. Left: PersonaSwitcher (the demo control). Centre: the phone (390×844)
 * with persistent bottom nav + AI FAB. Right: the split-screen reasoning inspector (Act 2 —
 * "same governance, different surface"). Everything inside reads the engine; nothing is faked here.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { MOCK_MODE } from "../api/client";
import { AIAssistFAB } from "./ai/AIAssistFAB";
import { AIAssistPanel } from "./ai/AIAssistPanel";
import { AdaptiveProvider, useAdaptive } from "../lib/adaptive";
import { ChartLineUp, Gauge } from "@phosphor-icons/react";
import { PersonaSwitcher } from "../persona/PersonaSwitcher";
import { PhoneFrame } from "./PhoneFrame";
import { BottomNavigationBar } from "./organisms/BottomNavigationBar";
import { ReasoningPathInspector } from "./ReasoningPathInspector";
import { useUiStore } from "../store/uiStore";

function Stage() {
  const { profile, nba, loading, error } = useAdaptive();
  const showPath = useUiStore((s) => s.showReasoningPath);
  const demoMode = useUiStore((s) => s.demoMode);
  const toggleDemo = useUiStore((s) => s.toggleDemoMode);
  const [assist, setAssist] = useState(false);

  return (
    <div className="min-h-[100dvh] w-full bg-[#0b1220] text-white">
      {/* stage top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ai text-white">
            <ChartLineUp size={18} weight="bold" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">YONO Adoption Copilot</div>
            <div className="text-[11px] text-white/45">
              Digital Adoption Intelligence Engine · SYNTHETIC
            </div>
          </div>
          {MOCK_MODE && (
            <span className="ml-2 rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] text-amber-300">
              MOCK MODE
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDemo}
            className="rounded-full border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
          >
            {demoMode ? "Judge view" : "Demo view"}
          </button>
          <Link
            to="/ops"
            className="inline-flex items-center gap-1.5 rounded-full bg-ai px-3 py-1.5 text-xs font-medium text-white shadow-ai"
          >
            <Gauge size={15} weight="bold" /> Executive dashboard
          </Link>
        </div>
      </header>

      {/* stage body */}
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-start justify-center gap-8 px-6 pb-16 lg:flex-nowrap">
        {demoMode && (
          <aside className="order-2 w-full shrink-0 lg:order-1 lg:w-[320px] lg:pt-6">
            <PersonaSwitcher />
          </aside>
        )}

        <main className="relative order-1 lg:order-2">
          <PhoneFrame profile={profile}>
            {error ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
                <p className="t-title-sm text-content-primary">Backend unreachable</p>
                <p className="t-body-sm text-content-secondary">
                  Start the API, or run <code className="t-mono">VITE_MOCK=1 pnpm dev</code> for the
                  bundled stage parachute.
                </p>
              </div>
            ) : loading && !profile ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="ai-shimmer h-24 w-24 rounded-full" />
              </div>
            ) : (
              <Outlet />
            )}
            <BottomNavigationBar />
            <AIAssistFAB onClick={() => setAssist(true)} />
            <AIAssistPanel open={assist} onClose={() => setAssist(false)} />
          </PhoneFrame>
        </main>

        <AnimatePresence>
          {showPath && nba && (
            <motion.aside
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className="order-3 w-full shrink-0 self-stretch lg:w-[400px] lg:pt-6"
            >
              <div className="rounded-2xl bg-white p-1">
                {nba.decision === "recommend" ? (
                  <ReasoningPathInspector
                    path={nba.reasoning_path}
                    audit_id={nba.audit_id}
                    confidence={nba.confidence}
                  />
                ) : (
                  <div className="p-5 text-center">
                    <p className="t-title-sm text-content-primary">No action surfaced</p>
                    <p className="mt-1 t-body-sm text-content-secondary">
                      decision = <strong>{nba.decision}</strong>
                      {nba.reason_code ? ` (${nba.reason_code})` : ""} — the spine stayed silent or
                      the policy gate rejected. Nothing renders. That is the guardrail working.
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-3 px-2 text-xs leading-relaxed text-white/45">
                This panel is identical regardless of which persona is active — only the phone's
                surfaced action and its tone change. Governance is constant; presentation adapts.
              </p>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function DemoShell() {
  return (
    <AdaptiveProvider>
      <Stage />
    </AdaptiveProvider>
  );
}
