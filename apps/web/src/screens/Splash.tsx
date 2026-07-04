/** Splash & Onboarding — DESIGN.md §2.1. Navy, wordmark, tagline, AI pre-warm greeting, skip. */
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkle } from "../lib/icons";
import { useAdaptive } from "../lib/adaptive";

export default function Splash() {
  const nav = useNavigate();
  const { profile } = useAdaptive();
  useEffect(() => {
    const t = setTimeout(() => nav("/app/login"), 2400);
    return () => clearTimeout(t);
  }, [nav]);
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-brand px-8 text-center text-white">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0, 0, 0, 1] }}
        className="grid h-20 w-20 place-items-center rounded-2xl bg-white/10"
      >
        <span className="t-headline font-bold">Y</span>
      </motion.div>
      <h1 className="mt-4 t-headline-sm">YONO</h1>
      <p className="mt-1 t-label uppercase tracking-[0.2em] text-white/70">You Only Need One</p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"
      >
        <Sparkle size={16} weight="fill" className="text-[var(--colour-ai-secondary)]" />
        <span className="t-body-sm text-white/85">{profile?.greeting ?? "Warming up your dashboard…"}</span>
      </motion.div>

      <button onClick={() => nav("/app/login")} className="absolute bottom-10 t-label text-white/70">
        Skip →
      </button>
    </div>
  );
}
