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
      {/* Dynamic Island */}
      <div className="absolute left-1/2 top-3 z-[210] h-[34px] w-[120px] -translate-x-1/2 rounded-[24px] bg-black shadow-[inset_0_0_2px_rgba(255,255,255,0.1)]" />
      {/* status bar */}
      <div className="absolute inset-x-0 top-0 z-[205] flex h-14 items-center justify-between px-8 text-[15px] font-semibold tracking-tight text-white drop-shadow-md">
        <span className="mt-1">9:41</span>
        <div className="mt-1 flex items-center gap-2">
           <svg className="h-3 w-4 fill-current opacity-80" viewBox="0 0 16 12">
             <path d="M1 11h2V7H1v4zm4 0h2V5H5v6zm4 0h2V3H9v8zm4-10v10h2V1h-2z"/>
           </svg>
           <svg className="h-3 w-4 fill-current opacity-80" viewBox="0 0 16 12">
             <path d="M8 1L0 9h16L8 1z"/>
           </svg>
           <span>100%</span>
        </div>
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
