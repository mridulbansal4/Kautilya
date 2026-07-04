"""
Synthetic seed (BUILD_PROMPT §10). Builds the embedded ontology graph with:

  • the 3 hero personas at FIXED ids (deterministic demo): cust_aarav, cust_rajesh, cust_mohan
  • 3 demonstrable reject fixtures: cust_reject_consent, cust_reject_eligibility, cust_reject_retrieval
  • ~10,000 generated customers (seeded RNG) → realistic dormancy / friction distribution
    so the Adoption Barrier Twin is populated and the funnel has a cohort that MOVES.

EVERYTHING is SYNTHETIC. No real SBI customer data, ever. Balances are stored as *bands*.
"""
from __future__ import annotations

import random

import networkx as nx

from . import schema as S

HERO_IDS = ["cust_rajesh", "cust_aarav", "cust_mohan"]
REJECT_IDS = ["cust_reject_consent", "cust_reject_eligibility", "cust_reject_retrieval"]

# ── shared product catalogue (SBI-inspired, never branded) ────────────────────
PRODUCTS = [
    dict(product_id="prod_sip", family="MF", name="Index Growth SIP",
         kfs_ref="kfs_sip", min_ticket=250, senior_variant=False),
    dict(product_id="prod_microsip", family="MF", name="Micro-SIP Starter",
         kfs_ref="kfs_microsip", min_ticket=100, senior_variant=False),
    dict(product_id="prod_seniorfd", family="FD", name="Senior Citizen Fixed Deposit",
         kfs_ref="kfs_seniorfd", min_ticket=10000, senior_variant=True),
    dict(product_id="prod_fd", family="FD", name="Fixed Deposit",
         kfs_ref="kfs_fd", min_ticket=5000, senior_variant=False),
    dict(product_id="prod_termcover", family="insurance", name="Term Life Cover",
         kfs_ref="kfs_term", min_ticket=0, senior_variant=False),
    dict(product_id="prod_creditbuilder", family="card", name="Secured Credit Builder Card",
         kfs_ref="kfs_creditbuilder", min_ticket=0, senior_variant=False),
    # prod_unkfs deliberately has NO grounding KFS doc → retrieval fail-closed fixture
    dict(product_id="prod_unkfs", family="MF", name="Unverified Thematic Fund",
         kfs_ref="kfs_missing", min_ticket=500, senior_variant=False),
]

# ── friction nodes for the Adoption Barrier Twin (master report + DESIGN.md §11)
FRICTION = [
    dict(node_id="fric_reliability", label="App reliability / timeout", type="reliability",
         screen="all", severity=0.9, cohort_share=0.34),
    dict(node_id="fric_vkyc", label="VKYC abandonment", type="onboarding",
         screen="onboarding", severity=0.8, cohort_share=0.30),
    dict(node_id="fric_mf_overload", label="Cognitive overload — MF selection", type="cognitive",
         screen="invest", severity=0.72, cohort_share=0.20),
    dict(node_id="fric_balance_hidden", label="Balance hidden by default", type="ux",
         screen="home", severity=0.42, cohort_share=0.16),
    dict(node_id="fric_settings_flat", label="Flat settings hierarchy (20+ items)", type="ux",
         screen="profile", severity=0.33, cohort_share=0.12),
]


def _add_consent(g: nx.MultiDiGraph, cust_id: str, purpose: str, granted: bool) -> None:
    cid = f"consent_{cust_id}_{purpose}"
    g.add_node(cid, kind=S.CONSENT, purpose=purpose, granted=granted, expires_at="2027-12-31")
    g.add_edge(cust_id, cid, rel=S.HAS_CONSENT)


def _add_account(g, cust_id, acc_id, type_, balance_band, idle_surplus, kyc="full"):
    g.add_node(acc_id, kind=S.ACCOUNT, type=type_, balance_band=balance_band,
               idle_surplus=idle_surplus, kyc_level=kyc)
    g.add_edge(cust_id, acc_id, rel=S.HAS)


def _add_life_event(g, acc_id, ev_id, ev_type, txn_id):
    g.add_node(txn_id, kind=S.TRANSACTION, type="credit", amount_band="high",
               timestamp="2026-06-27T09:00:00", channel="neft")
    g.add_edge(acc_id, txn_id, rel=S.GENERATED)
    g.add_node(ev_id, kind=S.LIFE_EVENT, type=ev_type)
    g.add_edge(txn_id, ev_id, rel=S.TRIGGERED_BY)


def _add_goal(g, cust_id, goal_id, gtype, target_band, funded_pct, implies_product=None):
    g.add_node(goal_id, kind=S.GOAL, type=gtype, target_band=target_band, funded_pct=funded_pct)
    g.add_edge(cust_id, goal_id, rel=S.DECLARED)
    if implies_product:
        g.add_edge(goal_id, implies_product, rel=S.UNDERFUNDED_IMPLIES)


def _eligible(g, cust_id, *product_ids):
    for pid in product_ids:
        g.add_edge(cust_id, pid, rel=S.ELIGIBLE_FOR)


def _add_persona(g, cust_id, **kw):
    pid = f"persona_{cust_id}"
    g.add_node(pid, kind=S.PERSONA, **kw)
    g.add_edge(pid, cust_id, rel=S.PERSONA_OF)


def _hit_friction(g, cust_id, *friction_ids):
    for fid in friction_ids:
        g.add_edge(cust_id, fid, rel=S.HITS)


# ──────────────────────────────────────────────────────────────────────────────
def build_graph() -> nx.MultiDiGraph:
    g = nx.MultiDiGraph()

    # products
    for p in PRODUCTS:
        g.add_node(p["product_id"], kind=S.PRODUCT, eligibility_rules={}, **p)
    # friction nodes
    for f in FRICTION:
        g.add_node(f["node_id"], kind=S.FRICTION_NODE, **f)

    # ── HERO 1: Rajesh Kumar — 42, mid_career (the money shot) ────────────────
    g.add_node("cust_rajesh", kind=S.CUSTOMER, display_name="Rajesh Kumar",
               age_band="35-44", segment="salaried", dormancy_state="dormant",
               registered_only=True, consent_state="full")
    _add_persona(g, "cust_rajesh", archetype="mid_career", digital_literacy=0.6,
                 risk_appetite="medium", preferred_language="formal_bilingual",
                 font_scale_pref=1.0, cognitive_load_tolerance=0.7, vernacular_pref=False)
    _add_account(g, "cust_rajesh", "acc_rajesh_sa", "SA", "high", idle_surplus=True)
    _add_account(g, "cust_rajesh", "acc_rajesh_fd", "FD", "medium", idle_surplus=False)
    _add_life_event(g, "acc_rajesh_sa", "ev_rajesh_salary", "salary_credit", "txn_rajesh_1")
    _add_goal(g, "cust_rajesh", "goal_rajesh_ret", "retirement", "high", 0.30, "prod_sip")
    _add_goal(g, "cust_rajesh", "goal_rajesh_edu", "education", "high", 0.45, "prod_termcover")
    _eligible(g, "cust_rajesh", "prod_sip", "prod_termcover", "prod_fd")
    _add_consent(g, "cust_rajesh", "investment_distribution", True)
    _add_consent(g, "cust_rajesh", "account_analytics", True)
    _hit_friction(g, "cust_rajesh", "fric_mf_overload", "fric_balance_hidden")

    # ── HERO 2: Aarav Mehta — 21, young_student ───────────────────────────────
    g.add_node("cust_aarav", kind=S.CUSTOMER, display_name="Aarav Mehta",
               age_band="18-24", segment="student", dormancy_state="dormant",
               registered_only=True, consent_state="full")
    _add_persona(g, "cust_aarav", archetype="young_student", digital_literacy=0.9,
                 risk_appetite="high", preferred_language="hinglish",
                 font_scale_pref=1.0, cognitive_load_tolerance=0.9, vernacular_pref=False)
    _add_account(g, "cust_aarav", "acc_aarav_sa", "SA", "low", idle_surplus=False)
    _add_life_event(g, "acc_aarav_sa", "ev_aarav_stipend", "salary_credit", "txn_aarav_1")
    _add_goal(g, "cust_aarav", "goal_aarav_gadget", "gadget", "low", 0.20, "prod_microsip")
    _add_goal(g, "cust_aarav", "goal_aarav_credit", "credit_building", "low", 0.10, "prod_creditbuilder")
    _eligible(g, "cust_aarav", "prod_microsip", "prod_creditbuilder")
    _add_consent(g, "cust_aarav", "investment_distribution", True)
    _add_consent(g, "cust_aarav", "account_analytics", True)
    _hit_friction(g, "cust_aarav", "fric_reliability", "fric_mf_overload")

    # ── HERO 3: Mohan Lal "Dadaji" — 68, senior ───────────────────────────────
    g.add_node("cust_mohan", kind=S.CUSTOMER, display_name="Mohan Lal",
               age_band="65+", segment="pensioner", dormancy_state="dormant",
               registered_only=True, consent_state="full")
    _add_persona(g, "cust_mohan", archetype="senior", digital_literacy=0.2,
                 risk_appetite="low", preferred_language="simple_reassuring",
                 font_scale_pref=1.3, cognitive_load_tolerance=0.3, vernacular_pref=True)
    _add_account(g, "cust_mohan", "acc_mohan_sa", "SA", "high", idle_surplus=True)
    _add_life_event(g, "acc_mohan_sa", "ev_mohan_pension", "pension_credit", "txn_mohan_1")
    _add_goal(g, "cust_mohan", "goal_mohan_income", "income", "high", 0.25, "prod_seniorfd")
    _add_goal(g, "cust_mohan", "goal_mohan_emerg", "emergency", "medium", 0.50, "prod_fd")
    _eligible(g, "cust_mohan", "prod_seniorfd", "prod_fd")
    _add_consent(g, "cust_mohan", "investment_distribution", True)
    _add_consent(g, "cust_mohan", "account_analytics", True)
    _hit_friction(g, "cust_mohan", "fric_vkyc", "fric_reliability")

    # ── REJECT FIXTURES (must be demonstrable, BUILD_PROMPT §4.4) ──────────────
    # (a) missing the required consent purpose → policy gate rejects
    g.add_node("cust_reject_consent", kind=S.CUSTOMER, display_name="Consent-Missing Demo",
               age_band="35-44", segment="salaried", dormancy_state="dormant",
               registered_only=True, consent_state="partial")
    _add_persona(g, "cust_reject_consent", archetype="mid_career", digital_literacy=0.6,
                 risk_appetite="medium", preferred_language="formal_bilingual",
                 font_scale_pref=1.0, cognitive_load_tolerance=0.7, vernacular_pref=False)
    _add_account(g, "cust_reject_consent", "acc_rc_sa", "SA", "high", idle_surplus=True)
    _add_life_event(g, "acc_rc_sa", "ev_rc_salary", "salary_credit", "txn_rc_1")
    _add_goal(g, "cust_reject_consent", "goal_rc_ret", "retirement", "high", 0.30, "prod_sip")
    _eligible(g, "cust_reject_consent", "prod_sip")
    _add_consent(g, "cust_reject_consent", "investment_distribution", False)  # NOT granted

    # (b) has consent + goal but is NOT eligible for the implied product → rules reject
    g.add_node("cust_reject_eligibility", kind=S.CUSTOMER, display_name="Ineligible Demo",
               age_band="35-44", segment="salaried", dormancy_state="dormant",
               registered_only=True, consent_state="full")
    _add_persona(g, "cust_reject_eligibility", archetype="mid_career", digital_literacy=0.6,
                 risk_appetite="medium", preferred_language="formal_bilingual",
                 font_scale_pref=1.0, cognitive_load_tolerance=0.7, vernacular_pref=False)
    _add_account(g, "cust_reject_eligibility", "acc_re_sa", "SA", "high", idle_surplus=True)
    _add_life_event(g, "acc_re_sa", "ev_re_salary", "salary_credit", "txn_re_1")
    _add_goal(g, "cust_reject_eligibility", "goal_re_ret", "retirement", "high", 0.30, "prod_sip")
    _add_consent(g, "cust_reject_eligibility", "investment_distribution", True)
    # NOTE: no ELIGIBLE_FOR edge → business rules block it

    # (c) implied product has no grounding KFS doc → retriever fail-closed
    g.add_node("cust_reject_retrieval", kind=S.CUSTOMER, display_name="Retrieval-Miss Demo",
               age_band="35-44", segment="salaried", dormancy_state="dormant",
               registered_only=True, consent_state="full")
    _add_persona(g, "cust_reject_retrieval", archetype="mid_career", digital_literacy=0.6,
                 risk_appetite="medium", preferred_language="formal_bilingual",
                 font_scale_pref=1.0, cognitive_load_tolerance=0.7, vernacular_pref=False)
    _add_account(g, "cust_reject_retrieval", "acc_rr_sa", "SA", "high", idle_surplus=True)
    _add_life_event(g, "acc_rr_sa", "ev_rr_salary", "salary_credit", "txn_rr_1")
    _add_goal(g, "cust_reject_retrieval", "goal_rr_ret", "retirement", "high", 0.30, "prod_unkfs")
    _eligible(g, "cust_reject_retrieval", "prod_unkfs")
    _add_consent(g, "cust_reject_retrieval", "investment_distribution", True)

    # ── BULK: ~10,000 synthetic customers (seeded → deterministic) ─────────────
    _seed_bulk(g, n=10000)
    return g


def _seed_bulk(g: nx.MultiDiGraph, n: int) -> None:
    rng = random.Random(42)
    age_bands = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]
    age_w = [0.18, 0.27, 0.22, 0.15, 0.10, 0.08]
    # dormant-heavy cohort so activation has somewhere to move from
    dorm_states = ["dormant", "awakening", "active"]
    dorm_w = [0.58, 0.17, 0.25]
    friction_ids = [f["node_id"] for f in FRICTION]

    for i in range(n):
        cid = f"cust_syn_{i:05d}"
        age = rng.choices(age_bands, age_w)[0]
        dorm = rng.choices(dorm_states, dorm_w)[0]
        g.add_node(cid, kind=S.CUSTOMER, display_name=f"Synthetic {i:05d}",
                   age_band=age, segment="synthetic", dormancy_state=dorm,
                   registered_only=(dorm == "dormant"), consent_state="full")
        # each bulk customer hits 0-2 friction nodes (weighted by cohort_share)
        for fid, fdef in zip(friction_ids, FRICTION):
            if rng.random() < fdef["cohort_share"]:
                g.add_edge(cid, fid, rel=S.HITS)
        # ~25% hold a product already (products_per_customer baseline)
        if rng.random() < 0.25:
            pid = rng.choice(["prod_sip", "prod_fd", "prod_termcover"])
            hid = f"hold_{cid}"
            g.add_node(hid, kind=S.HOLDING, product_id=pid, status="active")
            g.add_edge(cid, hid, rel=S.HOLDS)
            g.add_edge(hid, pid, rel=S.OF)
