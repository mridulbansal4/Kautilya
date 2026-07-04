# The Ontology — the moat

The Ontology of the Customer's Financial Life. Iterated from the master report schema to make
Persona, AdaptiveUIProfile, Intervention, ConsentArtifact and AuditEvent first-class — so consent and
persona-adaptation are structural, not bolted on. Implemented in `apps/api/app/ontology/`.

## Nodes

| Node | Key attributes |
|---|---|
| `Customer` | `customer_id, age_band, segment, dcs, consent_state, dormancy_state, registered_only` |
| `Persona` *(new)* | `archetype{young_student\|mid_career\|senior}, digital_literacy, risk_appetite, preferred_language, font_scale_pref, cognitive_load_tolerance, vernacular_pref` |
| `AdaptiveUIProfile` *(derived)* | `density, font_scale, language_register, contrast_mode, max_choices, copy_tone, surfaced_ai_components[]` |
| `Account` | `account_id, type, balance_band, idle_surplus, kyc_level` (band, not raw — DPDP) |
| `Transaction` | `txn_id, type, amount_band, timestamp, channel` |
| `Goal` | `goal_id, type{retirement\|education\|emergency\|credit_building\|gadget\|income}, target_band, funded_pct` |
| `LifeEvent` | `event_id, type{salary_credit\|pension_credit\|new_device\|…}` |
| `Product` | `product_id, family, name, kfs_ref, eligibility_rules, min_ticket, senior_variant` |
| `Holding` | `holding_id, product_id, status` (products-per-customer = count) |
| `FrictionNode` | `node_id, type, screen, severity, cohort_share` (powers the Barrier Twin) |
| `Intervention` *(new)* | `kind, nba_class, reflection_test_passed, confidence` (never renders if reflection fails or confidence < 0.7) |
| `ConsentArtifact` *(new)* | `consent_id, purpose, granted, expires_at` (per-purpose, revocable) |
| `AuditEvent` *(new)* | `inputs, graph_path, reg_class, model_version, consent_id, human_decision, outcome` |

## Edges

```
(Persona)-[:PERSONA_OF]->(Customer)
(Customer)-[:HAS]->(Account)-[:GENERATED]->(Transaction)-[:TRIGGERED_BY]->(LifeEvent)
(Customer)-[:DECLARED]->(Goal)-[:UNDERFUNDED_IMPLIES]->(Product)
(Customer)-[:ELIGIBLE_FOR]->(Product)
(Customer)-[:HOLDS]->(Holding)-[:OF]->(Product)
(Customer)-[:HAS_CONSENT]->(ConsentArtifact)
(Customer)-[:HITS]->(FrictionNode)
```

## Governed action verbs

`RecommendSIP · RecommendMicroSIP · OfferTermCover · SuggestFD · SuggestSeniorFD · ReactivateAccount ·
SimplifyUI · SurfaceKFS · EscalateToRM · SuggestCreditBuilder · ScamShieldAlert`

Each verb declares (`apps/api/app/spine/nba.py::VERB_CONTRACTS`): its `nba_class`
(`service|alert|offer|education`), `regulatory_class`
(`advice_prohibited|distribution_allowed|service|education`), and whether it is money-touching.
**Money-touching ⇒ `human_in_loop` always.** No verb is ever `advice_prohibited` (SEBI RIA boundary).

## Signature reasoning paths (the demo spine)

**Rajesh — the money shot:**
```
(:Customer{dormancy:'dormant'})-[:HAS]->(:Account{idle_surplus:true})
  -[:GENERATED]->(:Transaction)-[:TRIGGERED_BY]->(:LifeEvent{type:'salary_credit'})
(:Customer)-[:DECLARED]->(:Goal{type:'retirement', funded_pct:0.3})-[:UNDERFUNDED_IMPLIES]->(:Product{name:'Index Growth SIP'})
WHERE eligible AND reg_class='distribution_allowed'   ⇒ RecommendSIP
```

**Aarav:** `age 18-24 → gadget/credit_building goal → Micro-SIP(min_ticket 100) + CreditBuilder`
**Mohan:** `age 65+ → pension_credit → income goal → SuggestSeniorFD + ScamShieldAlert + EscalateToRM`

The traversal shape is **identical** across personas — only the surfaced action's presentation adapts.

## Reject paths (demonstrable)

| Fixture | Rejects at | reason_code |
|---|---|---|
| `cust_reject_consent` | Policy gate (no granted `investment_distribution` consent) | `consent_missing` |
| `cust_reject_eligibility` | Business Rules (no `ELIGIBLE_FOR` edge) | `ineligible` |
| `cust_reject_retrieval` | Governed Retrieval (product's `kfs_ref` has no KFS doc) | `retrieval_miss` |

## Synthetic seed

`seed_synthetic.build_graph()` seeds the 3 hero personas at fixed ids + 3 reject fixtures + ~10,000
generated customers (seeded RNG → deterministic), giving the Barrier Twin a populated friction
distribution and the funnel a dormant-heavy cohort that **moves** when a nudge is confirmed. All
`SYNTHETIC`.
