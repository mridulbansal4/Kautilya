/**
 * <AIAssistFAB> — DESIGN.md §8.2. Floating AI entry, above the bottom nav. Pulse rings on first
 * mount (once). Purple (AI-exclusive). aria-label per spec.
 */
import { motion } from "framer-motion";
import { Sparkle } from "../../lib/icons";

export function AIAssistFAB({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Open AI Banking Assistant"
      className="absolute right-4 z-[400] grid h-14 w-14 place-items-center rounded-full bg-ai text-white shadow-ai-strong"
      style={{ bottom: 76 }}
    >
      {[0, 0.4, 0.8].map((d, i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full bg-ai"
          initial={{ opacity: 0.4, scale: 1 }}
          animate={{ opacity: 0, scale: 1.8 }}
          transition={{ duration: 1.6, delay: d, repeat: 0 }}
          aria-hidden
        />
      ))}
      <Sparkle size={24} weight="fill" className="relative" />
    </button>
  );
}
