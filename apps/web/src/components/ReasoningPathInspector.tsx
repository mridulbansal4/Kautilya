/**
 * <ReasoningPathInspector> — the explainability surface (BUILD_PROMPT §5/§7.4). Lights up each
 * hop of the governed spine + the ontology traversal that authored the action. This is the proof
 * that governance is constant while presentation adapts: the SAME path renders for every persona.
 */
import { motion } from "framer-motion";
import type { ReasoningHop } from "../api/types";
import { CheckCircle, Sparkle, WarningCircle, X } from "../lib/icons";

const STATUS = {
  pass: { cls: "text-credit", Icon: CheckCircle },
  reject: { cls: "text-debit", Icon: X },
  info: { cls: "text-[var(--colour-amber-900)]", Icon: WarningCircle },
} as const;

export function ReasoningPathInspector({
  path,
  audit_id,
  confidence,
  compact,
}: {
  path: ReasoningHop[];
  audit_id?: string | null;
  confidence?: number;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "rounded-lg border border-line bg-bg-surface p-4"}>
      <div className="mb-3 flex items-center gap-2">
        <Sparkle size={18} weight="fill" className="text-ai" />
        <h3 className="t-title-sm text-content-primary">Reasoning path</h3>
        {audit_id && (
          <span className="ml-auto t-mono text-content-tertiary" style={{ fontSize: 11 }}>
            {audit_id}
          </span>
        )}
      </div>

      <ol className="relative ml-1">
        {path.map((h, i) => {
          const s = STATUS[h.status];
          const ontology = h.kind === "ontology";
          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
              className="relative flex gap-3 pb-3 last:pb-0"
            >
              {/* connector */}
              {i < path.length - 1 && (
                <span className="absolute left-[10px] top-6 h-full w-px bg-line" aria-hidden />
              )}
              <span className={"mt-0.5 shrink-0 " + s.cls}>
                <s.Icon size={20} weight="fill" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={[
                      "t-label-sm rounded-xs px-1.5 py-0.5",
                      ontology
                        ? "bg-ai-surface text-ai font-mono"
                        : "bg-brand-50 text-brand",
                    ].join(" ")}
                  >
                    {ontology ? "ONTOLOGY" : "SPINE"}
                  </span>
                  <span className="t-body-sm font-semibold text-content-primary">{h.node}</span>
                  {h.edge && (
                    <span className="t-mono text-content-tertiary" style={{ fontSize: 11 }}>
                      –[{h.edge}]→
                    </span>
                  )}
                </div>
                {h.detail && <p className="mt-0.5 t-body-sm text-content-secondary">{h.detail}</p>}
              </div>
            </motion.li>
          );
        })}
      </ol>

      {confidence != null && (
        <p className="mt-2 t-label-sm text-content-tertiary">
          Authored by deterministic NBA · explained, never originated · confidence{" "}
          {(confidence * 100).toFixed(0)}%
        </p>
      )}
    </div>
  );
}
