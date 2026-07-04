/**
 * Fixed Deposits — DESIGN.md §2.7. Portfolio card, FD tiles with rate badge + AIMaturityRibbon,
 * new-FD CTA. Senior persona gets the senior-citizen FD highlighted (0.50% uplift).
 */
import { useNavigate } from "react-router-dom";
import { AIMaturityRibbon } from "../components/ai/AIMaturityCountdown";
import { SBIBadge } from "../components/atoms/SBIBadge";
import { SBIButton } from "../components/atoms/SBIButton";
import { SectionHeader } from "../components/molecules/SectionHeader";
import { AppBar } from "../components/organisms/AppBar";
import { inr } from "../lib/format";
import { useAdaptive } from "../lib/adaptive";

const FDS = [
  { id: "fd1", principal: 200000, rate: 7.0, maturity: "04 Jul 2026", value: 218400, days: 7 },
  { id: "fd2", principal: 150000, rate: 6.8, maturity: "19 Mar 2027", value: 171200, days: 260 },
];

export default function FDList() {
  const nav = useNavigate();
  const { profile } = useAdaptive();
  const senior = profile?.archetype === "senior";

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="Fixed Deposits" back />
      <div className="screen-stack p-4">
        <div
          className="rounded-lg p-5 text-white shadow-e3"
          style={{ background: "linear-gradient(135deg, var(--colour-blue-700), var(--colour-blue-500))" }}
        >
          <span className="t-label-sm uppercase text-white/70">Total FD portfolio</span>
          <div className="mt-1 t-headline">{inr(389600)}</div>
          <span className="t-body-sm text-white/70">2 active deposits · avg 6.9%</span>
        </div>

        {senior && (
          <div className="rounded-lg border-2 border-ai-border bg-ai-surface p-4">
            <div className="flex items-center justify-between">
              <span className="t-title-sm text-ai-text">Senior Citizen FD</span>
              <SBIBadge variant="success">7.50% · +0.50%</SBIBadge>
            </div>
            <p className="mt-1 t-body text-content-secondary">
              Higher assured rate for 60+. Capital-safe, DICGC insured. A branch manager can set it up
              for you — no app steps needed.
            </p>
            <SBIButton variant="ai" full className="mt-3" onClick={() => nav("/app/fd/new")}>
              Open Senior Citizen FD
            </SBIButton>
          </div>
        )}

        <SectionHeader>Your deposits</SectionHeader>
        {FDS.map((fd) => (
          <button
            key={fd.id}
            onClick={() => nav(`/app/fd/${fd.id}`)}
            className="block w-full overflow-hidden rounded-lg bg-bg-surface text-left shadow-e1"
          >
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="t-title-sm text-content-primary">{inr(fd.principal)}</span>
                <SBIBadge variant="success">{fd.rate.toFixed(2)}% p.a.</SBIBadge>
              </div>
              <div className="mt-1 flex items-center justify-between t-body-sm text-content-tertiary">
                <span>Matures {fd.maturity}</span>
                <span className="t-title-sm text-brand">{inr(fd.value)}</span>
              </div>
            </div>
            {fd.days <= 30 && <AIMaturityRibbon days={fd.days} />}
          </button>
        ))}

        <SBIButton variant="secondary" full icon="Plus" onClick={() => nav("/app/fd/new")}>
          Open a new FD
        </SBIButton>
      </div>
    </div>
  );
}
