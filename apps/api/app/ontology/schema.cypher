// ─────────────────────────────────────────────────────────────────────────────
// YONO Adoption Copilot — Ontology schema (Neo4j credibility artifact).
// NOT run by the prototype (the demo uses the embedded NetworkX graph). This is the
// one-file swap target: neo4j_adapter.py implements the same GraphPort over this schema.
// All data is SYNTHETIC.
// ─────────────────────────────────────────────────────────────────────────────

// Uniqueness constraints (node keys)
CREATE CONSTRAINT customer_id    IF NOT EXISTS FOR (c:Customer)        REQUIRE c.customer_id IS UNIQUE;
CREATE CONSTRAINT account_id     IF NOT EXISTS FOR (a:Account)         REQUIRE a.account_id  IS UNIQUE;
CREATE CONSTRAINT product_id     IF NOT EXISTS FOR (p:Product)         REQUIRE p.product_id  IS UNIQUE;
CREATE CONSTRAINT goal_id        IF NOT EXISTS FOR (g:Goal)            REQUIRE g.goal_id     IS UNIQUE;
CREATE CONSTRAINT friction_id    IF NOT EXISTS FOR (f:FrictionNode)    REQUIRE f.node_id     IS UNIQUE;
CREATE CONSTRAINT consent_id     IF NOT EXISTS FOR (k:ConsentArtifact) REQUIRE k.consent_id  IS UNIQUE;
CREATE CONSTRAINT audit_id       IF NOT EXISTS FOR (e:AuditEvent)      REQUIRE e.event_id    IS UNIQUE;

// Node labels (documented for reference):
//   (:Customer {customer_id, age_band, segment, dcs, consent_state, dormancy_state, registered_only})
//   (:Persona {archetype, digital_literacy, risk_appetite, preferred_language, font_scale_pref,
//              cognitive_load_tolerance, vernacular_pref})
//   (:Account {account_id, type, balance_band, idle_surplus, kyc_level})
//   (:Transaction {txn_id, type, amount_band, timestamp, channel})
//   (:LifeEvent {event_id, type})
//   (:Goal {goal_id, type, target_band, funded_pct})
//   (:Product {product_id, family, name, kfs_ref, min_ticket, senior_variant})
//   (:Holding {holding_id, product_id, status})
//   (:FrictionNode {node_id, type, screen, severity, cohort_share})
//   (:ConsentArtifact {consent_id, purpose, granted, expires_at})
//   (:AuditEvent {event_id, action_id, inputs, graph_path, reg_class, model_version,
//                 consent_id, human_decision, outcome})

// Relationships:
//   (Persona)-[:PERSONA_OF]->(Customer)
//   (Customer)-[:HAS]->(Account)-[:GENERATED]->(Transaction)-[:TRIGGERED_BY]->(LifeEvent)
//   (Customer)-[:DECLARED]->(Goal)-[:UNDERFUNDED_IMPLIES]->(Product)
//   (Customer)-[:ELIGIBLE_FOR]->(Product)
//   (Customer)-[:HOLDS]->(Holding)-[:OF]->(Product)
//   (Customer)-[:HAS_CONSENT]->(ConsentArtifact)
//   (Customer)-[:HITS]->(FrictionNode)
