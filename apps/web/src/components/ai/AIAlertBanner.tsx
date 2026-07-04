/**
 * <AIAlertBanner> — DESIGN.md §8.2. High-priority anomaly / scam-shield. Amber (warning) or red
 * (critical). NOT dismissible — user must choose. Pushes content down (does not overlay).
 * For the senior persona this is the Scam-Shield surface.
 */
import { motion } from "framer-motion";
import { PhIcon } from "../../lib/icons";

export function AIAlertBanner({
  severity = "warning",
  title,
  body,
  primary,
  secondary,
  onPrimary,
  onSecondary,
}: {
  severity?: "warning" | "critical";
  title: string;
  body: string;
  primary: string;
  secondary: string;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  const warn = severity === "warning";
  return (
    <motion.section
      role="alert"
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-lg p-4"
      style={{ background: warn ? "var(--colour-amber-50)" : "var(--colour-red-50)" }}
    >
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: warn ? "var(--colour-amber-700)" : "var(--colour-debit)" }}
        aria-hidden
      />
      <div className="flex gap-3">
        <span style={{ color: warn ? "var(--colour-amber-900)" : "var(--colour-debit)" }}>
          <PhIcon name="WarningCircle" size={24} weight="fill" />
        </span>
        <div>
          <h3 className="t-title-sm text-content-primary">{title}</h3>
          <p className="mt-1 t-body text-content-secondary">{body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={onPrimary}
              className="min-h-[44px] rounded-sm bg-brand px-4 t-label text-white"
            >
              {primary}
            </button>
            <button
              onClick={onSecondary}
              className="min-h-[44px] rounded-sm px-3 t-label text-content-secondary"
              style={{ color: warn ? "var(--colour-amber-900)" : "var(--colour-debit)" }}
            >
              {secondary}
            </button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
