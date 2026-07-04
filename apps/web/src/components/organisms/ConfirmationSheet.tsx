/**
 * <ConfirmationSheet> — DESIGN.md §5.3 (critical path). The human-in-the-loop gate for
 * money-touching actions: amount prominent, summary table, security indicator, MPIN/biometric
 * confirm. On approve it shows the success tick (DESIGN.md §6.3) then resolves.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { CheckCircle, ShieldCheck } from "../../lib/icons";
import { SPRING } from "../../lib/motion";
import { SBIButton } from "../atoms/SBIButton";
import { BottomSheet } from "./BottomSheet";

export function ConfirmationSheet({
  open,
  onClose,
  title,
  headline,
  rows,
  confirmLabel = "Confirm with MPIN",
  onConfirm,
  successLabel = "Done",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  headline: string;
  rows: { k: string; v: string }[];
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  successLabel?: string;
}) {
  const [phase, setPhase] = useState<"idle" | "confirming" | "done">("idle");

  async function handle() {
    setPhase("confirming");
    await onConfirm();
    setPhase("done");
    setTimeout(() => {
      onClose();
      setPhase("idle");
    }, 1600);
  }

  return (
    <BottomSheet open={open} onClose={phase === "idle" ? onClose : () => {}} title={title} height="74%">
      <AnimatePresence mode="wait">
        {phase === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1, transition: SPRING }}
            className="flex h-full flex-col items-center justify-center gap-3 py-10 text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1, transition: SPRING }}
              className="text-credit"
            >
              <CheckCircle size={72} weight="fill" />
            </motion.span>
            <span className="t-title-lg text-content-primary">{successLabel}</span>
            <span className="t-body text-content-secondary">Governed action written to your account.</span>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }} className="flex flex-col gap-4 pt-1">
            <div className="rounded-lg bg-[var(--colour-neutral-100)] p-4 text-center">
              <div className="t-headline text-content-primary">{headline}</div>
            </div>
            <dl className="divide-y divide-line rounded-lg border border-line">
              {rows.map((r) => (
                <div key={r.k} className="flex items-center justify-between px-4 py-3">
                  <dt className="t-body-sm text-content-tertiary">{r.k}</dt>
                  <dd className="t-body text-content-primary text-right">{r.v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex items-center justify-center gap-1.5 text-content-tertiary">
              <ShieldCheck size={16} weight="fill" />
              <span className="t-label-sm">Secured by 256-bit encryption</span>
            </div>
            <SBIButton full onClick={handle} disabled={phase === "confirming"} icon="ShieldCheck">
              {phase === "confirming" ? "Authorising…" : confirmLabel}
            </SBIButton>
            <SBIButton variant="ghost" full onClick={onClose}>
              Cancel
            </SBIButton>
          </motion.div>
        )}
      </AnimatePresence>
    </BottomSheet>
  );
}
