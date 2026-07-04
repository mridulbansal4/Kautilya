/** Indian number grouping (lakh/crore) + display helpers. */
export function inr(n: number, withSymbol = true): string {
  const s = Math.round(n).toString();
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3);
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + last3 : last3;
  return (withSymbol ? "₹" : "") + grouped;
}

/** Map a balance_band to an illustrative (SYNTHETIC) amount for the device UI. */
export function bandToAmount(band: string, type: string): number {
  const table: Record<string, number> = { low: 4250, medium: 48500, high: 124500 };
  const base = table[band] ?? 12500;
  return type === "FD" ? base * 2 : base;
}

export function maskAccount(id: string): string {
  const digits = id.replace(/\D/g, "").padStart(4, "0").slice(-4);
  return `XXXX XXXX ${digits || "4521"}`;
}

export function titleCase(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
