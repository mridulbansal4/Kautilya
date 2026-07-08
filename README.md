# YONO Adoption Copilot

> **An agentic, explainable, human-in-the-loop AI Intelligence Layer over a faithful,
> reverse-engineered SBI-YONO-style mobile banking UI.** It does not acquire users - it wakes up
> dormant ones and lifts products-per-customer.
>
> _"We don't acquire more users. We wake up the 9 crore you already have."_

Everything here is **SYNTHETIC**. No real SBI proprietary assets, logos, or customer data. Style is
"SBI-inspired", not a clone of brand assets.

---

## The one thing that wins the room

**One governed engine produces three radically different, perfectly appropriate experiences** for
three live personas - flip between them in real time with the persona switcher:

| Persona | Who | Surfaced action | How the UI adapts |
|---|---|---|---|
| **Rajesh, 42** | mid-career, idle surplus | `RecommendSIP` (₹250) | formal/advisory, 2 choices |
| **Aarav, 21** | college student | `RecommendMicroSIP` (₹100) | Hinglish, gamified DCS ring, 3 choices |
| **Mohan "Dadaji", 68** | senior pensioner | `SuggestSeniorFD` + scam-shield + "talk to your branch manager" | font 1.3×, spacious, high-contrast, 1 choice |

The **reasoning path and governance are identical** across all three - only the surfaced action and
its presentation adapt. Toggle **"Show reasoning path"** to see the same governed spine light up for
every persona.

---

## Architecture: the backend thinks, the frontend renders

```
FRONTEND (apps/web)                         BACKEND (apps/api) - the Governed Spine
React 18 - Vite - TS - Tailwind             FastAPI - embedded NetworkX graph - SQLite audit
Framer Motion - Zustand (UI state only)     ───────────────────────────────────────────────
  • phone UI (390×844) + 10 screens         Intent → Policy/Compliance gate → Retriever
  • 8 AI components                          → Ontology(graph) → Business Rules
  • PersonaSwitcher + reasoning inspector    → NBA (deterministic, the ONLY action author)
  • /ops executive dashboards                → Explainer (LLM, explanation-only)
  • NO ontology / NO NBA logic lives here    → Intervention → HITL gate → Audit write-back
        │  POST /v1/next-best-action                 Engines: DCS - Barrier Twin - Intent/Signal
        │  POST /v1/action/confirm                   Stores: graph + audit are local files
        └─ WS /v1/stream (live funnel tick)          (no services, no Docker)
```

The governed reasoning spine, the ontology, and every guardrail live **server-side** so that
"the model can't author a recommendation" and "money actions pass a human gate" are enforced by the
**architecture**, not by trusting the UI. The frontend can never construct an action - it requests
one, renders the one the backend authored, and POSTs the human's approval back.

---

## Quickstart (two terminals, no Docker)

```bash
# terminal 1 - backend (embedded graph + SQLite audit, seeds on first run)
cd apps/api && uv sync && uv run fastapi dev          # http://localhost:8000

# terminal 2 - frontend (proxies /v1 → :8000)
cd apps/web && pnpm install && pnpm dev               # http://localhost:5173
```

Open **http://localhost:5173** → the demo stage. **http://localhost:5173/ops** → executive dashboards.

```bash
# guardrail tests (must pass - §11 of the build contract)
cd apps/api && uv run pytest

# stage parachute - backend down? run the FE on bundled fixtures
cd apps/web && VITE_MOCK=1 pnpm dev
```

> **Windows / pnpm note:** if pnpm reports an ignored build script for `esbuild`, the repo already
> sets `allowBuilds: { esbuild: true }` in `pnpm-workspace.yaml`; re-run `pnpm install`.

---

## The governed reasoning spine (and its guardrails)

Every hop is logged and rendered in the reasoning-path inspector:

```
Intent → Policy/Compliance (can REJECT) → Governed Retrieval (fail closed)
       → Ontology traversal → Business Rules (eligibility/suitability)
       → NBA (deterministic - authors exactly one action)
       → Explainer (explanation-only - refuses with no action)
       → Personalised surface → Human-in-the-loop confirm → Audit write-back → dashboards
```

The `pytest` suite (`apps/api/tests/test_guardrails.py`) **fails the build** if any invariant breaks:

- `test_no_advice` - NBA never emits an `advice_prohibited` action
- `test_policy_gate` - missing consent ⇒ `rejected`, renders nothing
- `test_retrieval_fail_closed` - no grounding KFS ⇒ no nudge
- `test_confidence_gate` - confidence < 0.7 or failed reflection test ⇒ silent
- `test_hitl` - every money-touching verb requires a human approval before write-back
- `test_explainer_is_explanation_only` - fed no action, the explainer refuses
- `test_audit_completeness` / `test_dpdp_minimisation` - full lineage, banded inputs only

Three reject paths are demonstrable live: `cust_reject_consent`, `cust_reject_eligibility`,
`cust_reject_retrieval`.

---

## The three-act demo

See [`docs/demo_script.md`](docs/demo_script.md). In short:

1. **Rajesh (the money shot):** salary credit + ₹40k idle → AI Insight nudge with a visible Why-path →
   HITL confirm → success → `/ops` funnel ticks dormant→active, products-per-customer +1.
2. **Persona flip:** switch to Aarav (gamified ₹100 micro-SIP), then Dadaji (senior FD, scam-shield,
   branch escalation). Toggle "Show reasoning path": _same governance, different surface_.
3. **Executive:** `/ops` → Activation Dashboard → Adoption Barrier Twin → AI Observability.

---

## Repo layout

```
apps/api/   FastAPI - governed spine - ontology (NetworkX) - engines - audit - pytest guardrails
apps/web/   React - tokens from DESIGN.md - atoms→molecules→organisms→AI components - screens - /ops
docs/       architecture - ontology - personas - demo_script
DESIGN.md   the visual law (tokens, components, motion, a11y, AI-layer rules)
```

Further reading: [docs/architecture.md](docs/architecture.md) -
[docs/ontology.md](docs/ontology.md) - [docs/personas.md](docs/personas.md) -
[docs/yono_features.md](docs/yono_features.md) (real-YONO features + the AI layer in each) -
[docs/demo_script.md](docs/demo_script.md) - backend [apps/api/README.md](apps/api/README.md).

## Real YONO features (from the app walkthrough) - each with my AI layer

YONO Cash (cardless withdrawal) - YONO Pay hub (Scan & Pay, Quick Pay) - Investments hub
(MF/SIP, FD, Insurance, NPS, Demat) - Bill Pay & Recharge - Insta Loan (PAPL) - YONO Shop -
YONO Rewardz. See [docs/yono_features.md](docs/yono_features.md) for exactly what was added and the
AI feature woven into each.

---

## Notes

- **Visual law:** `DESIGN.md` is canonical for tokens/sizing/motion/a11y. AI-purple `#5C35CC` is a
  semantic AI-only token (DESIGN.md §8.3 Rule 5); Noto Sans is loaded for Devanagari + Latin.
- **Explainer:** deterministic template by default (no key needed). Set `EXPLAINER_BACKEND=anthropic`
  to route through the real Anthropic adapter - still explanation-only.
- **Graph backend:** embedded NetworkX by default; `schema.cypher` + `seed.cypher` ship as Neo4j
  credibility artifacts. A real Neo4j is a one-file swap behind the `GraphPort` interface.
- All data is labelled **SYNTHETIC**. No real SBI customer data, ever.
