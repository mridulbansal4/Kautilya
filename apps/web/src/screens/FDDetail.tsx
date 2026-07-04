/** FD Detail — DESIGN.md §2.7. Single FD with AIMaturityCountdown reminder card. */
import { useNavigate } from "react-router-dom";
import { AIMaturityCountdownCard } from "../components/ai/AIMaturityCountdown";
import { AppBar } from "../components/organisms/AppBar";
import { SBIBadge } from "../components/atoms/SBIBadge";
import { inr } from "../lib/format";
import { useUiStore } from "../store/uiStore";

export default function FDDetail() {
  const nav = useNavigate();
  const aiEnabled = useUiStore((s) => s.aiEnabled);
  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="Deposit detail" back />
      <div className="screen-stack p-4">
        <div className="rounded-lg bg-bg-surface p-5 shadow-e1">
          <div className="flex items-center justify-between">
            <span className="t-headline-sm text-content-primary">{inr(200000)}</span>
            <SBIBadge variant="success">7.00% p.a.</SBIBadge>
          </div>
          <dl className="mt-4 divide-y divide-line">
            {[
              ["Maturity date", "04 Jul 2026"],
              ["Maturity value", inr(218400)],
              ["Interest payout", "On maturity"],
              ["Tenure", "12 months"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5">
                <dt className="t-body-sm text-content-tertiary">{k}</dt>
                <dd className="t-body text-content-primary">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        {aiEnabled && (
          <AIMaturityCountdownCard onRenew={() => nav("/app/fd")} onWithdraw={() => nav("/app/fd")} />
        )}
      </div>
    </div>
  );
}
