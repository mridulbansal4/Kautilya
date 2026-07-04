/**
 * YONO Shop — real-YONO lifestyle marketplace: shopping, flights, trains, bus, hotels, movies,
 * food, education across 100+ partner merchants.
 * MY AI layer: relevance filter (DESIGN.md pain-point #17) so only contextually-relevant offers show,
 * cutting notification noise. SYNTHETIC.
 */
import { useState, useMemo } from "react";
import { AppBar } from "../components/organisms/AppBar";
import { PhIcon, Sparkle } from "../lib/icons";
import { useAdaptive } from "../lib/adaptive";

const CATS = [
  { i: "ShoppingCart", l: "Shopping" },
  { i: "TrendUp", l: "Flights" },
  { i: "ArrowsLeftRight", l: "Trains" },
  { i: "House", l: "Hotels" },
  { i: "Gift", l: "Movies" },
  { i: "Storefront", l: "Bus" },
  { i: "GraduationCap", l: "Education" },
  { i: "Handshake", l: "Deals" },
];

// Raw offer candidates
const CANDIDATE_OFFERS = [
  { id: "f1", cat: "Flights", t: "10% off domestic flights", m: "with YONO · partner airlines", affinity: ["mid_career", "student"], signal: "Weekend trip detected", icon: "TrendUp" },
  { id: "g1", cat: "Shopping", t: "Flat ₹150 off groceries", m: "first order on partner store", affinity: ["all"], signal: "Salary week", icon: "ShoppingCart" },
  { id: "m1", cat: "Movies", t: "Buy-1-get-1 movie tickets", m: "weekends only", affinity: ["student", "mid_career"], signal: "Friday evening detected", icon: "Gift" },
  { id: "h1", cat: "Health", t: "20% off Pharmacy", m: "Apollo 24|7", affinity: ["senior"], signal: "Monthly refill predicted", icon: "Handshake" },
  { id: "e1", cat: "Education", t: "Coursera Plus Trial", m: "1 month free", affinity: ["student", "early_career"], signal: "Upskilling goal", icon: "GraduationCap" },
];

class RecommendationEngine {
  constructor(private persona: string, private signalContext: string) {}

  public getTopOffers(limit: number = 3) {
    let pool = CANDIDATE_OFFERS;

    // 1. Persona Filter
    pool = pool.filter(o => o.affinity.includes("all") || o.affinity.includes(this.persona));

    // 2. Diversity Filter (never repeat categories)
    const seenCats = new Set<string>();
    const diverse: typeof CANDIDATE_OFFERS = [];
    
    for (const offer of pool) {
      if (!seenCats.has(offer.cat)) {
        diverse.push(offer);
        seenCats.add(offer.cat);
      }
    }

    // 3. Sort by signal match (mock implementation - prioritize offers where signal exists)
    diverse.sort((a, b) => b.signal.length - a.signal.length);

    return diverse.slice(0, limit);
  }
}

export default function Marketplace() {
  const { profile } = useAdaptive();
  const [relevantOnly, setRelevantOnly] = useState(true);
  
  // Pipeline execution
  const engine = useMemo(() => new RecommendationEngine(profile?.archetype || "mid_career", "weekend"), [profile?.archetype]);
  const DEALS = engine.getTopOffers(3);
  
  // Dedup categories based on what's relevant
  const relevantCats = new Set(DEALS.map(d => d.cat));
  const shown = relevantOnly ? CATS.filter((c) => relevantCats.has(c.l) || c.l === "Shopping") : CATS;

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
          <div className="t-section mb-3 px-2 font-bold tracking-widest">Curated for you</div>
          <div className="space-y-4">
            {DEALS.map((d) => (
              <div key={d.id} className="relative flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                {/* Reasoning micro-copy */}
                {relevantOnly && (
                  <div className="flex items-center gap-1.5 border-b border-slate-50 pb-3 mb-1">
                    <Sparkle size={14} weight="fill" className="text-ai shrink-0" />
                    <span className="text-[12px] font-medium text-slate-500 uppercase tracking-widest">{d.signal}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand/5 text-brand shadow-sm">
                    <PhIcon name={d.icon} size={24} weight="duotone" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[16px] font-semibold text-slate-900 leading-tight mb-0.5">{d.t}</div>
                    <div className="text-[14px] text-slate-500">{d.m}</div>
                  </div>
                  <PhIcon name="CaretRight" size={20} className="text-slate-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
