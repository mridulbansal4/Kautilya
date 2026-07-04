/** <SBIIcon> — thin wrapper over the Phosphor registry (DESIGN.md §5.1 / Appendix C). */
import type { IconWeight } from "@phosphor-icons/react";
import { PhIcon } from "../../lib/icons";

export function SBIIcon({
  name,
  size = 24,
  weight = "regular",
  className,
}: {
  name: string;
  size?: number;
  weight?: IconWeight;
  className?: string;
}) {
  return <PhIcon name={name} size={size} weight={weight} className={className} />;
}
