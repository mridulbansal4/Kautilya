"""
Activation + Observability metrics (BUILD_PROMPT §12). Reads the live dormancy distribution
from the ontology graph and the AuditStore, so the funnel and KPI tiles MOVE the instant a
nudge is confirmed on stage.
"""
from __future__ import annotations

from ..audit.audit_store import AuditStore
from ..contracts import (
    ActivationResponse,
    FunnelStage,
    KpiTile,
    ObservabilityResponse,
)
from ..ontology.graph_port import GraphPort

# baseline aggregate KPIs (SYNTHETIC scorecard mirroring SBI's framing)
_BASE_PRODUCTS_PER_CUSTOMER = 2.30
_BASE_COST_TO_INCOME = 47.2
_BASE_DIGITAL_LENDING = 18.4  # ₹ '000 cr throughput, illustrative


def build_activation(graph: GraphPort, audit: AuditStore) -> ActivationResponse:
    counts = graph.dormancy_counts()
    confirmed = audit.confirmed_count()
    total = sum(counts.values()) or 1

    funnel = [
        FunnelStage(key="registered", label="Registered", count=total),
        FunnelStage(key="dormant", label="Dormant", count=counts.get("dormant", 0)),
        FunnelStage(key="awakening", label="Awakening", count=counts.get("awakening", 0)),
        FunnelStage(key="active", label="Activated", count=counts.get("active", 0)),
    ]
    active_pct = counts.get("active", 0) / total * 100
    ppc = _BASE_PRODUCTS_PER_CUSTOMER + confirmed * 0.01

    kpis = [
        KpiTile(key="activation_rate", label="Activation rate",
                value=f"{active_pct:0.1f}%", delta=f"+{confirmed}", trend="up"),
        KpiTile(key="ppc", label="Products / customer",
                value=f"{ppc:0.2f}", delta=f"+{confirmed}", trend="up" if confirmed else "flat"),
        KpiTile(key="cti", label="Cost-to-income contribution",
                value=f"{_BASE_COST_TO_INCOME - confirmed * 0.05:0.1f}%",
                delta=f"-{confirmed * 0.05:0.2f}", trend="down"),
        KpiTile(key="lending", label="Digital-lending throughput",
                value=f"₹{_BASE_DIGITAL_LENDING + confirmed * 0.1:0.1f}k cr",
                delta="+", trend="up" if confirmed else "flat"),
    ]
    return ActivationResponse(funnel=funnel, kpis=kpis, confirmed_today=confirmed)


def build_observability(audit: AuditStore) -> ObservabilityResponse:
    accepted = audit.count(outcome="confirmed")
    declined = audit.count(outcome="declined")
    rejected = audit.count(outcome="rejected")
    # rejections by reason: retrieval misses are "hallucination attempts contained";
    # consent/eligibility are "policy violations prevented".
    halluc = audit.count(outcome="rejected", reason_code="retrieval_miss")
    policy_prevented = max(0, rejected - halluc)
    total_decided = accepted + declined or 1
    return ObservabilityResponse(
        hallucinations_contained=halluc,
        policy_violations_prevented=policy_prevented,
        retrieval_failures=halluc,
        recommendations_accepted=accepted,
        recommendations_rejected=declined,
        confidence_evolution=audit.confidence_evolution() or [0.85, 0.88, 0.9, 0.92],
        accept_rate=round(accepted / total_decided, 2),
    )
