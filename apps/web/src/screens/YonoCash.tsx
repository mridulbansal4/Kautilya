/**
 * YONO Cash — the signature SBI YONO innovation: cardless cash withdrawal at any SBI ATM / POS /
 * CSP. Generate a 6-digit code + reference number, valid for a short window, withdraw without a card.
 *
 * MY AI layer woven in: a persona-adaptive Scam-Shield (DESIGN.md §8 AIAlertBanner) — strongest for
 * the senior persona — warns never to share the code. SYNTHETIC.
 */
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { AIAlertBanner } from "../components/ai/AIAlertBanner";
import { SBIButton } from "../components/atoms/SBIButton";
import { SBIInput } from "../components/atoms/SBIInput";
import { FilterChip } from "../components/molecules/FilterChip";
import { AppBar } from "../components/organisms/AppBar";
import { CheckCircle, ShieldCheck } from "../lib/icons";
import { inr } from "../lib/format";
import { SPRING } from "../lib/motion";
import { useAdaptive } from "../lib/adaptive";
import { useUiStore } from "../store/uiStore";

const PRESETS = [500, 1000, 2000, 5000];

// deterministic 6-digit code from amount (no Math.random — stable demo)
function codeFor(amount: number): { code: string; ref: string } {
  const seed = (amount * 7919 + 31).toString().padStart(6, "0").slice(-6);
  const ref = (amount * 104729 + 11).toString().slice(-9).padStart(9, "0");
  return { code: seed, ref };
}

export default function YonoCash() {
  const { profile } = useAdaptive();
  const aiEnabled = useUiStore((s) => s.aiEnabled);
  const senior = profile?.archetype === "senior";

  const [amount, setAmount] = useState("");
  const [generated, setGenerated] = useState(false);
  const amt = Number(amount) || 0;
  const { code, ref } = useMemo(() => codeFor(amt || 1000), [amt]);

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="YONO Cash" back trailing={<span className="t-label-sm text-white/70 pr-2">No card needed</span>} />

      {!generated ? (
        <div className="screen-stack p-4">
          <div
            className="rounded-lg p-5 text-white shadow-e3"
            style={{ background: "linear-gradient(135deg, var(--colour-blue-700), var(--colour-blue-500))" }}
          >
            <span className="t-label-sm uppercase text-white/70">Withdraw without your card</span>
            <p className="mt-1 t-body-lg">Generate a code, withdraw cash at any SBI ATM, POS or Customer Service Point.</p>
          </div>

          {aiEnabled && (
            <AIAlertBanner
              severity={senior ? "critical" : "warning"}
              title="Scam-shield is on"
              body="The bank, an ATM, or any caller will NEVER ask you for your YONO Cash code. Only enter it yourself at the machine."
              primary="I understand"
              secondary="Learn more"
              onPrimary={() => {}}
              onSecondary={() => {}}
            />
          )}

          <SBIInput
            label="Withdrawal amount"
            inputMode="numeric"
            prefix="₹"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
            helper={amt ? inr(amt) : "₹500 – ₹10,000 · multiples of ₹500"}
          />
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <FilterChip key={p} label={inr(p)} active={amt === p} onClick={() => setAmount(String(p))} />
            ))}
          </div>

          <SBIButton full disabled={amt < 500 || amt > 10000} onClick={() => setGenerated(true)} icon="CurrencyInr">
            Generate YONO Cash code
          </SBIButton>
          <p className="text-center t-label-sm text-content-tertiary">
            From Savings ••• 4521 · code valid 30 minutes
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="screen-stack p-4"
        >
          <div className="rounded-lg border border-line bg-bg-surface p-6 text-center shadow-e2">
            <span className="inline-flex items-center gap-1.5 t-label-sm text-credit">
              <CheckCircle size={16} weight="fill" /> Code generated
            </span>
            <div className="mt-3 t-label-sm uppercase text-content-tertiary">Withdrawal code</div>
            <div className="t-mono text-content-primary" style={{ fontSize: "calc(40px * var(--font-scale))", letterSpacing: "0.35em" }}>
              {code}
            </div>
            <div className="mt-3 t-label-sm uppercase text-content-tertiary">Reference number</div>
            <div className="t-mono text-content-primary" style={{ fontSize: "calc(20px * var(--font-scale))" }}>{ref}</div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--colour-amber-50)] px-3 py-1.5 t-label-sm" style={{ color: "var(--colour-amber-900)" }}>
              Valid for 29:54 · {inr(amt)}
            </div>
          </div>

          <div className="rounded-lg bg-ai-surface p-4">
            <div className="flex items-center gap-2 t-title-sm text-ai-text">
              <ShieldCheck size={20} weight="fill" className="text-ai" /> Withdraw safely
            </div>
            <ol className="mt-2 list-decimal pl-5 t-body text-content-secondary">
              <li>At an SBI ATM, choose <strong>YONO Cash</strong>.</li>
              <li>Enter the reference number, then your 6-digit code.</li>
              <li>Collect your cash. Never share the code with anyone.</li>
            </ol>
          </div>

          <SBIButton variant="secondary" full onClick={() => setGenerated(false)}>
            Generate a new code
          </SBIButton>
        </motion.div>
      )}
    </div>
  );
}
