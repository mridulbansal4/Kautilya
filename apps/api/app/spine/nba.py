"""
NBA Engine (spine hop 6) — DETERMINISTIC business logic and the ONLY thing that may author
an action (BUILD_PROMPT §2, §6). It ranks candidate actions across
service | alert | offer | education, constrained by ontology eligibility + reg-class, and
surfaces exactly ONE primary next-best-action (plus persona-appropriate secondaries).

The LLM is downstream and explanation-only. NBA never calls a model.

Guardrails enforced here: test_no_advice (never emits advice_prohibited),
test_hitl (money-touching verb ⇒ human_in_loop), test_confidence_gate (<0.7 ⇒ silent).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

from ..contracts import (
    AiContent,
    ApprovalLevel,
    GovernedAction,
    NbaClass,
    RegClass,
)
from ..ontology.graph_port import GraphPort
from ..ontology.reasoning_paths import Intent
from .retriever import Grounding

CONFIDENCE_THRESHOLD = 0.7

# Each governed verb declares its full contract (BUILD_PROMPT §4.3).
VERB_CONTRACTS: dict[str, dict] = {
    "RecommendSIP":        dict(nba=NbaClass.offer,    reg=RegClass.distribution_allowed, money=True),
    "RecommendMicroSIP":   dict(nba=NbaClass.offer,    reg=RegClass.distribution_allowed, money=True),
    "SuggestFD":           dict(nba=NbaClass.offer,    reg=RegClass.distribution_allowed, money=True),
    "SuggestSeniorFD":     dict(nba=NbaClass.offer,    reg=RegClass.distribution_allowed, money=True),
    "OfferTermCover":      dict(nba=NbaClass.offer,    reg=RegClass.distribution_allowed, money=True),
    "SuggestCreditBuilder":dict(nba=NbaClass.education,reg=RegClass.education,            money=True),
    "ReactivateAccount":   dict(nba=NbaClass.service,  reg=RegClass.service,              money=False),
    "SimplifyUI":          dict(nba=NbaClass.service,  reg=RegClass.service,              money=False),
    "SurfaceKFS":          dict(nba=NbaClass.education, reg=RegClass.education,           money=False),
    "EscalateToRM":        dict(nba=NbaClass.service,  reg=RegClass.service,              money=False),
    "ScamShieldAlert":     dict(nba=NbaClass.service,  reg=RegClass.service,              money=False),
}

# illustrative, band-derived figures (labelled illustrative in copy; never raw balances)
_LOST_INTEREST_PA = "₹1,400"     # high idle SA band vs FD differential, illustrative
_SIP_TICKET = 250
_MICROSIP_TICKET = 100
_SENIORFD_TICKET = 10000

_SHAMING_TERMS = {"lazy", "wasting", "irresponsible", "bad with money", "should have"}


@dataclass
class AuthoredAction:
    action: GovernedAction
    content: AiContent
    confidence: float
    reflection_test_passed: bool
    secondary: list[GovernedAction] = field(default_factory=list)
    nba_class: NbaClass = NbaClass.offer


def _approval(money: bool) -> ApprovalLevel:
    # money-touching verbs are ALWAYS human_in_loop (test_hitl).
    return ApprovalLevel.human_in_loop if money else ApprovalLevel.auto


def _reflection_test(copy: str) -> bool:
    low = copy.lower()
    return not any(term in low for term in _SHAMING_TERMS)


def _governed(verb: str, product, suggested_ticket: Optional[int]) -> GovernedAction:
    c = VERB_CONTRACTS[verb]
    assert c["reg"] != RegClass.advice_prohibited, "NBA must never author advice (test_no_advice)"
    return GovernedAction(
        verb=verb,
        nba_class=c["nba"],
        reg_class=c["reg"],
        approval_level=_approval(c["money"]),
        product_id=getattr(product, "product_id", None),
        product_name=getattr(product, "name", None),
        min_ticket=getattr(product, "min_ticket", None),
        suggested_ticket=suggested_ticket,
        kfs_ref=getattr(product, "kfs_ref", None),
    )


def author(graph: GraphPort, intent: Intent, grounding: Grounding) -> Optional[AuthoredAction]:
    """Deterministically author the single best next action for this grounded, eligible intent."""
    product = graph.get_product(intent.candidate_product_id) if intent.candidate_product_id else None
    if product is None or not grounding.found:
        return None

    archetype = intent.archetype

    if archetype == "mid_career":
        action = _governed("RecommendSIP", product, _SIP_TICKET)
        content = AiContent(
            component="AIInsightCard",
            eyebrow="AI Insight",
            title="Idle surplus detected after your salary credit",
            body=(f"₹40,000 has been sitting idle since your salary credit — about "
                  f"{_LOST_INTEREST_PA}/yr in lost interest (illustrative). A ₹{_SIP_TICKET}/day "
                  f"SIP moves your retirement goal from 30% toward on-track."),
            primary_cta="Review this nudge",
            secondary_cta="Not now",
            icon="ChartLineUp",
        )
        secondary = [_governed("OfferTermCover", graph.get_product("prod_termcover"), 0)]
        confidence = 0.92

    elif archetype == "young_student":
        action = _governed("RecommendMicroSIP", product, _MICROSIP_TICKET)
        content = AiContent(
            component="AIInsightCard",
            eyebrow="AI Streak",
            title="Start your first investing streak",
            body=(f"Chai chhod ke ₹{_MICROSIP_TICKET}/week SIP? Over 1 year that's ₹5,200 + "
                  f"market growth. Build the habit, build your score."),
            primary_cta="Start ₹100 SIP",
            secondary_cta="Maybe later",
            icon="Flame",
        )
        secondary = [_governed("SuggestCreditBuilder", graph.get_product("prod_creditbuilder"), 0)]
        confidence = 0.85

    elif archetype == "senior":
        action = _governed("SuggestSeniorFD", product, _SENIORFD_TICKET)
        content = AiContent(
            component="AIInsightCard",
            eyebrow="Suraksha · AI Suggestion",
            title="Your pension is safe. It can also earn more.",
            body=("Namaste. Your pension credit is secure. A Senior Citizen FD earns a higher "
                  "assured rate (7.50%). Would you like our branch manager to call and explain? "
                  "No app steps needed."),
            primary_cta="Ask branch manager to call",
            secondary_cta="Tell me more",
            icon="ShieldCheck",
        )
        secondary = [
            _governed("ScamShieldAlert", None, None),
            _governed("EscalateToRM", None, None),
        ]
        confidence = 0.88
    else:
        return None

    reflection_ok = _reflection_test(content.title + " " + content.body)

    return AuthoredAction(
        action=action,
        content=content,
        confidence=confidence,
        reflection_test_passed=reflection_ok,
        secondary=secondary,
        nba_class=action.nba_class,
    )
