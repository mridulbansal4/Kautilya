/** <QuickActionItem> — DESIGN.md §5.2. 48dp icon circle + label, 72dp tap target. */
import { motion } from "framer-motion";
import { PhIcon } from "../../lib/icons";

export function QuickActionItem({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-label={label}
      className="flex min-h-[72px] flex-col items-center gap-2 rounded-md p-1"
    >
      <span className="grid h-12 w-12 place-items-center rounded-full bg-bg-surface shadow-e1 text-brand">
        <PhIcon name={icon} size={22} weight="regular" />
      </span>
      <span className="t-label-sm text-content-secondary text-center leading-tight">{label}</span>
    </motion.button>
  );
}
