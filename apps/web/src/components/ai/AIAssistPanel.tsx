/**
 * <AIAssistPanel> — DESIGN.md §8.2. Conversational assistant in a bottom sheet. Kept in
 * More/Help — NEVER the demo centrepiece (the engine-driven nudge is). Disclaimer footer present.
 */
import { useState } from "react";
import { Sparkle } from "../../lib/icons";
import { BottomSheet } from "../organisms/BottomSheet";

const QUICK = [
  "Explain my last transaction",
  "Where did I spend most this week?",
  "How much FD interest did I earn?",
];

interface Msg {
  who: "user" | "ai";
  text: string;
}

export function AIAssistPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [log, setLog] = useState<Msg[]>([
    { who: "ai", text: "Hi — I can explain anything on your screen. I never give investment advice." },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  function ask(q: string) {
    if (!q.trim()) return;
    setLog((l) => [...l, { who: "user", text: q }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setLog((l) => [
        ...l,
        { who: "ai", text: "Your total EMI outflow is ₹8,200 across 2 loans — home ₹6,500 (due 5th), car ₹1,700 (due 10th)." },
      ]);
      setThinking(false);
    }, 900);
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="✦ YONO AI" height="72%">
      <div className="mb-3 flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => ask(q)}
            className="rounded-full border border-ai-border px-3 py-1.5 t-label-sm text-ai"
          >
            {q}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {log.map((m, i) => (
          <div
            key={i}
            className={[
              "max-w-[85%] rounded-lg px-3 py-2 t-body",
              m.who === "user"
                ? "self-end bg-brand text-white"
                : "self-start bg-ai-surface text-ai-text",
            ].join(" ")}
          >
            {m.text}
          </div>
        ))}
        {thinking && (
          <div className="self-start inline-flex gap-1 rounded-lg bg-ai-surface px-3 py-3">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-ai"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 mt-3 flex items-center gap-2 bg-bg-surface pt-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask(input)}
          placeholder="Ask anything…"
          className="flex-1 rounded-full border border-line px-4 py-2.5 t-body outline-none focus:border-ai"
        />
        <button
          onClick={() => ask(input)}
          aria-label="Send"
          className="grid h-11 w-11 place-items-center rounded-full bg-ai text-white"
        >
          <Sparkle size={20} weight="fill" />
        </button>
      </div>
      <p className="mt-2 t-label-sm text-content-tertiary">
        AI responses may be incorrect. Verify before acting.
      </p>
    </BottomSheet>
  );
}
