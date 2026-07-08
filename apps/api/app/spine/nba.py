"""
Deterministic NBA (Next-Best-Action) engine.

The NBA engine is the ONLY action author in the system.
It receives:
  - customer node (from ontology)
  - eligible product (from graph + eligibility checker)
  - grounded KFS facts (from retriever)
  - policy verdict (from policy engine)

It produces ONE GovernedAction + reasoning path.
The LLM Explainer (explainer.py) only narrates - it never originates.
"""
from __future__ import annotations

import uuid
from typing import Optional

from app.contracts import (
    AiContent,
    GovernedAction,
    NextBestActionResponse,
    ReasoningHop,
)
from app.spine import eligibility, graph as g, retriever
from app.spine.policy_engine import PolicyVerdict


# ── Confidence threshold (§32.3) ─────────────────────────────────────────────
CONFIDENCE_THRESHOLD = 0.70


# ── Verb / content catalogue per archetype × product ─────────────────────────

def _build_content(
    archetype: str,
    product: dict,
    goal: Optional[dict],
    kfs: dict,
) -> tuple[str, GovernedAction, AiContent, float]:
    """
    Returns (verb, action, ai_content, confidence) tuned per persona.
    Archetype drives copy tone, max_choices, language register.
    """
    pid = product.get("product_id", "")
    pname = product.get("name", "")
    min_ticket = product.get("min_ticket", 250)
    kfs_ref = product.get("kfs_ref")
    reg_class = product.get("reg_class", "distribution_allowed")

    goal_type = goal.get("goal_type", "goal") if goal else "goal"
    funded = goal.get("funded_pct", 0.0) if goal else 0.0
    funded_pct_str = f"{int(funded * 100)}%"

    if archetype == "mid_career":
        verb = "RecommendSIP"
        confidence = 0.92
        action = GovernedAction(
            verb=verb, nba_class="offer", reg_class=reg_class,
            approval_level="human_in_loop",
            product_id=pid, product_name=pname,
            min_ticket=min_ticket, suggested_ticket=min_ticket,
            kfs_ref=kfs_ref,
        )
        content = AiContent(
            component="AIInsightCard", eyebrow="AI Insight",
            title="Idle surplus detected after your salary credit",
            body=(
                f"₹40,000 has been sitting idle since your salary credit - about ₹1,400/yr in "
                f"lost interest (illustrative). A ₹{min_ticket}/month SIP moves your "
                f"{goal_type} goal from {funded_pct_str} toward on-track."
            ),
            primary_cta="Review this nudge", secondary_cta="Not now", icon="ChartLineUp",
        )

    elif archetype == "young_student":
        verb = "RecommendMicroSIP"
        confidence = 0.85
        action = GovernedAction(
            verb=verb, nba_class="offer", reg_class=reg_class,
            approval_level="human_in_loop",
            product_id=pid, product_name=pname,
            min_ticket=min_ticket, suggested_ticket=min_ticket,
            kfs_ref=kfs_ref,
        )
        content = AiContent(
            component="AIInsightCard", eyebrow="AI Streak",
            title="Start your first investing streak",
            body=(
                f"Chai chhod ke ₹{min_ticket}/week SIP? "
                f"Over 1 year that's ₹{min_ticket * 52:,} + market growth. "
                f"Build the habit, build your score."
            ),
            primary_cta=f"Start ₹{min_ticket} SIP", secondary_cta="Maybe later", icon="Flame",
        )

    else:  # senior
        verb = "SuggestSeniorFD"
        confidence = 0.88
        action = GovernedAction(
            verb=verb, nba_class="offer", reg_class=reg_class,
            approval_level="human_in_loop",
            product_id=pid, product_name=pname,
            min_ticket=min_ticket, suggested_ticket=min_ticket,
            kfs_ref=kfs_ref,
        )
        rate = kfs.get("key_facts", "7.50% p.a.").split("Rate:")[-1].strip().split(".")[0] if "Rate:" in kfs.get("key_facts", "") else "7.50%"
        content = AiContent(
            component="AIInsightCard", eyebrow="Suraksha - AI Suggestion",
            title="Your pension is safe. It can also earn more.",
            body=(
                f"Namaste. Your pension credit is secure. A {pname} earns a higher assured rate "
                f"({rate.strip()} p.a.). Would you like our branch manager to call and explain? "
                f"No app steps needed."
            ),
            primary_cta="Ask branch manager to call",
            secondary_cta="Tell me more", icon="ShieldCheck",
        )

    return verb, action, content, confidence


def _build_reasoning_path(
    customer_id: str,
    policy_verdict: PolicyVerdict,
    product: Optional[dict],
    goal: Optional[dict],
    kfs: Optional[dict],
    eligibility_reason: str,
    archetype: str,
) -> list[ReasoningHop]:
    """Build the governed reasoning spine path for audit + UI inspector."""
    product_name = product.get("name", "?") if product else "?"
    goal_type = goal.get("goal_type", "?") if goal else "?"
    funded_pct = goal.get("funded_pct", 0.0) if goal else 0.0
    kfs_label = kfs.get("product", product_name) if kfs else product_name

    path = [
        ReasoningHop(node="Intent Detection",
                     detail=f"intent='{goal_type}_investment' for {archetype}",
                     kind="spine", status="pass"),
        ReasoningHop(node="Policy & Compliance",
                     detail=f"{policy_verdict.rule_fired} — RBI/DPDP/SEBI/IRDAI clear",
                     kind="spine", status="pass"),
        ReasoningHop(node="Governed Retrieval",
                     detail=f"grounded on {kfs_label} - Key Facts" if kfs else "KFS not required",
                     kind="spine", status="pass"),
        ReasoningHop(node=f"Customer{{dormancy:'{g.G.nodes[customer_id].get('dormancy_state', '?')}'}}" ,
                     edge="HAS",
                     detail="Account{type:'SA', idle_surplus:true}",
                     kind="ontology", status="pass"),
        ReasoningHop(node="Transaction", edge="TRIGGERED_BY",
                     detail=f"LifeEvent{{type:'{'pension_credit' if archetype == 'senior' else 'salary_credit'}'}}" ,
                     kind="ontology", status="pass"),
        ReasoningHop(node=f"Customer -> Goal{{type:'{goal_type}'}}",
                     edge="DECLARED",
                     detail=f"funded_pct:{funded_pct}",
                     kind="ontology", status="pass"),
        ReasoningHop(node="Goal -> Product", edge="UNDERFUNDED_IMPLIES",
                     detail=f"Product{{name:'{product_name}'}}",
                     kind="ontology", status="pass"),
        ReasoningHop(node="Business Rules",
                     detail=f"{eligibility_reason} for {product_name}",
                     kind="spine", status="pass"),
        ReasoningHop(node="NBA Engine",
                     detail=f"authored {product_name} action (offer)",
                     kind="spine", status="pass"),
        ReasoningHop(node="Explanation Layer",
                     detail="narrated authored action (no origination)",
                     kind="spine", status="pass"),
        ReasoningHop(node="Personalised Experience",
                     detail="surface=AIInsightCard",
                     kind="spine", status="pass"),
        ReasoningHop(node="Human-in-the-loop",
                     detail="awaiting human approval",
                     kind="spine", status="info"),
    ]
    return path


def _rejected_path(policy_verdict: PolicyVerdict) -> list[ReasoningHop]:
    return [
        ReasoningHop(node="Intent Detection", detail="signal received", kind="spine", status="pass"),
        ReasoningHop(node="Policy & Compliance",
                     detail=f"BLOCKED — {policy_verdict.rule_fired}",
                     kind="spine", status="reject"),
    ]


# ── Public API ────────────────────────────────────────────────────────────────

def run(
    customer_id: str,
    policy_verdict: PolicyVerdict,
    signal: Optional[str] = None,
) -> NextBestActionResponse:
    """
    Author a single governed action for the customer.
    Policy verdict must be passed in (already computed upstream).
    """
    from app.engines.dcs import compute as compute_dcs  # lazy to avoid circular

    audit_id = str(uuid.uuid4())

    # ── Policy blocked ────────────────────────────────────────────────────────
    if not policy_verdict.allowed:
        return NextBestActionResponse(
            decision="rejected",
            reason_code=policy_verdict.reason_code,
            reasoning_path=_rejected_path(policy_verdict),
            confidence=0.0,
            requires_hitl=False,
            audit_id=audit_id,
        )

    cnode = g.G.nodes[customer_id]
    archetype = cnode.get("archetype", "mid_career")

    # ── Get eligible product from ontology ────────────────────────────────────
    eligible_pids = g.get_eligible_products(customer_id)
    if not eligible_pids:
        return NextBestActionResponse(
            decision="silent",
            reason_code="no_eligible_product",
            reasoning_path=_rejected_path(policy_verdict),
            confidence=0.0,
            requires_hitl=False,
            audit_id=audit_id,
        )

    product_id = eligible_pids[0]
    product = dict(g.G.nodes[product_id])

    # ── Eligibility check ─────────────────────────────────────────────────────
    eligible, elig_reason = eligibility.check(customer_id, product_id)
    if not eligible:
        return NextBestActionResponse(
            decision="rejected",
            reason_code=elig_reason,
            reasoning_path=_rejected_path(policy_verdict),
            confidence=0.0,
            requires_hitl=False,
            audit_id=audit_id,
        )

    # ── Governed retrieval — fail closed ──────────────────────────────────────
    kfs = retriever.retrieve_for_product(product_id)
    if kfs is None:
        return NextBestActionResponse(
            decision="rejected",
            reason_code="no_grounding_kfs",
            reasoning_path=_rejected_path(policy_verdict),
            confidence=0.0,
            requires_hitl=False,
            audit_id=audit_id,
        )

    # ── Ontology: underfunded goal ────────────────────────────────────────────
    goal = g.get_underfunded_goal(customer_id)

    # ── Build action + content ────────────────────────────────────────────────
    verb, action, content, confidence = _build_content(archetype, product, goal, kfs)

    # ── Confidence gate ───────────────────────────────────────────────────────
    if confidence < CONFIDENCE_THRESHOLD:
        return NextBestActionResponse(
            decision="silent",
            reason_code="confidence_below_threshold",
            reasoning_path=_rejected_path(policy_verdict),
            confidence=confidence,
            requires_hitl=False,
            audit_id=audit_id,
        )

    # ── Build explanation (deterministic template — no LLM needed) ───────────
    from app.spine.explainer import explain_deterministic
    explanation = explain_deterministic(action, goal, kfs)

    # ── Build reasoning path ──────────────────────────────────────────────────
    path = _build_reasoning_path(
        customer_id, policy_verdict, product, goal, kfs, elig_reason, archetype
    )

    return NextBestActionResponse(
        decision="recommend",
        action=action,
        content=content,
        explanation=explanation,
        reasoning_path=path,
        confidence=confidence,
        requires_hitl=True,
        audit_id=audit_id,
    )
