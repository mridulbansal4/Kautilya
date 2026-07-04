/** Shared ops widgets — premium exec aesthetic: mono numbers, hairline grouping, diffusion shadow. */
import { motion } from "framer-motion";
import type { KpiTile } from "../api/types";

export function OpsCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={
        "rounded-3xl border border-slate-200/70 bg-white p-6 " +
        "shadow-[0_20px_40px_-24px_rgba(15,23,42,0.18)] " +
        className
      }
    >
      {children}
    </div>
  );
}

export function Kpi({ tile, flash }: { tile: KpiTile; flash?: boolean }) {
  const trendColor =
    tile.trend === "up" ? "text-emerald-600" : tile.trend === "down" ? "text-sky-600" : "text-slate-400";
  return (
    <div className="flex flex-col gap-1 border-l border-slate-200/70 pl-4 first:border-l-0 first:pl-0">
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{tile.label}</span>
      <motion.span
        key={tile.value}
        initial={flash ? { backgroundColor: "rgba(92,53,204,0.18)" } : false}
        animate={{ backgroundColor: "rgba(92,53,204,0)" }}
        transition={{ duration: 1.1 }}
        className="rounded-md font-mono text-2xl font-semibold tracking-tight text-slate-900"
      >
        {tile.value}
      </motion.span>
      {tile.delta && <span className={"text-xs font-medium " + trendColor}>{tile.delta}</span>}
    </div>
  );
}

export function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ai">{eyebrow}</div>
      <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">{title}</h2>
    </div>
  );
}
