# The three hero personas

One engine, one design system, three lived-in experiences. Each is seeded at a fixed id (`SYNTHETIC`)
so the demo is deterministic. The `AdaptiveUIProfile` is **derived server-side** from
`Persona × DCS × ScreenContext` (`apps/api/app/adaptive/adaptive_ui.py`) — the frontend only reads it.

## A) Aarav Mehta — 21, college student (`young_student`)

- **Ontology:** SA low balance, part-time stipend `salary_credit`, goals `gadget` + `credit_building`,
  dormant, digital_literacy 0.9, risk high, Hinglish. DCS: Payments high / Investments ~0.
- **Profile:** density `comfortable`, font 1.0, register `hinglish`, max_choices **3**, tone
  `playful_motivational`. Surfaced AI: spending widget, gamified insight, **DCS ring + streak**.
- **Surfaced NBA:** `RecommendMicroSIP (₹100)` + `SuggestCreditBuilder` (education-first).
- **Copy:** _"Chai chhod ke ₹100/week SIP? Over 1 year that's ₹5,200 + market growth. Build the habit,
  build your score."_ (passes the reflection test; never shaming. The `🔥` becomes a Phosphor flame.)

## B) Rajesh Kumar — 42, mid-career professional (`mid_career`) — the flagship

- **Ontology:** SA + FD, **idle_surplus true**, ₹40k idle since `salary_credit`, goals
  `retirement`(30%) + `education`, dormant, digital_literacy 0.6, risk medium. DCS: Payments high /
  Investments low / Credit medium.
- **Profile:** density `comfortable`, font 1.0, register `formal_bilingual`, max_choices **2**, tone
  `respectful_advisory`. Surfaced AI: insight card, spending widget, FD maturity countdown.
- **Surfaced NBA:** `RecommendSIP (₹250)` + `OfferTermCover`.
- **Copy:** _"₹40,000 has been sitting idle since your salary credit — about ₹1,400/yr in lost interest
  (illustrative). A ₹250/day SIP moves your retirement goal from 30% toward on-track."_

## C) Mohan Lal "Dadaji" — 68, senior pensioner (`senior`) — the buddha

- **Ontology:** SA high idle balance, `pension_credit`, goals `income` + `emergency`, dormant,
  digital_literacy 0.2, risk low, simple Hindi. DCS: Payments medium / everything else low.
- **Profile:** density `spacious`, **font 1.3**, register `simple_reassuring`, contrast **high**,
  max_choices **1**, tone `warm_protective`, **SimplifyUI** (bigger targets, fewer fields, one CTA).
  Surfaced AI: **scam-shield alert banner**, insight card, FD maturity.
- **Surfaced NBA:** `SuggestSeniorFD` (7.50%, +0.50% senior uplift), `ScamShieldAlert`,
  `EscalateToRM` ("talk to your branch manager" — offered prominently because trust > self-serve).
- **Copy:** _"Namaste. Your pension credit is secure. A Senior Citizen FD earns a higher assured rate
  (7.50%). Would you like our branch manager to call and explain? No app steps needed."_

## What the profile changes (visibly, across all three)

| Lever | Aarav | Rajesh | Mohan |
|---|---|---|---|
| `font_scale` | 1.0 | 1.0 | **1.3** |
| `density` | comfortable | comfortable | **spacious** |
| `contrast_mode` | standard | standard | **high** |
| `max_choices` | 3 | 2 | **1** |
| `copy_tone` | playful | advisory | warm/protective |
| structural | — | — | **SimplifyUI** |

The **reasoning path and governance are identical** — toggle "Show reasoning path" to see the same
spine (Intent → Policy → Retrieval → Ontology → Rules → NBA → Explainer → HITL) for every persona.
Only the surfaced action and its presentation adapt.
