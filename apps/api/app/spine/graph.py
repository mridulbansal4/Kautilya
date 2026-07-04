"""
The Governed Reasoning Spine (BUILD_PROMPT §5) — wired exactly in the master report order:

  Intent → Policy/Compliance → Retriever → Ontology → Business Rules → NBA(propose)
         → Explainer(explain-only) → Personalised Experience → HITL gate(approve) → Audit

Separation of duties is structural: the NBA node PROPOSES; a distinct HITL gate (the
/v1/action/confirm endpoint) APPROVES. The explainer is downstream and explanation-only.
Every hop is logged into `reasoning_path` so the Why-path inspector can light it up.
Reject at any gate ⇒ STOP, audit the rejection, render nothing.
"""
from __future__ import annotations

from ..audit.audit_store import AuditStore
from ..contracts import (
    Decision,
    NextBestActionRequest,
    NextBestActionResponse,
    ReasoningHop,
)
from ..ontology.graph_port import GraphPort
from ..ontology.reasoning_paths import detect_intent
from . import eligibility, policy_engine
from .explainer import explain
from .nba import CONFIDENCE_THRESHOLD, author
from .retriever import retrieve


def _spine_hop(node: str, detail: str, status: str = "pass") -> ReasoningHop:
    return ReasoningHop(node=node, detail=detail, kind="spine", status=status)


def run_spine(
    graph: GraphPort, audit: AuditStore, req: NextBestActionRequest
) -> NextBestActionResponse:
    path: list[ReasoningHop] = []

    # ── hop 1: Intent Detection (uses the ontology to find a grounded candidate) ──
    intent = detect_intent(graph, req.customer_id, req.signal)
    if intent is None:
        return NextBestActionResponse(decision=Decision.silent, reason_code="no_intent",
                                      reasoning_path=path)
    path.append(_spine_hop("Intent Detection",
                           f"intent='{intent.intent}' for {intent.archetype}"))

    # ── hop 2: Policy & Compliance — can REJECT before anything is authored ──
    pol = policy_engine.evaluate(graph, req.customer_id, intent)
    path.append(pol.hop)
    if not pol.allowed:
        audit.write_rejection(customer_id=req.customer_id, reason_code=pol.reason_code,
                              graph_path=[h.model_dump() for h in path])
        return NextBestActionResponse(decision=Decision.rejected, reason_code=pol.reason_code,
                                      reasoning_path=path)

    # ── hop 3: Governed Retrieval — fail closed on a retrieval miss ──
    product = (graph.get_product(intent.candidate_product_id)
               if intent.candidate_product_id else None)
    if product is None:
        # no grounded opportunity at all → silence is a valid output, not a rejection
        path.append(_spine_hop("Governed Retrieval", "no grounded product", "info"))
        return NextBestActionResponse(decision=Decision.silent, reason_code="no_opportunity",
                                      reasoning_path=path)
    grounding = retrieve(product.kfs_ref)
    if not grounding.found:
        path.append(_spine_hop("Governed Retrieval",
                               f"no KFS doc for '{product.kfs_ref}' — fail closed", "reject"))
        audit.write_rejection(customer_id=req.customer_id, reason_code="retrieval_miss",
                              graph_path=[h.model_dump() for h in path])
        return NextBestActionResponse(decision=Decision.rejected, reason_code="retrieval_miss",
                                      reasoning_path=path)
    path.append(_spine_hop("Governed Retrieval", f"grounded on {grounding.doc['title']}"))

    # ── hop 4: Knowledge Graph / Ontology (the real traversal hops) ──
    path.extend(intent.hops)

    # ── hop 5: Business Rules — eligibility + suitability + reg class ──
    elig = eligibility.evaluate(graph, req.customer_id, intent)
    path.append(elig.hop)
    if not (elig.eligible and elig.suitable):
        audit.write_rejection(customer_id=req.customer_id, reason_code=elig.reason_code,
                              graph_path=[h.model_dump() for h in path])
        return NextBestActionResponse(decision=Decision.rejected, reason_code=elig.reason_code,
                                      reasoning_path=path)

    # ── hop 6: NBA — the ONLY author of an action ──
    authored = author(graph, intent, grounding)
    if authored is None:
        path.append(_spine_hop("NBA Engine", "no action authored", "info"))
        return NextBestActionResponse(decision=Decision.silent, reason_code="no_action",
                                      reasoning_path=path)

    # confidence + reflection gate — explain or stay silent (test_confidence_gate)
    if authored.confidence < CONFIDENCE_THRESHOLD or not authored.reflection_test_passed:
        path.append(_spine_hop("NBA Engine",
                               f"confidence {authored.confidence} / reflection "
                               f"{authored.reflection_test_passed} — withheld", "info"))
        return NextBestActionResponse(decision=Decision.silent, reason_code="below_confidence",
                                      confidence=authored.confidence, reasoning_path=path)
    path.append(_spine_hop("NBA Engine",
                           f"authored {authored.action.verb} ({authored.action.nba_class.value})"))

    # ── hop 7: Explanation Layer — explanation-only ──
    explanation = explain(authored, intent, grounding)
    path.append(_spine_hop("Explanation Layer", "narrated authored action (no origination)"))

    # ── hop 8: Personalised Experience (adaptive surface; profile served separately) ──
    path.append(_spine_hop("Personalised Experience",
                           f"surface={authored.content.component}"))

    # ── hop 9: Human-in-the-loop gate — pending the human's approval ──
    requires_hitl = authored.action.approval_level.value == "human_in_loop"
    path.append(_spine_hop("Human-in-the-loop",
                           "awaiting human approval" if requires_hitl else "auto-approved",
                           "info" if requires_hitl else "pass"))

    # ── audit write-back (pending the human decision) ──
    consents = graph.get_consents(req.customer_id)
    consent_id = next((c.consent_id for c in consents if c.purpose == intent.required_consent), None)
    audit_id = audit.write_authored(
        customer_id=req.customer_id,
        verb=authored.action.verb,
        nba_class=authored.action.nba_class.value,
        reg_class=authored.action.reg_class.value,
        approval_level=authored.action.approval_level.value,
        confidence=authored.confidence,
        inputs={"signal": req.signal, "screen": req.screen,
                "idle_surplus": intent.idle_surplus, "goal_type": intent.goal_type,
                "funded_pct_band": round(intent.goal_funded_pct, 1)},  # banded — DPDP
        graph_path=[h.model_dump() for h in path],
        consent_id=consent_id,
    )

    return NextBestActionResponse(
        decision=Decision.recommend,
        action=authored.action,
        content=authored.content,
        explanation=explanation,
        reasoning_path=path,
        confidence=authored.confidence,
        requires_hitl=requires_hitl,
        audit_id=audit_id,
    )
