/**
 * YONO Shop — real-YONO lifestyle marketplace: shopping, flights, trains, bus, hotels, movies,
 * food, education across 100+ partner merchants.
 * MY AI layer: relevance filter (DESIGN.md pain-point #17) so only contextually-relevant offers show,
 * cutting notification noise. SYNTHETIC.
 */
import { useState } from "react";
import { AppBar } from "../components/organisms/AppBar";
import { PhIcon, Sparkle } from "../lib/icons";

const CATS = [
  { i: "ShoppingCart", l: "Shopping", relevant: true },
  { i: "TrendUp", l: "Flights", relevant: true },
  { i: "ArrowsLeftRight", l: "Trains", relevant: true },
  { i: "House", l: "Hotels", relevant: false },
  { i: "Gift", l: "Movies", relevant: true },
  { i: "Storefront", l: "Bus", relevant: false },
  { i: "GraduationCap", l: "Education", relevant: true },
  { i: "Handshake", l: "Deals", relevant: false },
];

const DEALS = [
  { t: "10% off domestic flights", m: "with YONO · partner airlines" },
  { t: "Flat ₹150 off groceries", m: "first order on partner store" },
  { t: "Buy-1-get-1 movie tickets", m: "weekends only" },
];

export default function Marketplace() {
  const [relevantOnly, setRelevantOnly] = useState(true);
  const shown = relevantOnly ? CATS.filter((c) => c.relevant) : CATS;

  return (
    <div className="phone-scroll flex-1 overflow-y-auto pb-24">
      <AppBar title="YONO Shop" back />
      <div className="screen-stack p-4">
        <button
          onClick={() => setRelevantOnly((r) => !r)}
          className="flex w-full items-center gap-2 rounded-lg border border-ai-border bg-ai-surface px-3 py-2.5 text-left"
        >
          <Sparkle size={16} weight="fill" className="text-ai shrink-0" />
          <span className="t-body-sm text-ai-text">
            AI relevance filter <strong>{relevantOnly ? "ON" : "OFF"}</strong> — showing offers that match
            your activity, not every promotion.
          </span>
        </button>

        <div className="grid grid-cols-4 gap-3">
          {shown.map((c) => (
            <button key={c.l} className="flex flex-col items-center gap-2 rounded-lg bg-bg-surface p-3 shadow-e1">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-50 text-brand">
                <PhIcon name={c.i} size={20} />
              </span>
              <span className="t-label-sm text-content-secondary text-center leading-tight">{c.l}</span>
            </button>
          ))}
        </div>

        <div>
          <div className="t-section mb-2 px-1">Curated for you</div>
          <div className="space-y-3">
            {DEALS.map((d) => (
              <div key={d.t} className="flex items-center gap-3 rounded-lg bg-bg-surface p-4 shadow-e1">
                <span className="grid h-11 w-11 place-items-center rounded-lg bg-[var(--colour-amber-50)]" style={{ color: "var(--colour-amber-900)" }}>
                  <PhIcon name="Gift" size={20} />
                </span>
                <div className="flex-1">
                  <div className="t-title-sm text-content-primary">{d.t}</div>
                  <div className="t-body-sm text-content-tertiary">{d.m}</div>
                </div>
                <PhIcon name="CaretRight" size={18} className="text-content-tertiary" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
