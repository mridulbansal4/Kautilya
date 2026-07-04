# Architecture

The frontend renders; the backend *thinks*. This is a real client/server system, so the governance
invariants are enforced structurally — not by trusting the UI.

## Design tenets (DESIGN.md §1) — enforced, not decorative

1. **Augment, don't replace** — every AI surface is additive and dismissible; killing AI leaves a
   fully working non-AI app (toggle it in Profile → AI Preferences).
2. **Trust through consistency** — AI components use the same token set; purple is reserved for AI.
3. **Low surprise, high delight** — AI appears where a helpful banker would, never a chatbot popup.
4. **Graceful degradation** — AI failure/timeout collapses the slot silently; the screen still works.
5. **Explain, don't assert** — every recommendation shows its reason and a "Why am I seeing this?" path.
6. **Accessible first** — WCAG AA (AAA on auth/transfer); 48dp targets; survives 200% font scale.

## The seam (`/v1` contract)

```
GET  /v1/customer/{id}                  → DPDP-minimised projection (bands only)
GET  /v1/adaptive-profile/{id}?screen=  → AdaptiveUIProfile (density, font_scale, register, …)
POST /v1/next-best-action               → runs the full spine → recommend | rejected | silent
POST /v1/action/confirm                 → the HITL gate → write-back + dashboard delta
GET  /v1/ops/{activation,barriers,observability}
WS   /v1/stream                         → live funnel/DCS tick on confirm
```

**Golden rule:** the frontend can never construct an action. It requests one, renders the one the
backend authored, and POSTs the human's approval back. With the backend down the worst case is
`VITE_MOCK=1` bundled fixtures — still no client-authored recommendations.

## Governed reasoning spine (`apps/api/app/spine/graph.py`)

```
Intent Detection            what is the user trying to do (uses the ontology to find a candidate)
  → Policy & Compliance     RBI/DPDP/SEBI/IRDAI · eligibility · consent — can REJECT (renders nothing)
  → Governed Retrieval      fetch grounding KFS — retrieval miss ⇒ fail closed (no ungrounded answer)
  → Knowledge Graph         traversable ontology relationships
  → Business Rules          eligibility · suitability · regulatory class — can reject
  → NBA Engine              DETERMINISTIC · the ONLY author of an action · one next-best-action
  → Explanation Layer       LLM · explanation-ONLY · refuses with no action
  → Personalised Experience adaptive surface / nudge card
  → Human-in-the-loop       money-touching ⇒ required approval (a DISTINCT gate from NBA)
  → Audit write-back        Ontology + (mock) YONO + Audit log + Dashboard delta
```

**Separation of duties is structural:** the NBA node *proposes*; the `/v1/action/confirm` endpoint
*approves*. The explainer is downstream and cannot originate. The policy engine runs *before* the NBA
node, so a model can never author a recommendation for a user it is not allowed to act for.

## Layering

- **`apps/api/app/ontology`** — `GraphPort` interface + `EmbeddedGraph` (NetworkX). A real Neo4j is a
  one-file swap (`neo4j_adapter.py`) with zero caller changes. `schema.cypher`/`seed.cypher` ship as
  credibility artifacts.
- **`apps/api/app/engines`** — DCS, Intervention, Barrier Twin, activation/observability metrics.
- **`apps/api/app/adaptive`** — `deriveAdaptiveUIProfile(persona, dcs, screen)`; the showpiece's brain
  lives server-side so adaptation is engine-driven.
- **`apps/api/app/audit`** — SQLite model-register; every authored/confirmed/rejected action logged.
- **`apps/web/src`** — tokens from DESIGN.md → Tailwind preset → atoms → molecules → organisms → AI
  components → screens → `/ops`. Zustand holds UI state only (active persona, toggles, dismissals).

## Performance & a11y budgets (DESIGN.md §7, §12.5)

- AI slots reserve space before load (CLS ≤ 0.1) and fail silently after a timeout.
- Persona morph uses `--ease-decelerate`; `prefers-reduced-motion` is honoured globally.
- The whole tree rescales from one CSS var (`--font-scale`) so the senior 1.3× scale is a single knob.
