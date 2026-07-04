/**
 * <BottomSheet> — DESIGN.md §5.3. Scrim + slide-up sheet, role=dialog/aria-modal, focus on open,
 * Escape closes, focus trap. Rendered within the phone frame (not a global portal).
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { sheet } from "../../lib/motion";
import { X } from "../../lib/icons";

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  height = "70%",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const node = ref.current;
    node?.querySelector<HTMLElement>("button, [href], input, [tabindex]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && node) {
        const f = node.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-[500]">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={sheet}
            initial="hidden"
            animate="show"
            exit="exit"
            style={{ height }}
            className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-xl bg-bg-surface shadow-e24"
          >
            <div className="mx-auto mt-2 h-1 w-8 rounded-full bg-line" />
            {title && (
              <div className="flex items-center justify-between px-5 pt-2">
                <h2 className="t-title-lg text-content-primary">{title}</h2>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="grid h-12 w-12 place-items-center rounded-full text-content-secondary hover:bg-[var(--colour-neutral-100)]"
                >
                  <X size={24} />
                </button>
              </div>
            )}
            <div className="phone-scroll flex-1 overflow-y-auto px-5 pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
