/**
 * <AccountCard> — DESIGN.md §5.2. Gradient brand card, balance + visibility toggle, mono
 * account/IFSC, optional action row. The eye toggle announces state (a11y §7.3).
 */
import { motion } from "framer-motion";
import { useState } from "react";
import { inr, maskAccount } from "../../lib/format";
import { Eye, EyeSlash } from "../../lib/icons";

export function AccountCard({
  holder,
  type,
  amount,
  accountId,
  ifsc = "SBIN0001234",
  actions,
}: {
  holder: string;
  type: string;
  amount: number;
  accountId: string;
  ifsc?: string;
  actions?: React.ReactNode;
}) {
  const [shown, setShown] = useState(true);
  return (
    <div
      className="relative overflow-hidden rounded-lg p-5 text-white shadow-e3"
      style={{ background: "linear-gradient(135deg, var(--colour-blue-700), var(--colour-blue-500))" }}
    >
      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10" />
      <div className="flex items-center justify-between">
        <span className="t-label-sm uppercase tracking-wider text-white/75">
          {type} Account
        </span>
        <button
          onClick={() => setShown((s) => !s)}
          aria-label={shown ? "Balance shown, tap to hide" : "Balance hidden, tap to show"}
          aria-live="polite"
          className="grid h-11 w-11 place-items-center rounded-full text-white/90 hover:bg-white/10"
        >
          {shown ? <Eye size={20} /> : <EyeSlash size={20} />}
        </button>
      </div>

      <motion.div
        key={shown ? "v" : "h"}
        initial={{ opacity: 0.4 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        className="mt-2 t-headline"
      >
        {shown ? inr(amount) : "₹ • • • • • •"}
      </motion.div>

      <div className="mt-3 t-mono text-white/70">
        {maskAccount(accountId)} &nbsp;|&nbsp; IFSC {ifsc}
      </div>

      {actions && <div className="mt-4 flex gap-2">{actions}</div>}
    </div>
  );
}
