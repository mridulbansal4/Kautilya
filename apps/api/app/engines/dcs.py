"""
Digital Confidence Score (BUILD_PROMPT §6.1). A composite per-customer score across
Payments / Savings / Investments / Credit. The whole system optimises to RAISE DCS;
it is surfaced to the user as a gamified ring and to execs as cross-sell-readiness.

Each hero persona starts at a different, deliberately shaped profile. Confirming a nudge
lifts the relevant pillar (see main.py confirm handler).
"""
from __future__ import annotations

from ..contracts import DcsBreakdown
from ..ontology.graph_port import GraphPort

# composite weighting across the four pillars
_W = {"payments": 0.30, "savings": 0.25, "investments": 0.25, "credit": 0.20}

# fixed hero profiles (PRD §7.2)
_HERO = {
    "cust_rajesh": dict(payments=80, savings=55, investments=25, credit=60),
    "cust_aarav": dict(payments=82, savings=30, investments=5, credit=20),
    "cust_mohan": dict(payments=50, savings=35, investments=10, credit=15),
}


def _composite(p: dict) -> int:
    return round(sum(p[k] * _W[k] for k in _W))


def compute(graph: GraphPort, customer_id: str) -> DcsBreakdown:
    if customer_id in _HERO:
        p = _HERO[customer_id]
        return DcsBreakdown(**p, composite=_composite(p))

    # generic derivation for synthetic customers from dormancy + holdings
    customer = graph.get_customer(customer_id)
    holdings = graph.get_holdings_count(customer_id)
    base = {"dormant": 25, "awakening": 45, "active": 65}.get(
        customer.dormancy_state if customer else "dormant", 30
    )
    p = dict(
        payments=min(95, base + 20),
        savings=min(90, base + 5),
        investments=min(90, base - 10 + holdings * 12),
        credit=min(90, base),
    )
    return DcsBreakdown(**p, composite=_composite(p))


def lift_pillar(breakdown: DcsBreakdown, pillar: str, by: int = 8) -> DcsBreakdown:
    data = breakdown.model_dump()
    data.pop("composite", None)
    if pillar in data:
        data[pillar] = min(100, data[pillar] + by)
    data["composite"] = _composite(data)
    return DcsBreakdown(**data)
