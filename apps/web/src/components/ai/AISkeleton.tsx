/**
 * <AISkeleton> — DESIGN.md §8.3 Rule 6. Shimmer placeholder that RESERVES space before an AI
 * surface loads (CLS ≤ 0.1). If the AI takes > 3s the slot collapses silently (handled by caller).
 */
export function AISkeleton({ height = 132 }: { height?: number }) {
  return (
    <div
      aria-hidden
      className="ai-shimmer rounded-lg"
      style={{ height, contentVisibility: "auto" }}
    />
  );
}
