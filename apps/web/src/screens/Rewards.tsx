/**
 * YONO Rewardz — real-YONO reward points.
 * MY AI layer: a variable-reward "ways to earn" that pays for completing *adoption* behaviours
 * (start a SIP, set up a bill auto-pay) — never for spending — tied to the DCS streak. SYNTHETIC.
 */
import { AppBar } from "../components/organisms/AppBar";
import { SectionHeader } from "../components/molecules/SectionHeader";
import { PhIcon, Sparkle } from "../lib/icons";
import { useAdaptive } from "../lib/adaptive";

const EARN = [
  { label: "Start your first SIP", points: 500, done: false },
  { label: "Set up a bill auto-pay", points: 250, done: false },
  { label: "Complete profile KYC", points: 100, done: true },
  { label: "Make 5 UPI payments", points: 150, done: true },
];

const REDEEM = [
  { label: "₹100 Amazon voucher", cost: 1000 },
  { label: "Movie ticket", cost: 1500 },
  { label: "₹250 fuel cashback", cost: 2500 },
];

export default function Rewards() {
  const { customer } = useAdaptive();
  const points = 1240 + (customer?.products_per_customer ?? 0) * 500;

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="YONO Rewardz" back />
      <div className="screen-stack p-4">
        <div
          className="rounded-lg p-5 text-white shadow-e3"
          style={{ background: "linear-gradient(135deg, var(--colour-ai-primary), var(--colour-ai-secondary))" }}
        >
          <span className="t-label-sm uppercase text-white/80">Reward points</span>
          <div className="mt-1 t-headline">{points.toLocaleString("en-IN")}</div>
          <span className="t-body-sm text-white/80">Earn by building good financial habits</span>
        </div>

        <div>
          <SectionHeader>Ways to earn</SectionHeader>
          <div className="divide-y divide-line rounded-lg bg-bg-surface shadow-e1">
            {EARN.map((e) => (
              <div key={e.label} className="flex items-center gap-3 px-4 py-3">
                <span className={"grid h-9 w-9 place-items-center rounded-full " + (e.done ? "bg-[var(--colour-green-50)] text-credit" : "bg-ai-surface text-ai")}>
                  <PhIcon name={e.done ? "CheckCircle" : "Sparkle"} size={18} weight="fill" />
                </span>
                <div className="flex-1">
                  <div className={"t-body " + (e.done ? "text-content-tertiary line-through" : "text-content-primary")}>{e.label}</div>
                </div>
                <span className="t-label-sm text-ai">+{e.points}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 px-1 t-label-sm text-content-tertiary inline-flex items-center gap-1">
            <Sparkle size={12} weight="fill" className="text-ai" /> Points reward adoption, never spending.
          </p>
        </div>

        <div>
          <SectionHeader>Redeem</SectionHeader>
          <div className="grid grid-cols-3 gap-3">
            {REDEEM.map((r) => (
              <button key={r.label} className="flex flex-col items-start gap-2 rounded-lg bg-bg-surface p-3 text-left shadow-e1">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand">
                  <PhIcon name="Gift" size={18} />
                </span>
                <span className="t-label-sm text-content-primary leading-tight">{r.label}</span>
                <span className="t-label-sm text-content-tertiary">{r.cost} pts</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
