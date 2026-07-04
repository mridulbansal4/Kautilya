"""
Adoption Barrier Twin (BUILD_PROMPT §6.2 / §12). Aggregates FrictionNodes into the executive
graph (Users → Friction Nodes with cohort shares). Aggregated / anonymised → DPDP-clean:
no individual is identifiable, only cohort-level friction.
"""
from __future__ import annotations

from ..contracts import BarrierNode, BarrierResponse
from ..ontology.graph_port import GraphPort


def build(graph: GraphPort) -> BarrierResponse:
    rows = graph.friction_aggregate()
    total = len(graph.all_customer_ids())
    nodes = [
        BarrierNode(
            node_id=r["node_id"],
            label=r["label"],
            type=r["type"],
            screen=r["screen"],
            severity=r["severity"],
            cohort_share=r["cohort_share"],
        )
        for r in rows
    ]
    return BarrierResponse(nodes=nodes, total_users=total)
