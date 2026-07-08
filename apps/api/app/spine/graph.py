"""
Ontology graph (NetworkX) — the governed knowledge layer.

Nodes: Customer, Account, Goal, Product, LifeEvent, FrictionNode
Edges: HAS, DECLARED, TRIGGERED_BY, UNDERFUNDED_IMPLIES, ELIGIBLE_FOR, BLOCKED_BY

Seeds three hero customers (Rajesh, Aarav, Mohan) on first import.
Data is SYNTHETIC.
"""
from __future__ import annotations

import networkx as nx

# ── Singleton graph ───────────────────────────────────────────────────────────
G: nx.DiGraph = nx.DiGraph()


def _seed() -> None:
    """Seed the in-memory graph with synthetic hero customers + product catalogue."""

    # ── Products ──────────────────────────────────────────────────────────────
    G.add_node("prod_sip", type="Product", product_id="prod_sip",
               name="Index Growth SIP", family="MF", min_ticket=250,
               reg_class="distribution_allowed", kfs_ref="kfs_sip",
               illustrative_return="11% p.a. (not guaranteed)")
    G.add_node("prod_microsip", type="Product", product_id="prod_microsip",
               name="Micro-SIP Starter", family="MF", min_ticket=100,
               reg_class="distribution_allowed", kfs_ref="kfs_microsip",
               illustrative_return="market-linked")
    G.add_node("prod_seniorfd", type="Product", product_id="prod_seniorfd",
               name="Senior Citizen Fixed Deposit", family="FD", min_ticket=10000,
               reg_class="distribution_allowed", kfs_ref="kfs_seniorfd",
               illustrative_return="7.50% p.a.")
    G.add_node("prod_fd", type="Product", product_id="prod_fd",
               name="SBI Fixed Deposit", family="FD", min_ticket=1000,
               reg_class="distribution_allowed", kfs_ref="kfs_fd",
               illustrative_return="6.80% p.a.")

    # ── Friction nodes (Adoption Barrier Twin) ────────────────────────────────
    for fn in [
        dict(node_id="fric_reliability", label="App reliability / timeout",
             fric_type="reliability", screen="all", severity=0.9, cohort_share=0.34),
        dict(node_id="fric_vkyc", label="VKYC abandonment",
             fric_type="onboarding", screen="onboarding", severity=0.8, cohort_share=0.30),
        dict(node_id="fric_mf_overload", label="Cognitive overload - MF selection",
             fric_type="cognitive", screen="invest", severity=0.72, cohort_share=0.20),
        dict(node_id="fric_balance_hidden", label="Balance hidden by default",
             fric_type="ux", screen="home", severity=0.42, cohort_share=0.16),
        dict(node_id="fric_settings_flat", label="Flat settings hierarchy (20+ items)",
             fric_type="ux", screen="profile", severity=0.33, cohort_share=0.12),
    ]:
        G.add_node(fn["node_id"], type="FrictionNode", **fn)

    # ── Hero: Rajesh Kumar (mid-career, dormant) ──────────────────────────────
    G.add_node("cust_rajesh", type="Customer",
               customer_id="cust_rajesh", display_name="Rajesh Kumar",
               age_band="35-44", segment="salaried", archetype="mid_career",
               dormancy_state="dormant", registered_only=True,
               dcs_payments=80, dcs_savings=55, dcs_investments=25, dcs_credit=60, dcs_composite=56,
               products_per_customer=0, consent_investment_distribution=True)
    G.add_node("acc_rajesh_sa", type="Account", account_id="acc_rajesh_sa",
               acct_type="SA", balance_band="high", idle_surplus=True, kyc_level="full")
    G.add_node("acc_rajesh_fd", type="Account", account_id="acc_rajesh_fd",
               acct_type="FD", balance_band="medium", idle_surplus=False, kyc_level="full")
    G.add_node("goal_rajesh_ret", type="Goal", goal_id="goal_rajesh_ret",
               goal_type="retirement", target_band="high", funded_pct=0.3)
    G.add_node("goal_rajesh_edu", type="Goal", goal_id="goal_rajesh_edu",
               goal_type="education", target_band="high", funded_pct=0.45)
    G.add_node("evt_rajesh_salary", type="LifeEvent", event_type="salary_credit",
               customer_id="cust_rajesh")
    G.add_edges_from([
        ("cust_rajesh", "acc_rajesh_sa", {"rel": "HAS"}),
        ("cust_rajesh", "acc_rajesh_fd", {"rel": "HAS"}),
        ("cust_rajesh", "goal_rajesh_ret", {"rel": "DECLARED"}),
        ("cust_rajesh", "goal_rajesh_edu", {"rel": "DECLARED"}),
        ("acc_rajesh_sa", "evt_rajesh_salary", {"rel": "TRIGGERED_BY"}),
        ("goal_rajesh_ret", "prod_sip", {"rel": "UNDERFUNDED_IMPLIES"}),
        ("cust_rajesh", "prod_sip", {"rel": "ELIGIBLE_FOR"}),
    ])

    # ── Hero: Aarav Mehta (young student, dormant) ────────────────────────────
    G.add_node("cust_aarav", type="Customer",
               customer_id="cust_aarav", display_name="Aarav Mehta",
               age_band="18-24", segment="student", archetype="young_student",
               dormancy_state="dormant", registered_only=True,
               dcs_payments=82, dcs_savings=30, dcs_investments=5, dcs_credit=20, dcs_composite=38,
               products_per_customer=0, consent_investment_distribution=True)
    G.add_node("acc_aarav_sa", type="Account", account_id="acc_aarav_sa",
               acct_type="SA", balance_band="low", idle_surplus=False, kyc_level="full")
    G.add_node("goal_aarav_gadget", type="Goal", goal_id="goal_aarav_gadget",
               goal_type="gadget", target_band="low", funded_pct=0.2)
    G.add_node("goal_aarav_credit", type="Goal", goal_id="goal_aarav_credit",
               goal_type="credit_building", target_band="low", funded_pct=0.1)
    G.add_node("evt_aarav_salary", type="LifeEvent", event_type="salary_credit",
               customer_id="cust_aarav")
    G.add_edges_from([
        ("cust_aarav", "acc_aarav_sa", {"rel": "HAS"}),
        ("cust_aarav", "goal_aarav_gadget", {"rel": "DECLARED"}),
        ("cust_aarav", "goal_aarav_credit", {"rel": "DECLARED"}),
        ("acc_aarav_sa", "evt_aarav_salary", {"rel": "TRIGGERED_BY"}),
        ("goal_aarav_gadget", "prod_microsip", {"rel": "UNDERFUNDED_IMPLIES"}),
        ("cust_aarav", "prod_microsip", {"rel": "ELIGIBLE_FOR"}),
    ])

    # ── Hero: Mohan Lal / "Dadaji" (senior pensioner, dormant) ───────────────
    G.add_node("cust_mohan", type="Customer",
               customer_id="cust_mohan", display_name="Mohan Lal",
               age_band="65+", segment="pensioner", archetype="senior",
               dormancy_state="dormant", registered_only=True,
               dcs_payments=50, dcs_savings=35, dcs_investments=10, dcs_credit=15, dcs_composite=29,
               products_per_customer=0, consent_investment_distribution=True)
    G.add_node("acc_mohan_sa", type="Account", account_id="acc_mohan_sa",
               acct_type="SA", balance_band="high", idle_surplus=True, kyc_level="full")
    G.add_node("goal_mohan_income", type="Goal", goal_id="goal_mohan_income",
               goal_type="income", target_band="high", funded_pct=0.25)
    G.add_node("goal_mohan_emerg", type="Goal", goal_id="goal_mohan_emerg",
               goal_type="emergency", target_band="medium", funded_pct=0.5)
    G.add_node("evt_mohan_pension", type="LifeEvent", event_type="pension_credit",
               customer_id="cust_mohan")
    G.add_edges_from([
        ("cust_mohan", "acc_mohan_sa", {"rel": "HAS"}),
        ("cust_mohan", "goal_mohan_income", {"rel": "DECLARED"}),
        ("cust_mohan", "goal_mohan_emerg", {"rel": "DECLARED"}),
        ("acc_mohan_sa", "evt_mohan_pension", {"rel": "TRIGGERED_BY"}),
        ("goal_mohan_income", "prod_seniorfd", {"rel": "UNDERFUNDED_IMPLIES"}),
        ("cust_mohan", "prod_seniorfd", {"rel": "ELIGIBLE_FOR"}),
    ])

    # ── Reject personas ───────────────────────────────────────────────────────
    G.add_node("cust_reject_consent", type="Customer",
               customer_id="cust_reject_consent", display_name="Seema (no consent)",
               age_band="25-34", segment="salaried", archetype="mid_career",
               dormancy_state="dormant", registered_only=True,
               dcs_payments=60, dcs_savings=40, dcs_investments=10, dcs_credit=30, dcs_composite=40,
               products_per_customer=0, consent_investment_distribution=False)
    G.add_node("cust_reject_eligibility", type="Customer",
               customer_id="cust_reject_eligibility", display_name="Ravi (ineligible)",
               age_band="18-24", segment="student", archetype="young_student",
               dormancy_state="dormant", registered_only=True,
               dcs_payments=45, dcs_savings=20, dcs_investments=0, dcs_credit=10, dcs_composite=22,
               products_per_customer=0, consent_investment_distribution=True,
               min_kyc=True)  # incomplete KYC → ineligible
    G.add_node("cust_reject_retrieval", type="Customer",
               customer_id="cust_reject_retrieval", display_name="Anita (no grounding)",
               age_band="45-54", segment="salaried", archetype="mid_career",
               dormancy_state="dormant", registered_only=True,
               dcs_payments=70, dcs_savings=50, dcs_investments=30, dcs_credit=55, dcs_composite=55,
               products_per_customer=0, consent_investment_distribution=True,
               product_interest="exotic_derivative")  # no KFS → retrieval fail


def _build_customer_projection(cid: str) -> dict:
    """Build a CustomerProjection dict from the graph for a given customer_id."""
    if cid not in G.nodes:
        return {}
    n = G.nodes[cid]
    # accounts
    accs = [
        {
            "account_id": G.nodes[nb]["account_id"],
            "type": G.nodes[nb]["acct_type"],
            "balance_band": G.nodes[nb]["balance_band"],
            "idle_surplus": G.nodes[nb]["idle_surplus"],
            "kyc_level": G.nodes[nb]["kyc_level"],
        }
        for nb in G.successors(cid)
        if G.nodes[nb].get("type") == "Account"
    ]
    # goals
    goals = [
        {
            "goal_id": G.nodes[nb]["goal_id"],
            "type": G.nodes[nb]["goal_type"],
            "target_band": G.nodes[nb]["target_band"],
            "funded_pct": G.nodes[nb]["funded_pct"],
        }
        for nb in G.successors(cid)
        if G.nodes[nb].get("type") == "Goal"
    ]
    return {
        "customer_id": n["customer_id"],
        "display_name": n["display_name"],
        "age_band": n["age_band"],
        "segment": n["segment"],
        "archetype": n["archetype"],
        "dormancy_state": n["dormancy_state"],
        "registered_only": n["registered_only"],
        "dcs": {
            "payments": n["dcs_payments"],
            "savings": n["dcs_savings"],
            "investments": n["dcs_investments"],
            "credit": n["dcs_credit"],
            "composite": n["dcs_composite"],
        },
        "accounts": accs,
        "goals": goals,
        "products_per_customer": n["products_per_customer"],
        "data_source": "SYNTHETIC",
    }


def get_customer(customer_id: str) -> dict | None:
    if customer_id not in G.nodes:
        return None
    node = G.nodes[customer_id]
    if node.get("type") != "Customer":
        return None
    return _build_customer_projection(customer_id)


def get_all_customer_ids() -> list[str]:
    return [n for n, d in G.nodes(data=True) if d.get("type") == "Customer"]


def get_friction_nodes() -> list[dict]:
    raw = [d for _, d in G.nodes(data=True) if d.get("type") == "FrictionNode"]
    # remap fric_type → type for the API contract (BarrierNode shape)
    result = []
    for node in raw:
        n = dict(node)
        n["type"] = n.pop("fric_type", "unknown")
        result.append(n)
    return result


def get_eligible_products(customer_id: str) -> list[str]:
    """Return product node IDs the customer is eligible for (ELIGIBLE_FOR edge)."""
    return [
        nb for nb in G.successors(customer_id)
        if G.nodes[nb].get("type") == "Product"
           and G.edges[customer_id, nb].get("rel") == "ELIGIBLE_FOR"
    ]


def get_underfunded_goal(customer_id: str) -> dict | None:
    """Return the most underfunded goal (lowest funded_pct) for the customer."""
    goals = [
        G.nodes[nb]
        for nb in G.successors(customer_id)
        if G.nodes[nb].get("type") == "Goal"
    ]
    if not goals:
        return None
    return min(goals, key=lambda g: g["funded_pct"])


def get_product_for_goal(goal_id: str) -> dict | None:
    """Return the product implied by an underfunded goal."""
    if goal_id not in G.nodes:
        return None
    for nb in G.successors(goal_id):
        if G.nodes[nb].get("type") == "Product":
            return dict(G.nodes[nb])
    return None


def update_dormancy(customer_id: str, new_state: str) -> None:
    if customer_id in G.nodes:
        G.nodes[customer_id]["dormancy_state"] = new_state
        G.nodes[customer_id]["registered_only"] = False
        G.nodes[customer_id]["products_per_customer"] = (
            G.nodes[customer_id].get("products_per_customer", 0) + 1
        )


# Seed on module import
_seed()
