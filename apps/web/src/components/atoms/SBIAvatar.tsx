/** <SBIAvatar> — DESIGN.md §5.1. Initials on brand-50; sizes 32/40/48/64. No "egg" icons. */
const SIZES = { sm: 32, md: 40, lg: 48, xl: 64 } as const;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function SBIAvatar({
  name,
  size = "md",
  onDark = false,
}: {
  name: string;
  size?: keyof typeof SIZES;
  onDark?: boolean;
}) {
  const px = SIZES[size];
  return (
    <div
      aria-hidden
      style={{ width: px, height: px, fontSize: px * 0.4 }}
      className={[
        "grid place-items-center rounded-full font-semibold shrink-0",
        onDark ? "bg-white/20 text-white ring-2 ring-white/40" : "bg-brand-50 text-brand",
      ].join(" ")}
    >
      {initials(name)}
    </div>
  );
}
