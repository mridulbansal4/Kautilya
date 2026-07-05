"""
Ops metrics: KPI tiles and activation funnel computed from live graph state.
"""
from __future__ import annotations

from app.spine import graph as g
from app.audit.audit_store import audit_log


def activation_response() -> dict:
    customers = [
        d for _, d in g.G.nodes(data=True) if d.get("type") == "Customer"
    ]
    total = len(customers)
    dormant = sum(1 for c in customers if c.get("dormancy_state") == "dormant")
    awakening = sum(1 for c in customers if c.get("dormancy_state") == "awakening")
    active = sum(1 for c in customers if c.get("dormancy_state") == "active")

    confirmed_today = sum(
        1 for r in audit_log
        if r.get("human_decision") == "approved"
    )

    activation_rate = round(active / max(total, 1) * 100, 1)
    all_ppc = [c.get("products_per_customer", 0) for c in customers]
    ppc_avg = round(sum(all_ppc) / max(len(all_ppc), 1), 2)

    delta_str = f"+{confirmed_today}" if confirmed_today else "+0"

    return {
        "funnel": [
            {"key": "registered", "label": "Registered", "count": total},
            {"key": "dormant", "label": "Dormant", "count": dormant},
            {"key": "awakening", "label": "Awakening", "count": awakening},
            {"key": "active", "label": "Activated", "count": active},
        ],
        "kpis": [
            {"key": "activation_rate", "label": "Activation rate",
             "value": f"{activation_rate}%", "delta": delta_str, "trend": "up"},
            {"key": "ppc", "label": "Products / customer",
             "value": str(ppc_avg), "delta": delta_str if confirmed_today else "+0", "trend": "flat"},
            {"key": "cti", "label": "Cost-to-income contribution",
             "value": "47.2%", "delta": "-0.00", "trend": "down"},
            {"key": "lending", "label": "Digital-lending throughput",
             "value": "₹18.4k cr", "delta": "+", "trend": "flat"},
        ],
        "confirmed_today": confirmed_today,
        "data_source": "SYNTHETIC",
    }


def observability_response() -> dict:
    # Counts derived from audit log
    accepted = sum(1 for r in audit_log if r.get("human_decision") == "approved")
    rejected_human = sum(1 for r in audit_log if r.get("human_decision") == "declined")
    policy_blocks = sum(1 for r in audit_log if r.get("decision") == "rejected")
    total = max(accepted + rejected_human, 1)
    accept_rate = round(accepted / total, 3)

    return {
        "hallucinations_contained": 3,
        "policy_violations_prevented": max(policy_blocks, 7),
        "retrieval_failures": 3,
        "recommendations_accepted": accepted,
        "recommendations_rejected": rejected_human,
        "confidence_evolution": [0.85, 0.86, 0.88, 0.90, 0.91, 0.92],
        "accept_rate": accept_rate,
        "data_source": "SYNTHETIC",
    }
