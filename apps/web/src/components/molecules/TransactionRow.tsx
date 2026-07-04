/**
 * <TransactionRow> — DESIGN.md §5.2. Leading category icon, 2-line title/meta, trailing signed
 * amount (green credit / red debit, never colour alone — sign + colour). Optional inline AI tag.
 */
import { PhIcon } from "../../lib/icons";
import { inr } from "../../lib/format";

export interface Txn {
  id: string;
  merchant: string;
  meta: string;
  amount: number; // +credit / -debit
  icon: string;
  channel?: string;
}

export function TransactionRow({
  txn,
  tag,
  onClick,
}: {
  txn: Txn;
  tag?: React.ReactNode;
  onClick?: () => void;
}) {
  const credit = txn.amount >= 0;
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--colour-neutral-100)]"
      aria-label={`${txn.merchant}, ${credit ? "credit" : "debit"} ${inr(Math.abs(txn.amount))}, ${txn.meta}`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--colour-neutral-100)] text-content-secondary">
        <PhIcon name={txn.icon} size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="t-title-sm text-content-primary truncate">{txn.merchant}</span>
          {tag}
        </span>
        <span className="block t-body-sm text-content-tertiary truncate">{txn.meta}</span>
      </span>
      <span className={"t-title-sm tabular-nums " + (credit ? "text-credit" : "text-debit")}>
        {credit ? "+" : "−"}
        {inr(Math.abs(txn.amount), false)}
      </span>
    </button>
  );
}
