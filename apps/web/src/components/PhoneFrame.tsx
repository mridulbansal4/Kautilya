/**
 * <PhoneFrame> — 390×844 device frame. Applies the active AdaptiveUIProfile to the phone tree:
 * --font-scale (whole-tree rescale), data-density (vertical rhythm), data-contrast (senior).
 * Switching persona animates the morph (DESIGN.md §6 ease-decelerate).
 */
import { motion } from "framer-motion";
import type { AdaptiveUIProfile } from "../api/types";

export function PhoneFrame({
  profile,
  children,
}: {
  profile: AdaptiveUIProfile | null;
  children: React.ReactNode;
}) {
  const fontScale = profile?.font_scale ?? 1;
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[44px] border-[10px] border-[#0b1220] bg-bg-app shadow-2xl"
      style={{ width: 390, height: 844 }}
    >
      {/* notch */}
      <div className="absolute left-1/2 top-0 z-[210] h-7 w-36 -translate-x-1/2 rounded-b-2xl bg-[#0b1220]" />
      {/* status bar */}
      <div className="absolute inset-x-0 top-0 z-[205] flex h-7 items-center justify-between px-6 text-[11px] font-semibold text-content-primary">
        <span>9:41</span>
        <span className="tracking-tight">YONO · SYNTHETIC</span>
        <span>100%</span>
      </div>

      <motion.div
        key={profile?.customer_id ?? "loading"}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0, 0, 0, 1] }}
        className="phone-root relative flex h-full w-full flex-col pt-7"
        data-density={profile?.density ?? "comfortable"}
        data-contrast={profile?.contrast_mode ?? "standard"}
        style={{ ["--font-scale" as string]: fontScale }}
      >
        {children}
      </motion.div>
    </div>
  );
}
