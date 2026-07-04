/**
 * <AIMaturityCountdown> — DESIGN.md §8.2. FD maturity ribbon (on a tile) or reminder card.
 * Amber treatment, schedule icon. Surfaced for mid_career + senior personas.
 */
import { PhIcon } from "../../lib/icons";
import { inr } from "../../lib/format";

export function AIMaturityRibbon({ days = 7 }: { days?: number }) {
  return (
    <div
      className="flex items-center gap-2 rounded-b-md px-3 py-1.5 t-label-sm"
      style={{ background: "var(--colour-amber-50)", color: "var(--colour-amber-900)" }}
    >
      <PhIcon name="WarningCircle" size={14} weight="fill" />
      Matures in {days} days · Renew or withdraw?
    </div>
  );
}

export function AIMaturityCountdownCard({
  amount = 218400,
  days = 7,
  onRenew,
  onWithdraw,
}: {
  amount?: number;
  days?: number;
  onRenew?: () => void;
  onWithdraw?: () => void;
}) {
  return (
    <section className="rounded-lg border border-ai-border bg-bg-surface p-4 shadow-e2">
      <div className="flex items-center gap-1.5 t-label-sm text-ai">
        <PhIcon name="Sparkle" size={14} weight="fill" /> AI · FD Maturity
      </div>
      <div className="mt-1 t-title-sm text-content-primary">
        Your FD matures in {days} days
      </div>
      <div className="mt-1 t-body-sm text-content-secondary">
        Maturity value {inr(amount)} · prevailing rate 0.25% higher at renewal.
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={onRenew} className="min-h-[44px] rounded-sm bg-brand px-4 t-label text-white">
          Renew
        </button>
        <button onClick={onWithdraw} className="min-h-[44px] rounded-sm border border-line px-4 t-label text-content-secondary">
          Withdraw
        </button>
      </div>
    </section>
  );
}
