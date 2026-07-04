/**
 * Transfer (YONO Pay) — DESIGN.md §2.4 / §5.4. 4-step flow: recipient → amount → confirm → result.
 * AI suggestion chip (§8.4 Pattern 1) appears once enough digits are typed. Confirm is the HITL gate.
 */
import { motion } from "framer-motion";
import { useState } from "react";
import { AppBar } from "../components/organisms/AppBar";
import { ConfirmationSheet } from "../components/organisms/ConfirmationSheet";
import { SBIButton } from "../components/atoms/SBIButton";
import { SBIInput } from "../components/atoms/SBIInput";
import { Sparkle } from "../lib/icons";
import { inr } from "../lib/format";
import { useUiStore } from "../store/uiStore";

const RECENTS = ["Priya Sharma", "Vikram Rent", "Mother", "Aman UPI"];
const MODES = ["UPI", "IMPS", "NEFT"];

export default function Transfer() {
  const aiEnabled = useUiStore((s) => s.aiEnabled);
  const [mode, setMode] = useState("UPI");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [done, setDone] = useState(false);

  const amt = Number(amount) || 0;
  const showAiChip = aiEnabled && recipient.toLowerCase().includes("priya") && amt >= 10 && amt !== 5000;

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="Send Money" back trailing={<span className="t-label-sm text-white/70 pr-2">SYNTHETIC</span>} />

      <div className="screen-stack p-4">
        <div className="flex gap-2 rounded-full bg-bg-surface p-1 shadow-e1">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={[
                "flex-1 rounded-full py-2 t-label transition-colors",
                m === mode ? "bg-brand text-white" : "text-content-secondary",
              ].join(" ")}
            >
              {m}
            </button>
          ))}
        </div>

        <div>
          <p className="t-section mb-2 px-1">Recents</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {RECENTS.map((r) => (
              <button
                key={r}
                onClick={() => setRecipient(r)}
                className="whitespace-nowrap rounded-full border border-line bg-bg-surface px-3 py-2 t-label-sm text-content-secondary"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <SBIInput
          label={mode === "UPI" ? "UPI ID or name" : "Account number"}
          placeholder="name@bank / 9876543210"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />

        <SBIInput
          label="Amount"
          inputMode="numeric"
          prefix="₹"
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          helper={amt ? inr(amt) : "Enter an amount"}
        />

        {showAiChip && (
          <motion.button
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setAmount("5000")}
            className="flex w-full items-center gap-2 rounded-lg border border-ai-border bg-ai-surface px-3 py-2.5 text-left"
          >
            <Sparkle size={16} weight="fill" className="text-ai shrink-0" />
            <span className="t-body-sm text-ai-text">
              You usually send <strong>₹5,000</strong> to Priya Sharma on this date.
            </span>
            <span className="ml-auto t-label-sm text-ai">Use ↗</span>
          </motion.button>
        )}

        <SBIButton full disabled={!recipient || amt < 1} onClick={() => setConfirm(true)}>
          Proceed to pay {amt ? inr(amt) : ""}
        </SBIButton>
        <p className="text-center t-label-sm text-content-tertiary">
          Limit ₹1,00,000 / day · {mode}
        </p>
      </div>

      <ConfirmationSheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Confirm payment"
        headline={inr(amt)}
        rows={[
          { k: "To", v: recipient || "—" },
          { k: "Mode", v: mode },
          { k: "From", v: "Savings ••• 4521" },
          { k: "Charges", v: "₹0" },
        ]}
        onConfirm={() => setDone(true)}
        successLabel="Payment sent"
      />

      {done && <span className="sr-only" role="status">Payment of {inr(amt)} sent</span>}
    </div>
  );
}
