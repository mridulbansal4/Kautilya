/** <FilterChip> — DESIGN.md §5.2. 48dp tap target (chip + padding, a11y §7.2 fix). */
import { PhIcon } from "../../lib/icons";

export function FilterChip({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active?: boolean;
  icon?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={!!active}
      className={[
        "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3 t-label-sm transition-colors",
        active
          ? "border-brand bg-brand-50 text-brand"
          : "border-line bg-bg-surface text-content-secondary hover:bg-[var(--colour-neutral-100)]",
      ].join(" ")}
    >
      {icon && <PhIcon name={icon} size={16} />}
      {label}
    </button>
  );
}
