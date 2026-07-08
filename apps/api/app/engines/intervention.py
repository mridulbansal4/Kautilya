"""
Intervention engine — applies the confirmed HITL action to the graph state.
Writes dormancy transitions and products-per-customer updates.
"""
from __future__ import annotations

from app.spine import graph as g
from app.engines import dcs as dcs_engine


def apply_confirmation(customer_id: str, human_decision: str) -> dict:
    """
    On human approval: transition dormant→active, +1 products-per-customer, +8 DCS.
    On decline: no state change.
    Returns a DashboardDelta dict.
    """
    if human_decision != "approved":
        return {
            "dormant_to_active": 0,
            "products_per_customer_delta": 0,
            "dcs_delta": 0,
            "activation_rate": _activation_rate(),
            "new_dormancy_state": None,
        }

    node = g.G.nodes.get(customer_id)
    if node is None:
        return {"dormant_to_active": 0, "products_per_customer_delta": 0,
                "dcs_delta": 0, "activation_rate": _activation_rate(), "new_dormancy_state": None}

    old_state = node.get("dormancy_state", "dormant")
    g.update_dormancy(customer_id, "active")
    dcs_engine.apply_delta(customer_id, 8.0)

    return {
        "dormant_to_active": 1 if old_state == "dormant" else 0,
        "products_per_customer_delta": 1,
        "dcs_delta": 8.0,
        "activation_rate": _activation_rate(),
        "new_dormancy_state": "active",
    }


def _activation_rate() -> float:
    """Compute live activation rate from the graph."""
    customers = [
        d for _, d in g.G.nodes(data=True) if d.get("type") == "Customer"
    ]
    if not customers:
        return 0.0
    active = sum(1 for c in customers if c.get("dormancy_state") == "active")
    return round(active / len(customers) * 100, 1)
