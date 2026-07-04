/**
 * <AIInsightCard> — DESIGN.md §8.2 primary AI surface. ✦ identifier, title, body, Review +
 * Dismiss, "Why am I seeing this?" (info), thumbs feedback (§8.5). Left 4dp accent bar pulses
 * on first appear. Purple is exclusive to AI (§8.3 Rule 5). Confidence < 0.7 ⇒ never rendered
 * (gated upstream by the spine).
 */
import { ThumbsDown, ThumbsUp } from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { AiContent } from "../../api/types";
import { Info, PhIcon, Sparkle, X } from "../../lib/icons";
import { aiCardEnter } from "../../lib/motion";

export function AIInsightCard({
  content,
  confidence,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  onDismiss,
  onWhy,
  compact,
}: {
  content: AiContent;
  confidence: number;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  onDismiss?: () => void;
  onWhy?: () => void;
  compact?: boolean;
}) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  return (
    <motion.section
      variants={aiCardEnter}
      initial="hidden"
      animate="show"
      exit="exit"
      aria-label={`AI insight: ${content.title}. ${content.body}`}
      className="relative overflow-hidden rounded-lg border border-ai-border bg-ai-surface p-4 shadow-ai"
    >
      <span className="ai-accent-pulse absolute inset-y-0 left-0 w-1 bg-ai" aria-hidden />

      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 t-label-sm text-ai">
          <Sparkle size={16} weight="fill" />
          {content.eyebrow}
        </span>
        <div className="flex items-center gap-1">
          {onWhy && (
            <button
              onClick={onWhy}
              aria-label="Why am I seeing this?"
              className="grid h-8 w-8 place-items-center rounded-full text-content-tertiary hover:bg-white/60"
            >
              <Info size={16} />
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              aria-label="Dismiss insight"
              className="grid h-8 w-8 place-items-center rounded-full text-content-tertiary hover:bg-white/60"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 flex gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-ai">
          <PhIcon name={content.icon} size={20} weight="fill" />
        </span>
        <div className="min-w-0">
          <h3 className="t-title-sm text-ai-text">{content.title}</h3>
          {!compact && <p className="mt-1 t-body text-content-secondary">{content.body}</p>}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onPrimary}
          className="inline-flex min-h-[44px] items-center rounded-sm bg-ai px-4 t-label text-white shadow-ai transition hover:brightness-110 active:scale-[0.98]"
        >
          {primaryLabel ?? content.primary_cta}
        </button>
        <button
          onClick={onSecondary ?? onDismiss}
          className="min-h-[44px] rounded-sm px-3 t-label text-ai hover:underline"
        >
          {secondaryLabel ?? content.secondary_cta}
        </button>
        <span className="ml-auto flex items-center gap-2">
          <button
            aria-label="This insight was helpful"
            onClick={() => setVote("up")}
            className={vote === "up" ? "text-credit" : "text-content-tertiary"}
          >
            <ThumbsUp size={18} weight={vote === "up" ? "fill" : "regular"} />
          </button>
          <button
            aria-label="This insight was not helpful"
            onClick={() => setVote("down")}
            className={vote === "down" ? "text-debit" : "text-content-tertiary"}
          >
            <ThumbsDown size={18} weight={vote === "down" ? "fill" : "regular"} />
          </button>
        </span>
      </div>

      <p className="mt-2 t-label-sm text-content-tertiary">
        Confidence {(confidence * 100).toFixed(0)}% · explained, not asserted
      </p>
    </motion.section>
  );
}
