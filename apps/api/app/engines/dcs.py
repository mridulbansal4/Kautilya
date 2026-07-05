"""
Digital Confidence Score (DCS) engine.
Composite score across Payments / Savings / Investments / Credit.
North-star metric: a higher DCS → more activation → products-per-customer lifts.
"""
from __future__ import annotations

from app.spine import graph as g


def compute(customer_id: str) -> dict:
    """Return DCS breakdown dict for the customer."""
    node = g.G.nodes.get(customer_id)
    if node is None:
        return {"payments": 0, "savings": 0, "investments": 0, "credit": 0, "composite": 0}
    return {
        "payments": node.get("dcs_payments", 0),
        "savings": node.get("dcs_savings", 0),
        "investments": node.get("dcs_investments", 0),
        "credit": node.get("dcs_credit", 0),
        "composite": node.get("dcs_composite", 0),
    }


def apply_delta(customer_id: str, delta: float) -> None:
    """Nudge the DCS composite upward after a confirmed action."""
    node = g.G.nodes.get(customer_id)
    if node is None:
        return
    node["dcs_composite"] = min(100.0, node.get("dcs_composite", 0) + delta)
    node["dcs_investments"] = min(100.0, node.get("dcs_investments", 0) + delta * 0.5)
