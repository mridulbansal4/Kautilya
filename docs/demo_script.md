# Demo script (≈ 3–4 minutes)

**Setup:** backend on `:8000`, frontend on `:5173`. Open `http://localhost:5173`. The persona
switcher is on the left of the stage; the phone is centre; `/ops` is one click away (top-right).

Never say "chatbot", "assistant", or "GPT wrapper". Say: decision-intelligence layer, ontology,
next-best-action, activation, explainability, consent-native.

---

## Act 1 — Rajesh, the money shot (≈ 90s)

1. Land on Home as **Rajesh**. _"Same app every YONO user knows — nothing redesigned."_
2. A beat after the screen settles, the salary-credit signal fires: the AI slot shows **"AI is
   analysing your account…"** then the **AI Insight** card appears:
   _"₹40,000 has been sitting idle since your salary credit — about ₹1,400/yr in lost interest. A
   ₹250/day SIP moves your retirement goal from 30% toward on-track."_ (Confidence 92%.)
3. Tap the **info (Why am I seeing this?)** icon → the bottom sheet shows the **actual ontology path**:
   dormant → idle account → salary_credit → underfunded retirement goal → eligible SIP. _"The model did
   not invent this. A deterministic engine authored it; the language model only explained it."_
4. Tap **"Review this nudge"** → the **human-in-the-loop** confirm sheet: amount ₹250, reg-class,
   "Secured by 256-bit encryption", **Approve with MPIN**. _"Money never moves without a human gate."_
5. Approve → success tick → the card flips to **"Activated — nice move. Dormant → active,
   products-per-customer +1. The desk dashboard just ticked."**
6. Click **Executive dashboard** → the **Activation** funnel ticks **dormant → active**, products /
   customer ticks up. _End Act 1 on the business KPI, not the AI._

---

## Act 2 — Persona flip (≈ 60s)

1. Back on the phone, open the persona switcher → **Aarav, 21**. The UI **morphs**: Hinglish greeting
   _"Aur Aarav, kya scene hai?"_, a low ₹4,250 balance, a **gamified DCS ring + streak**, and a
   playful **₹100 micro-SIP** nudge. _"Same engine. Different life."_
2. Toggle **"Show reasoning path"** → the right panel shows the **identical governed spine**
   (Intent → Policy → Retrieval → Ontology → Rules → NBA → Explainer → HITL). _"Governance is constant;
   only the surface adapts."_
3. Switch to **Mohan, 68**. The fonts **grow (1.3×)**, the layout becomes **spacious + high-contrast**,
   choices **collapse to one**, a **scam-shield** banner appears, and the nudge is a **Senior Citizen
   FD** with _"talk to your branch manager"_ (human-in-loop, offered prominently). Toggle the reasoning
   path again: **same spine, SuggestSeniorFD authored**.
4. Narrate: _"One ontology, one governed engine, three lives — each spoken to in the voice they
   deserve, and never once is the model the source of the recommendation."_

---

## Act 3 — Executive value (≈ 45s)

1. `/ops` → **Activation Dashboard**: activation rate, products-per-customer, cost-to-income,
   digital-lending throughput, and the live dormant→active funnel.
2. **Adoption Barrier Twin**: users → friction nodes with cohort shares (reliability/timeout #1, VKYC
   abandonment, MF cognitive overload). Aggregated, anonymised — DPDP-clean.
3. **AI Observability**: hallucination attempts contained, policy violations prevented, retrieval
   failures (fail-closed), accept/reject ledger, confidence evolution above the 0.70 gate.
4. **Admin**: per-nudge kill-switches, consent-status monitor, audit-log search.
5. Close on the dashboard. _"We don't acquire more users. We wake up the 9 crore you already have."_

---

## Reject paths (optional, for a governance-focused room)

Hit the spine for `cust_reject_consent` / `cust_reject_eligibility` / `cust_reject_retrieval` (or run
`uv run pytest`) — the policy gate rejects, retrieval fails closed, ineligible candidates are blocked,
and **nothing renders**. That is the guardrail working, on stage.

## Stage parachute

If the network is flaky, run `VITE_MOCK=1 pnpm dev` — the three demo responses are bundled fixtures
(recorded backend output), so the demo runs with the backend down. Still no client-authored actions.
