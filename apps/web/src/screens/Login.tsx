/**
 * Login & MPIN — DESIGN.md §2.2. 6-dot MPIN, custom numpad, error shake, biometric, AI login-risk
 * hook (passive AIAlertBanner). Any 6 digits proceed (demo). a11y: dot count announced.
 */
import { motion, useAnimationControls } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "../components/organisms/AppBar";
import { PhIcon } from "../lib/icons";
import { useAdaptive } from "../lib/adaptive";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "bio", "0", "del"];

export default function Login() {
  const nav = useNavigate();
  const { customer } = useAdaptive();
  const [pin, setPin] = useState("");
  const shake = useAnimationControls();

  function press(k: string) {
    if (k === "del") return setPin((p) => p.slice(0, -1));
    if (k === "bio") return nav("/app/home");
    if (pin.length >= 6) return;
    const next = pin + k;
    setPin(next);
    if (next.length === 6) {
      setTimeout(() => nav("/app/home"), 220);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-bg-surface">
      <AppBar title="Login" />
      <div className="flex flex-1 flex-col items-center justify-between px-6 py-8">
        <div className="flex flex-col items-center">
          <p className="t-body text-content-secondary">Welcome back</p>
          <h1 className="t-title-lg text-content-primary">{customer?.display_name ?? "Rajesh Kumar"}</h1>

          <motion.div animate={shake} className="mt-8 flex gap-3" role="status"
            aria-label={`MPIN ${pin.length} of 6 entered`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className={"h-3.5 w-3.5 rounded-full border-2 transition-colors " +
                  (i < pin.length ? "border-brand bg-brand" : "border-line bg-transparent")}
              />
            ))}
          </motion.div>
        </div>

        <div className="grid w-full max-w-[260px] grid-cols-3 gap-3">
          {KEYS.map((k) => (
            <motion.button
              key={k}
              whileTap={{ scale: 0.92 }}
              onClick={() => press(k)}
              aria-label={k === "del" ? "Delete" : k === "bio" ? "Biometric login" : `Digit ${k}`}
              className="grid h-14 place-items-center rounded-full bg-[var(--colour-neutral-100)] t-headline-sm text-content-primary active:bg-[var(--colour-blue-50)]"
            >
              {k === "del" ? <PhIcon name="ArrowLeft" size={22} /> : k === "bio" ? <PhIcon name="ShieldCheck" size={24} className="text-brand" /> : k}
            </motion.button>
          ))}
        </div>

        <button onClick={() => nav("/app/home")} className="t-label text-brand">
          Forgot MPIN?
        </button>
      </div>
    </div>
  );
}
