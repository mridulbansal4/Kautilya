/**
 * AI Preferences — DESIGN.md §2.10 / §8.3 Rule 3. The opt-out path. Turning AI off must leave a
 * fully working non-AI app (graceful degradation tenet). Toggling here flips the global aiEnabled.
 */
import { AppBar } from "../components/organisms/AppBar";
import { Sparkle } from "../lib/icons";
import { useUiStore } from "../store/uiStore";

function Toggle({ on, onChange, label, sub }: { on: boolean; onChange: (v: boolean) => void; label: string; sub: string }) {
  return (
    <button onClick={() => onChange(!on)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
      <span className="flex-1">
        <span className="block t-body text-content-primary">{label}</span>
        <span className="block t-body-sm text-content-tertiary">{sub}</span>
      </span>
      <span className={"relative h-6 w-11 shrink-0 rounded-full transition-colors " + (on ? "bg-ai" : "bg-line")}>
        <span className={"absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all " + (on ? "left-[22px]" : "left-0.5")} />
      </span>
    </button>
  );
}

export default function AIPreferences() {
  const aiEnabled = useUiStore((s) => s.aiEnabled);
  const setAiEnabled = useUiStore((s) => s.setAiEnabled);
  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="AI Preferences" back />
      <div className="p-4">
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-ai-border bg-ai-surface p-4">
          <Sparkle size={20} weight="fill" className="text-ai shrink-0" />
          <p className="t-body-sm text-ai-text">
            AI is additive and always optional. With it off, every screen still works — you just won't
            see insights, tags, or smart search.
          </p>
        </div>
        <div className="divide-y divide-line overflow-hidden rounded-lg bg-bg-surface shadow-e1">
          <Toggle
            on={aiEnabled}
            onChange={setAiEnabled}
            label="AI Insights"
            sub="Proactive nudges, spending summary, FD maturity"
          />
          <Toggle on={aiEnabled} onChange={setAiEnabled} label="AI transaction categories" sub="Inline category tags" />
          <Toggle on={aiEnabled} onChange={setAiEnabled} label="AI smart search" sub="Natural-language transaction search" />
        </div>
        <p className="mt-3 px-1 t-body-sm text-content-tertiary">
          Confidence threshold 70% · AI never blocks login, transfer, or bill pay · every insight has a
          “Why am I seeing this?” explanation.
        </p>
      </div>
    </div>
  );
}
