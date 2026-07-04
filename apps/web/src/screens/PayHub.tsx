/**
 * YONO Pay — the real-YONO payments hub. Scan & Pay (Bharat QR / UPI), Quick Pay (to a mobile
 * number, no account needed), Send to account, Bharat QR, Bill Pay, Mobile recharge, YONO Cash.
 *
 * MY AI layer: a persona-adaptive recipient suggestion chip (DESIGN.md §8.4 Pattern 1) + the
 * anomaly soft-confirm carries into the Send flow. SYNTHETIC.
 */
import { useNavigate } from "react-router-dom";
import { AccountCard } from "../components/molecules/AccountCard";
import { HubTile } from "../components/molecules/HubTile";
import { SectionHeader } from "../components/molecules/SectionHeader";
import { AppBar } from "../components/organisms/AppBar";
import { Sparkle } from "../lib/icons";
import { bandToAmount } from "../lib/format";
import { useAdaptive } from "../lib/adaptive";
import { useUiStore } from "../store/uiStore";

export default function PayHub() {
  const nav = useNavigate();
  const { customer } = useAdaptive();
  const aiEnabled = useUiStore((s) => s.aiEnabled);
  const a = customer?.accounts[0];

  const ACTIONS = [
    { icon: "QrCode", label: "Scan & Pay", sub: "Bharat QR / UPI", to: "/app/pay/scan" },
    { icon: "Lightning", label: "Quick Pay", sub: "To a mobile number", to: "/app/pay/send" },
    { icon: "ArrowsLeftRight", label: "Send to account", sub: "UPI · NEFT · IMPS", to: "/app/pay/send" },
    { icon: "CurrencyInr", label: "YONO Cash", sub: "Cardless withdrawal", to: "/app/yono-cash", accent: "credit" as const },
    { icon: "Receipt", label: "Pay Bills", sub: "Electricity, DTH…", to: "/app/bills" },
    { icon: "Lightning", label: "Recharge", sub: "Mobile · FASTag", to: "/app/bills" },
  ];

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="YONO Pay" back />
      <div className="screen-stack p-4">
        {a && (
          <AccountCard
            holder={customer!.display_name}
            type={a.type}
            amount={bandToAmount(a.balance_band, a.type)}
            accountId={a.account_id}
          />
        )}

        <div>
          <SectionHeader>Pay & transfer</SectionHeader>
          <div className="grid grid-cols-3 gap-3">
            {ACTIONS.map((x) => (
              <HubTile key={x.label} icon={x.icon} label={x.label} sub={x.sub} accent={x.accent} onClick={() => nav(x.to)} />
            ))}
          </div>
        </div>

        {aiEnabled && (
          <button
            onClick={() => nav("/app/pay/send")}
            className="flex w-full items-center gap-2 rounded-lg border border-ai-border bg-ai-surface px-3 py-3 text-left"
          >
            <Sparkle size={16} weight="fill" className="text-ai shrink-0" />
            <span className="t-body-sm text-ai-text">
              It's the 1st — you usually send <strong>₹5,000 rent to Priya Sharma</strong> today. Pay now?
            </span>
            <span className="ml-auto t-label-sm text-ai">Pay ↗</span>
          </button>
        )}

        <div>
          <SectionHeader action={{ label: "Manage", onClick: () => nav("/app/profile") }}>UPI</SectionHeader>
          <div className="rounded-lg bg-bg-surface p-4 shadow-e1">
            <div className="t-body text-content-primary">{(customer?.display_name?.split(" ")[0] || "user").toLowerCase()}@sbi</div>
            <div className="t-body-sm text-content-tertiary">Primary UPI ID · linked to Savings ••• 4521</div>
          </div>
        </div>
      </div>
    </div>
  );
}
