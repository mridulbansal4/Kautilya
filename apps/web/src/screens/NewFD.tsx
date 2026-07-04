/** New FD — DESIGN.md §2.7. Amount + tenure form with live maturity calc + HITL confirm. */
import { useMemo, useState } from "react";
import { AppBar } from "../components/organisms/AppBar";
import { ConfirmationSheet } from "../components/organisms/ConfirmationSheet";
import { SBIButton } from "../components/atoms/SBIButton";
import { SBIInput } from "../components/atoms/SBIInput";
import { FilterChip } from "../components/molecules/FilterChip";
import { inr } from "../lib/format";
import { useAdaptive } from "../lib/adaptive";

const TENORS = [6, 12, 24, 36];

export default function NewFD() {
  const { profile } = useAdaptive();
  const senior = profile?.archetype === "senior";
  const rate = senior ? 7.5 : 7.0;
  const [amount, setAmount] = useState("");
  const [tenor, setTenor] = useState(12);
  const [confirm, setConfirm] = useState(false);

  const amt = Number(amount) || 0;
  const maturity = useMemo(() => Math.round(amt * (1 + (rate / 100) * (tenor / 12))), [amt, rate, tenor]);

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title={senior ? "Senior Citizen FD" : "New Fixed Deposit"} back />
      <div className="screen-stack p-4">
        <SBIInput
          label="Deposit amount"
          inputMode="numeric"
          prefix="₹"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
          helper={amt ? inr(amt) : `Minimum ${inr(senior ? 10000 : 5000)}`}
        />
        <div>
          <p className="t-section mb-2 px-1">Tenure (months)</p>
          <div className="flex gap-2">
            {TENORS.map((t) => (
              <FilterChip key={t} label={`${t}`} active={t === tenor} onClick={() => setTenor(t)} />
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-ai-surface p-4 text-center">
          <span className="t-label-sm text-content-tertiary">Maturity value at {rate}% p.a.</span>
          <div className="t-headline text-ai-text">{inr(maturity)}</div>
          <span className="t-body-sm text-content-secondary">Capital-safe · DICGC insured</span>
        </div>
        <SBIButton full disabled={amt < (senior ? 10000 : 5000)} onClick={() => setConfirm(true)}>
          Review &amp; confirm
        </SBIButton>
      </div>

      <ConfirmationSheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Confirm new FD"
        headline={inr(amt)}
        rows={[
          { k: "Product", v: senior ? "Senior Citizen FD" : "Fixed Deposit" },
          { k: "Rate", v: `${rate}% p.a.` },
          { k: "Tenure", v: `${tenor} months` },
          { k: "Maturity", v: inr(maturity) },
        ]}
        onConfirm={() => {}}
        successLabel="FD booked"
      />
    </div>
  );
}
