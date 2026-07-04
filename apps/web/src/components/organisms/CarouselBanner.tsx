/**
 * <CarouselBanner> — DESIGN.md §5.3. Full-bleed, dot indicators, 5s auto-advance paused on
 * reduced-motion. Promotions are YONO-native (never AI purple).
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Slide {
  id: string;
  title: string;
  body: string;
  from: string;
  to: string;
}

const SLIDES: Slide[] = [
  { id: "s1", title: "Pre-approved personal loan", body: "Up to ₹8,40,000 · instant disbursal", from: "#1A3F7A", to: "#2563EB" },
  { id: "s2", title: "0% forex markup card", body: "For your next trip abroad", from: "#00838F", to: "#1A3F7A" },
  { id: "s3", title: "Earn 7.5% on Senior FD", body: "Assured returns for 60+", from: "#15347A", to: "#3949AB" },
];

export function CarouselBanner() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  const s = SLIDES[i];
  return (
    <div className="relative h-[148px] overflow-hidden rounded-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={s.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 flex flex-col justify-end p-5 text-white"
          style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}
        >
          <span className="t-title text-white">{s.title}</span>
          <span className="t-body-sm text-white/80">{s.body}</span>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
        {SLIDES.map((sl, idx) => (
          <button
            key={sl.id}
            aria-label={`Go to slide ${idx + 1}`}
            onClick={() => setI(idx)}
            className={"h-1.5 rounded-full transition-all " + (idx === i ? "w-4 bg-white" : "w-1.5 bg-white/50")}
          />
        ))}
      </div>
    </div>
  );
}
