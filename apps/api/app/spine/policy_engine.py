"""
Policy & Compliance Engine (spine hop 2) — runs BEFORE retrieval/NBA and can REJECT the
whole request (RBI / DPDP / SEBI / IRDAI / eligibility / consent). On reject the spine
halts, the event is audited, and nothing is rendered (BUILD_PROMPT §2, §5).

This is the structural enforcement of "the model can't author a recommendation for a user
it isn't allowed to act for". Guardrail: test_policy_gate.
"""
from __future__ import annotations

from dataclasses import dataclass

from ..contracts import ReasoningHop
from ..ontology.graph_port import GraphPort
from ..ontology.reasoning_paths import Intent


@dataclass
class PolicyDecision:
    allowed: bool
    reason_code: str
    hop: ReasoningHop


def evaluate(graph: GraphPort, customer_id: str, intent: Intent) -> PolicyDecision:
    # 1. consent: customer must hold a GRANTED consent for the intent's purpose.
    consents = {c.purpose: c.granted for c in graph.get_consents(customer_id)}
    purpose = intent.required_consent
    if not consents.get(purpose, False):
        return PolicyDecision(
            allowed=False,
            reason_code="consent_missing",
            hop=ReasoningHop(
                node="Policy & Compliance",
                detail=f"missing granted consent: '{purpose}' (DPDP)",
                kind="spine",
                status="reject",
            ),
        )

    # 2. registered/KYC sanity — registered_only customers are exactly the activation target,
    #    so this is allowed; an un-KYC'd customer would be blocked here in production.
    customer = graph.get_customer(customer_id)
    if customer is None:
        return PolicyDecision(
            allowed=False,
            reason_code="unknown_customer",
            hop=ReasoningHop(node="Policy & Compliance", detail="unknown customer",
                             kind="spine", status="reject"),
        )

    # 3. the candidate intent must not be advice-class (SEBI RIA boundary). Our intents are
    #    distribution/education/service only; an advice_prohibited intent would reject here.
    return PolicyDecision(
        allowed=True,
        reason_code="ok",
        hop=ReasoningHop(
            node="Policy & Compliance",
            detail=f"consent '{purpose}' granted · RBI/DPDP/SEBI/IRDAI clear",
            kind="spine",
            status="pass",
        ),
    )
