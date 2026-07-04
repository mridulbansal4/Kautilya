/** <SectionHeader> — DESIGN.md §5.2. Uppercase label + optional trailing link. */
export function SectionHeader({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex items-center justify-between px-1 py-2">
      <h2 className="t-section">{children}</h2>
      {action && (
        <button onClick={action.onClick} className="t-label-sm text-brand">
          {action.label}
        </button>
      )}
    </div>
  );
}
