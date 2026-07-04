/** Profile & Settings — DESIGN.md §2.10. Grouped list, AI Preferences entry, danger zone. */
import { useNavigate } from "react-router-dom";
import { SBIAvatar } from "../components/atoms/SBIAvatar";
import { SectionHeader } from "../components/molecules/SectionHeader";
import { AppBar } from "../components/organisms/AppBar";
import { CaretRight, PhIcon } from "../lib/icons";
import { useAdaptive } from "../lib/adaptive";

const GROUPS: { title: string; items: { i: string; l: string; to?: string; danger?: boolean }[] }[] = [
  { title: "Services", items: [
    { i: "CurrencyInr", l: "YONO Cash (cardless withdrawal)", to: "/app/yono-cash" },
    { i: "TrendUp", l: "Pre-approved Loan", to: "/app/loan" },
    { i: "Gift", l: "YONO Rewardz", to: "/app/rewards" },
    { i: "Receipt", l: "Bills & Recharge", to: "/app/bills" },
  ] },
  { title: "Account", items: [{ i: "User", l: "Edit profile" }, { i: "FileText", l: "Statements & docs" }] },
  { title: "Preferences", items: [{ i: "Sparkle", l: "AI Preferences", to: "/app/profile/ai" }, { i: "Bell", l: "Notifications", to: "/app/notifications" }] },
  { title: "Security", items: [{ i: "ShieldCheck", l: "Devices & sessions" }, { i: "ShieldCheck", l: "Change MPIN" }] },
  { title: "Danger zone", items: [{ i: "Power", l: "Log out", danger: true }] },
];

export default function Profile() {
  const { customer } = useAdaptive();
  const nav = useNavigate();
  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="More" back />
      <div className="p-4">
        <div className="flex items-center gap-3 rounded-lg bg-bg-surface p-4 shadow-e1">
          <SBIAvatar name={customer?.display_name ?? "User"} size="lg" />
          <div>
            <div className="t-title-sm text-content-primary">{customer?.display_name}</div>
            <div className="t-body-sm text-content-tertiary">Customer ID ••• {customer?.customer_id.slice(-4)}</div>
          </div>
        </div>

        {GROUPS.map((g) => (
          <div key={g.title} className="mt-4">
            <SectionHeader>{g.title}</SectionHeader>
            <div className="divide-y divide-line overflow-hidden rounded-lg bg-bg-surface shadow-e1">
              {g.items.map((it) => (
                <button
                  key={it.l}
                  onClick={() => it.to && nav(it.to)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <span className={it.danger ? "text-debit" : "text-brand"}>
                    <PhIcon name={it.i} size={20} />
                  </span>
                  <span className={"flex-1 t-body " + (it.danger ? "text-debit" : "text-content-primary")}>
                    {it.l}
                  </span>
                  {!it.danger && <CaretRight size={18} className="text-content-tertiary" />}
                </button>
              ))}
            </div>
          </div>
        ))}
        <p className="mt-4 text-center t-label-sm text-content-tertiary">
          YONO Adoption Copilot · SYNTHETIC demo · no real SBI assets
        </p>
      </div>
    </div>
  );
}
