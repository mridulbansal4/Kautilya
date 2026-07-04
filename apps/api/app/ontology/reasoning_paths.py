"""
Signature reasoning paths (BUILD_PROMPT §4.4) — the demo's spine.

Given a customer, this traverses the REAL ontology graph and emits:
  • a candidate `Intent` (archetype-specific) carrying the required consent purpose, and
  • the ontology `ReasoningHop`s that light up the Why-path inspector.

The traversal is identical in shape across personas — that is the whole point: the
reasoning path stays the same; only the surfaced action's *presentation* adapts (§7).
Nothing here authors an action; it only finds the grounded candidate. NBA authors.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from ..contracts import ReasoningHop
from .graph_port import GraphPort

# Which goal each archetype's primary opportunity hangs off, and the required signal.
ARCHETYPE_INTENT = {
    "mid_career": dict(
        intent="retirement_investment",
        goal_type="retirement",
        required_signal={"salary_credit"},
        required_consent="investment_distribution",
        candidate_verb="RecommendSIP",
    ),
    "young_student": dict(
        intent="micro_investment_credit",
        goal_type="gadget",
        required_signal={"salary_credit", "new_device"},
        required_consent="investment_distribution",
        candidate_verb="RecommendMicroSIP",
    ),
    "senior": dict(
        intent="senior_income",
        goal_type="income",
        required_signal={"pension_credit"},
        required_consent="investment_distribution",
        candidate_verb="SuggestSeniorFD",
    ),
}


@dataclass
class Intent:
    archetype: str
    intent: str
    goal_type: str
    required_consent: str
    candidate_verb: str
    candidate_product_id: Optional[str] = None
    goal_funded_pct: float = 0.0
    idle_surplus: bool = False
    life_event_type: Optional[str] = None
    hops: list[ReasoningHop] = field(default_factory=list)
    grounded: bool = True


def detect_intent(graph: GraphPort, customer_id: str, signal: Optional[str]) -> Optional[Intent]:
    """Walk the graph and assemble the grounded candidate intent + Why-path hops."""
    customer = graph.get_customer(customer_id)
    persona = graph.get_persona(customer_id)
    if not customer or not persona:
        return None
    spec = ARCHETYPE_INTENT.get(persona.archetype)
    if not spec:
        return None

    hops: list[ReasoningHop] = []

    # hop 1 — Customer{dormancy} -HAS-> Account{idle_surplus}
    accounts = graph.get_accounts(customer_id)
    idle = next((a for a in accounts if a.idle_surplus), None)
    anchor = idle or (accounts[0] if accounts else None)
    hops.append(
        ReasoningHop(
            node=f"Customer{{dormancy:'{customer.dormancy_state}'}}",
            edge="HAS",
            detail=(
                f"Account{{type:'{anchor.type}', idle_surplus:{str(anchor.idle_surplus).lower()}}}"
                if anchor else "no account"
            ),
            kind="ontology",
            status="pass" if anchor else "reject",
        )
    )

    # hop 2 — Account -GENERATED-> Transaction -TRIGGERED_BY-> LifeEvent
    life_event = graph.latest_life_event(customer_id)
    hops.append(
        ReasoningHop(
            node="Transaction",
            edge="TRIGGERED_BY",
            detail=f"LifeEvent{{type:'{life_event.type if life_event else 'none'}'}}",
            kind="ontology",
            status="pass" if life_event else "info",
        )
    )

    # hop 3 — Customer -DECLARED-> Goal{type, funded_pct}
    pairs = graph.underfunded_goal_products(customer_id, spec["goal_type"])
    goal, product = (pairs[0] if pairs else (None, None))
    hops.append(
        ReasoningHop(
            node=f"Customer -> Goal{{type:'{spec['goal_type']}'}}",
            edge="DECLARED",
            detail=(f"funded_pct:{goal.funded_pct}" if goal else "goal not declared"),
            kind="ontology",
            status="pass" if goal else "reject",
        )
    )

    # hop 4 — Goal -UNDERFUNDED_IMPLIES-> Product
    hops.append(
        ReasoningHop(
            node=f"Goal -> Product",
            edge="UNDERFUNDED_IMPLIES",
            detail=(f"Product{{name:'{product.name}'}}" if product else "no product implied"),
            kind="ontology",
            status="pass" if product else "reject",
        )
    )

    return Intent(
        archetype=persona.archetype,
        intent=spec["intent"],
        goal_type=spec["goal_type"],
        required_consent=spec["required_consent"],
        candidate_verb=spec["candidate_verb"],
        candidate_product_id=product.product_id if product else None,
        goal_funded_pct=goal.funded_pct if goal else 0.0,
        idle_surplus=bool(idle),
        life_event_type=life_event.type if life_event else None,
        hops=hops,
        grounded=bool(goal and product),
    )
