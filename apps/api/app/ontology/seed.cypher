// ─────────────────────────────────────────────────────────────────────────────
// YONO Adoption Copilot — Seed (Neo4j credibility artifact, the Rajesh money-shot path).
// NOT run by the prototype. Mirrors seed_synthetic.build_graph() for the hero personas.
// SYNTHETIC.
// ─────────────────────────────────────────────────────────────────────────────

// Products
MERGE (sip:Product {product_id:'prod_sip', family:'MF', name:'Index Growth SIP',
       kfs_ref:'kfs_sip', min_ticket:250, senior_variant:false});
MERGE (sfd:Product {product_id:'prod_seniorfd', family:'FD', name:'Senior Citizen Fixed Deposit',
       kfs_ref:'kfs_seniorfd', min_ticket:10000, senior_variant:true});

// Hero: Rajesh (mid_career) — the money shot
MERGE (r:Customer {customer_id:'cust_rajesh', age_band:'35-44', segment:'salaried',
       dormancy_state:'dormant', registered_only:true, consent_state:'full'})
MERGE (pr:Persona {archetype:'mid_career', digital_literacy:0.6, risk_appetite:'medium',
       preferred_language:'formal_bilingual', font_scale_pref:1.0,
       cognitive_load_tolerance:0.7, vernacular_pref:false})
MERGE (pr)-[:PERSONA_OF]->(r)
MERGE (sa:Account {account_id:'acc_rajesh_sa', type:'SA', balance_band:'high',
       idle_surplus:true, kyc_level:'full'})
MERGE (r)-[:HAS]->(sa)
MERGE (t:Transaction {txn_id:'txn_rajesh_1', type:'credit', amount_band:'high'})
MERGE (sa)-[:GENERATED]->(t)
MERGE (le:LifeEvent {event_id:'ev_rajesh_salary', type:'salary_credit'})
MERGE (t)-[:TRIGGERED_BY]->(le)
MERGE (g:Goal {goal_id:'goal_rajesh_ret', type:'retirement', target_band:'high', funded_pct:0.30})
MERGE (r)-[:DECLARED]->(g)
MERGE (g)-[:UNDERFUNDED_IMPLIES]->(sip)
MERGE (r)-[:ELIGIBLE_FOR]->(sip)
MERGE (k:ConsentArtifact {consent_id:'consent_cust_rajesh_investment_distribution',
       purpose:'investment_distribution', granted:true, expires_at:'2027-12-31'})
MERGE (r)-[:HAS_CONSENT]->(k);

// The money-shot reasoning path (run to verify the traversal):
//   MATCH (c:Customer {customer_id:'cust_rajesh'})-[:HAS]->(a:Account {idle_surplus:true})
//         -[:GENERATED]->(:Transaction)-[:TRIGGERED_BY]->(:LifeEvent {type:'salary_credit'}),
//         (c)-[:DECLARED]->(goal:Goal {type:'retirement'})-[:UNDERFUNDED_IMPLIES]->(p:Product),
//         (c)-[:ELIGIBLE_FOR]->(p)
//   RETURN c, a, goal, p;   // => RecommendSIP
