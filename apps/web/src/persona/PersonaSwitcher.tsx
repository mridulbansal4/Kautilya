/**
 * <PersonaSwitcher> — the demo control (BUILD_PROMPT §7.4). A segmented control (AI-purple accent)
 * that swaps the active customer_id. It holds NO business logic — the backend re-derives the
 * profile + next-best-action. The "Show reasoning path" toggle proves governance is constant while
 * presentation adapts.
 */
import { motion } from "framer-motion";
import type { HeroId } from "../api/types";
import { Sparkle } from "../lib/icons";
import { useUiStore } from "../store/uiStore";

const PERSONAS: { id: HeroId; name: string; tag: string; sub: string }[] = [
  { id: "cust_rajesh", name: "Rajesh, 42", tag: "Mid-career", sub: "Idle surplus · retirement" },
  { id: "cust_aarav", name: "Aarav, 21", tag: "Student", sub: "Micro-SIP · build credit" },
  { id: "cust_mohan", name: "Mohan, 68", tag: "Senior", sub: "Senior FD · scam-shield" },
];

export function PersonaSwitcher() {
  const active = useUiStore((s) => s.activeCustomerId);
  const setActive = useUiStore((s) => s.setActiveCustomer);
  const showPath = useUiStore((s) => s.showReasoningPath);
  const togglePath = useUiStore((s) => s.toggleReasoningPath);

  return (
    <div className="w-[320px] text-white">
      <div className="mb-3 flex items-center gap-2">
        <Sparkle size={18} weight="fill" className="text-ai-secondary" />
        <span className="t-label uppercase tracking-wider text-white/70">Demo · Persona engine</span>
      </div>

      <div className="flex flex-col gap-2">
        {PERSONAS.map((p) => {
          const on = p.id === active;
          return (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className="relative flex items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-left"
            >
              {on && (
                <motion.span
                  layoutId="persona-active"
                  className="absolute inset-0 rounded-xl border-2 border-[var(--colour-ai-secondary)] bg-white/[0.06]"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span className="relative grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm font-bold">
                {p.name[0]}
              </span>
              <span className="relative min-w-0">
                <span className="block text-sm font-semibold">{p.name}</span>
                <span className="block text-xs text-white/55">
                  {p.tag} · {p.sub}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={togglePath}
        className={[
          "mt-3 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm",
          showPath
            ? "border-[var(--colour-ai-secondary)] bg-[var(--colour-ai-secondary)]/15 text-white"
            : "border-white/10 text-white/70",
        ].join(" ")}
      >
        <span>Show reasoning path</span>
        <span
          className={[
            "relative h-5 w-9 rounded-full transition-colors",
            showPath ? "bg-[var(--colour-ai-secondary)]" : "bg-white/20",
          ].join(" ")}
        >
          <motion.span
            layout
            className="absolute top-0.5 h-4 w-4 rounded-full bg-white"
            style={{ left: showPath ? 18 : 2 }}
          />
        </span>
      </button>

      <p className="mt-4 t-body-sm leading-relaxed text-white/45">
        One ontology, one governed engine, three lives. The reasoning path is identical across all
        three — only the surfaced action and its presentation adapt.
      </p>
    </div>
  );
}
