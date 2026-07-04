"""
§11 guardrails — these FAIL THE BUILD if a governance invariant breaks. They are the reason
the spine lives server-side: advice can never escape, the policy gate can't be bypassed, and a
money action can never skip the human gate.
"""
from __future__ import annotations

import json

import pytest

from app.contracts import (
    ApprovalLevel,
    Decision,
    NextBestActionRequest,
    RegClass,
)
from app.spine import graph as spine_graph
from app.spine.explainer import ExplainerRefusal, explain
from app.spine.nba import VERB_CONTRACTS

HEROES = {
    "cust_rajesh": ("RecommendSIP", RegClass.distribution_allowed),
    "cust_aarav": ("RecommendMicroSIP", RegClass.distribution_allowed),
    "cust_mohan": ("SuggestSeniorFD", RegClass.distribution_allowed),
}


def _nba(graph, audit, customer_id, signal=None):
    return spine_graph.run_spine(graph, audit, NextBestActionRequest(
        customer_id=customer_id, screen="home", signal=signal))


# ── test_no_advice ────────────────────────────────────────────────────────────
def test_no_advice_contracts():
    for verb, c in VERB_CONTRACTS.items():
        assert c["reg"] != RegClass.advice_prohibited, f"{verb} must never be advice_prohibited"


def test_no_advice_runtime(graph, audit):
    for cid in HEROES:
        res = _nba(graph, audit, cid)
        assert res.decision == Decision.recommend
        assert res.action.reg_class != RegClass.advice_prohibited


# ── test_reasoning ───────────────────────────────────────────────────────────
@pytest.mark.parametrize("cid,expected", HEROES.items())
def test_reasoning(graph, audit, cid, expected):
    verb, reg = expected
    res = _nba(graph, audit, cid)
    assert res.decision == Decision.recommend
    assert res.action.verb == verb
    assert res.action.reg_class == reg
    # the ontology Why-path must be present and grounded
    assert any(h.edge == "UNDERFUNDED_IMPLIES" for h in res.reasoning_path)


# ── test_policy_gate ─────────────────────────────────────────────────────────
def test_policy_gate_rejects_missing_consent(graph, audit):
    res = _nba(graph, audit, "cust_reject_consent")
    assert res.decision == Decision.rejected
    assert res.reason_code == "consent_missing"
    assert res.action is None  # renders nothing


# ── test_retrieval_fail_closed ───────────────────────────────────────────────
def test_retrieval_fail_closed(graph, audit):
    res = _nba(graph, audit, "cust_reject_retrieval")
    assert res.decision == Decision.rejected
    assert res.reason_code == "retrieval_miss"
    assert res.action is None


def test_eligibility_rejects(graph, audit):
    res = _nba(graph, audit, "cust_reject_eligibility")
    assert res.decision == Decision.rejected
    assert res.reason_code == "ineligible"


# ── test_confidence_gate ─────────────────────────────────────────────────────
def test_confidence_gate(graph, audit, monkeypatch):
    # raise the bar above every hero's confidence → all must go silent, never render
    monkeypatch.setattr(spine_graph, "CONFIDENCE_THRESHOLD", 0.999)
    res = _nba(graph, audit, "cust_rajesh")
    assert res.decision == Decision.silent
    assert res.reason_code == "below_confidence"
    assert res.action is None


# ── test_hitl ────────────────────────────────────────────────────────────────
def test_hitl_money_verbs_are_human_in_loop():
    for verb, c in VERB_CONTRACTS.items():
        if c["money"]:
            # contract demands money-touching ⇒ human_in_loop at author time
            from app.spine.nba import _approval
            assert _approval(c["money"]) == ApprovalLevel.human_in_loop, verb


def test_hitl_recommend_requires_confirm(graph, audit):
    res = _nba(graph, audit, "cust_rajesh")
    assert res.requires_hitl is True
    assert res.action.approval_level == ApprovalLevel.human_in_loop
    # write-back only happens through the distinct confirm gate
    row = audit.get(res.audit_id)
    assert row["human_decision"] == "pending"
    assert row["outcome"] == "authored"


# ── test_explainer_is_explanation_only ───────────────────────────────────────
def test_explainer_refuses_without_action():
    with pytest.raises(ExplainerRefusal):
        explain(None, None, None)  # type: ignore[arg-type]


def test_explainer_narrates_when_given_action(graph, audit):
    res = _nba(graph, audit, "cust_rajesh")
    assert isinstance(res.explanation, str) and len(res.explanation) > 10


# ── test_audit_completeness ──────────────────────────────────────────────────
def test_audit_completeness(graph, audit):
    res = _nba(graph, audit, "cust_rajesh")
    row = audit.get(res.audit_id)
    for col in ("verb", "reg_class", "graph_path", "consent_id", "model_version", "human_decision"):
        assert row[col] is not None, f"audit missing {col}"
    assert json.loads(row["graph_path"])  # non-empty reasoning path persisted


# ── test_dpdp_minimisation ───────────────────────────────────────────────────
def test_dpdp_minimisation(graph, audit):
    res = _nba(graph, audit, "cust_rajesh")
    inputs = json.loads(audit.get(res.audit_id)["inputs"])
    forbidden = {"keystrokes", "dwell", "raw_balance", "balance", "pii", "phone"}
    assert not (forbidden & set(inputs.keys())), "raw signals must never be persisted"
    assert "funded_pct_band" in inputs  # only banded values
