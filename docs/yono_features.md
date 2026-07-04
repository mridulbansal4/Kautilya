# Real-YONO features added (+ the AI layer woven into each)

Built from the real SBI YONO feature set shown in the step-by-step walkthrough
([How To Use SBI YONO](https://www.youtube.com/watch?v=FWhYEV-Mknw)) and the official
[YONO feature pages](https://sbi.bank.in/web/yono). Every screen reads the persona's
`AdaptiveUIProfile`, so the senior gets the simplified/large-type treatment automatically. All
SYNTHETIC.

| Real YONO feature | Where | My AI layer woven in |
|---|---|---|
| **YONO Cash** — cardless ATM/POS/CSP withdrawal (the signature feature): generate a 6-digit code + reference number, valid window, withdraw with no card | `screens/YonoCash.tsx` · `/app/yono-cash` | **Scam-Shield** (`AIAlertBanner`, severity escalates for the senior persona) — "never share this code"; safety steps |
| **YONO Pay hub** — Scan & Pay, Quick Pay (to mobile), Send to account, Bharat QR, Bill Pay, Recharge, YONO Cash | `screens/PayHub.tsx` · `/app/pay` | Persona recipient-suggestion chip (§8.4 Pattern 1) — "you usually send ₹5,000 rent to Priya today" |
| **Scan & Pay** — Bharat QR / UPI scanner + "My QR" to receive | `screens/ScanPay.tsx` · `/app/pay/scan` | — (native flow; AI stays out of the critical path) |
| **Investments hub** — Mutual Funds/SIP, FD, Insurance, NPS, Demat/Stocks, goal planner | `screens/Investments.tsx` · `/app/invest` | The engine-authored **SIP/MicroSIP/SeniorFD nudge** surfaces here and completes through the **HITL gate**; "Why am I seeing this?" shows the reasoning path |
| **Bill Pay & Recharge** — BBPS billers + mobile/FASTag recharge | `screens/BillPay.tsx` · `/app/bills` | **AI bill bundling / auto-reminder** — "3 bills, ₹2,689 due this week — pay all" (§8.4 / pain-point #12) |
| **Insta Loan (Pre-Approved Personal Loan / PAPL)** — pre-approved amount, EMI slider, instant disbursal | `screens/InstaLoan.tsx` · `/app/loan` | **Persona/DCS-adaptive eligibility**: real ₹8.4L pre-approval for mid-career, a **credit-builder path** for the student (never shaming), **branch-assist** (EscalateToRM) for the senior |
| **YONO Shop** — 100+ merchants: shopping, flights, trains, hotels, movies, education | `screens/Marketplace.tsx` · `/app/marketplace` | **AI relevance filter** — only contextually-relevant offers show, cutting notification noise (pain-point #17) |
| **YONO Rewardz** — reward points, earn & redeem | `screens/Rewards.tsx` · `/app/rewards` | **Adoption-reward variable rewards** — points for completing *adoption* behaviours (start a SIP, set auto-pay), **never for spending**, tied to the DCS streak |
| **Fixed Deposits** (already present, kept) — portfolio, FD tiles, new FD, senior-citizen variant | `screens/FD*.tsx` · `/app/fd` | `AIMaturityCountdown` ribbon + senior-FD highlight |

## Navigation wiring

- **Bottom nav:** Home · **Pay** (→ PayHub) · **Invest** (→ Investments) · **Shop** (→ YONO Shop) · More
- **Home quick actions:** Scan & Pay · YONO Cash · Pay Bills · Invest (capped by the persona's `max_choices`)
- **More tab → Services:** YONO Cash · Pre-approved Loan · YONO Rewardz · Bills & Recharge

## What is unchanged (my original PDF features, all intact)

The governed reasoning spine, ontology, NBA, explainer, DCS, Adoption Barrier Twin, the three
hero personas + persona morph, the reasoning-path inspector, and the `/ops` executive dashboards
(Activation, Barrier Twin, AI Observability, Admin) all still work exactly as before — the new
real-YONO screens are layered on top and reuse the same engine and design system.
