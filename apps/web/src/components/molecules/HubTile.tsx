/** <HubTile> — a labelled action tile used by the Pay / Invest / Shop hubs (real-YONO landing grids). */
import { motion } from "framer-motion";
import { PhIcon } from "../../lib/icons";

export function HubTile({
  icon,
  label,
  sub,
  accent = "brand",
  onClick,
}: {
  icon: string;
  label: string;
  sub?: string;
  accent?: "brand" | "ai" | "credit";
  onClick?: () => void;
}) {
  const ring =
    accent === "ai" ? "bg-ai-surface text-ai" : accent === "credit" ? "bg-[var(--colour-green-50)] text-credit" : "bg-brand-50 text-brand";
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex min-h-[96px] flex-col items-start gap-2 rounded-lg bg-bg-surface p-3 text-left shadow-e1"
    >
      <span className={"grid h-10 w-10 place-items-center rounded-lg " + ring}>
        <PhIcon name={icon} size={20} weight="regular" />
      </span>
      <span className="leading-tight">
        <span className="block t-title-sm text-content-primary">{label}</span>
        {sub && <span className="block t-label-sm text-content-tertiary">{sub}</span>}
      </span>
    </motion.button>
  );
}
