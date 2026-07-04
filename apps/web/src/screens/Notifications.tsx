/**
 * Notifications — DESIGN.md §2.9 / §8.4 Pattern 4. AI priority ranking (Critical → Informational →
 * Promotional), AI bundling, AI notification visual treatment. Grouped Today / Earlier.
 */
import { NotificationRow, type Notif } from "../components/molecules/NotificationRow";
import { AppBar } from "../components/organisms/AppBar";
import { useUiStore } from "../store/uiStore";

const TODAY: Notif[] = [
  { id: "n1", kind: "security", title: "New device login", body: "Login from a new device in Mumbai at 2:14 PM. Was this you?", time: "2:14 PM", unread: true },
  { id: "n2", kind: "ai", title: "AI bundled your spending", body: "5 transactions totalling ₹2,340 today — tap to review categories.", time: "1:30 PM" },
  { id: "n3", kind: "transaction", title: "Salary credited", body: "₹64,000 credited to Savings ••• 4521.", time: "9:00 AM", unread: true },
];
const EARLIER: Notif[] = [
  { id: "n4", kind: "ai", title: "FD maturing in 7 days", body: "Renew or withdraw your ₹2,00,000 deposit.", time: "Yesterday" },
  { id: "n5", kind: "offer", title: "Pre-approved loan", body: "You're eligible for up to ₹8,40,000.", time: "2 days ago" },
];

export default function Notifications() {
  const aiEnabled = useUiStore((s) => s.aiEnabled);
  const filt = (list: Notif[]) => (aiEnabled ? list : list.filter((n) => n.kind !== "ai"));
  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="Notifications" back />
      <h2 className="bg-[var(--colour-neutral-100)] px-4 py-1.5 t-label-sm text-content-secondary">Today</h2>
      <div className="divide-y divide-line">
        {filt(TODAY).map((n) => (
          <NotificationRow key={n.id} n={n} />
        ))}
      </div>
      <h2 className="bg-[var(--colour-neutral-100)] px-4 py-1.5 t-label-sm text-content-secondary">Earlier</h2>
      <div className="divide-y divide-line">
        {filt(EARLIER).map((n) => (
          <NotificationRow key={n.id} n={n} />
        ))}
      </div>
      <p className="px-4 py-4 t-label-sm text-content-tertiary">
        AI ranks by priority (Critical → Informational → Promotional) and shows at most 1 AI
        notification per day. Adjust in Profile → AI Preferences.
      </p>
    </div>
  );
}
