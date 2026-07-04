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
      className="relative overflow-hidden rounded-2xl border border-ai-border bg-white p-5 shadow-ai transition-shadow hover:shadow-ai-strong"
    >
      {/* Intrinsic left pulse rail - flush with the rounded corner */}
      <div className="ai-accent-pulse absolute inset-y-0 left-0 w-1.5 bg-ai rounded-l-2xl" aria-hidden />

      {/* Header Area: Eyebrow + Metadata Pill */}
      <div className="flex items-start justify-between pl-2">
        <span className="inline-flex items-center gap-1.5 t-label-sm text-ai tracking-wide uppercase">
          <Sparkle size={14} weight="fill" />
          {content.eyebrow}
        </span>
        
        {/* Metadata Pill: Confidence + Feedback */}
        <div className="flex items-center gap-2 rounded-full bg-slate-50 border border-slate-100 px-2 py-1 shadow-sm">
          <span className="t-label-sm text-slate-500 font-medium pl-1">
            {(confidence * 100).toFixed(0)}% Match
          </span>
          <div className="h-3.5 w-px bg-slate-200 mx-0.5" />
          <button
            aria-label="This insight was helpful"
            onClick={() => setVote("up")}
            className={`hover:bg-white rounded-full p-1 transition-colors ${vote === "up" ? "text-emerald-600 bg-emerald-50" : "text-slate-400"}`}
          >
            <ThumbsUp size={14} weight={vote === "up" ? "fill" : "regular"} />
          </button>
          <button
            aria-label="This insight was not helpful"
            onClick={() => setVote("down")}
            className={`hover:bg-white rounded-full p-1 transition-colors ${vote === "down" ? "text-rose-600 bg-rose-50" : "text-slate-400"}`}
          >
            <ThumbsDown size={14} weight={vote === "down" ? "fill" : "regular"} />
          </button>
        </div>
      </div>

      {/* Core Content Grid */}
      <div className="mt-4 flex gap-4 pl-2">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ai/10 text-ai shadow-sm">
          <PhIcon name={content.icon} size={24} weight="fill" />
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h3 className="text-[17px] font-semibold tracking-tight text-slate-900 leading-tight">
            {content.title}
          </h3>
          {!compact && (
            <p className="mt-1.5 text-[14px] text-slate-600 leading-relaxed">
              {content.body}
            </p>
          )}
        </div>
      </div>

      {/* Action Area */}
      <div className="mt-5 flex items-center justify-between pl-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onPrimary}
            className="inline-flex min-h-[44px] items-center rounded-xl bg-ai px-5 text-[14px] font-semibold text-white shadow-md shadow-ai/30 transition-all hover:brightness-110 active:scale-[0.97]"
          >
            {primaryLabel ?? content.primary_cta}
          </button>
          <button
            onClick={onSecondary ?? onDismiss}
            className="min-h-[44px] rounded-xl px-4 text-[14px] font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {secondaryLabel ?? content.secondary_cta}
          </button>
        </div>

        {/* Explainability / Why button */}
        {onWhy && (
          <button
            onClick={onWhy}
            aria-label="Why am I seeing this?"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Info size={14} />
            Why?
          </button>
        )}
      </div>
    </motion.section>
  );
}
