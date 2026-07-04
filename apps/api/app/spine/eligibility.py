"""
Business Rules / Eligibility (spine hop 5) — eligibility · suitability · regulatory class.
Blocks ineligible or unsuitable candidates BEFORE the NBA can author an action
(BUILD_PROMPT §5). Guardrail: test_reasoning (correct reg_class) / reject on ineligibility.
"""
from __future__ import annotations

from dataclasses import dataclass

from ..contracts import ReasoningHop
from ..ontology.graph_port import GraphPort
from ..ontology.reasoning_paths import Intent


@dataclass
class EligibilityDecision:
    eligible: bool
    suitable: bool
    reason_code: str
    hop: ReasoningHop


# crude suitability matrix: archetype risk_appetite vs product family
_SUITABILITY = {
    "young_student": {"MF", "card", "FD"},
    "mid_career": {"MF", "insurance", "FD"},
    "senior": {"FD", "insurance"},   # no market-linked MF push to low-risk seniors
}


def evaluate(graph: GraphPort, customer_id: str, intent: Intent) -> EligibilityDecision:
    pid = intent.candidate_product_id
    if not pid:
        return EligibilityDecision(False, False, "no_candidate_product",
            ReasoningHop(node="Business Rules", detail="no grounded product",
                         kind="spine", status="reject"))

    product = graph.get_product(pid)
    if product is None:
        return EligibilityDecision(False, False, "unknown_product",
            ReasoningHop(node="Business Rules", detail="unknown product",
                         kind="spine", status="reject"))

    if not graph.is_eligible(customer_id, pid):
        return EligibilityDecision(False, False, "ineligible",
            ReasoningHop(node="Business Rules",
                         detail=f"customer not ELIGIBLE_FOR {product.name}",
                         kind="spine", status="reject"))

    persona = graph.get_persona(customer_id)
    allowed_families = _SUITABILITY.get(persona.archetype, set()) if persona else set()
    if product.family not in allowed_families:
        return EligibilityDecision(True, False, "unsuitable",
            ReasoningHop(node="Business Rules",
                         detail=f"{product.family} unsuitable for {persona.archetype}",
                         kind="spine", status="reject"))

    return EligibilityDecision(True, True, "ok",
        ReasoningHop(node="Business Rules",
                     detail=f"eligible + suitable for {product.name}",
                     kind="spine", status="pass"))
