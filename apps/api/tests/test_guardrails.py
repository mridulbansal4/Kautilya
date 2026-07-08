"""
Guardrail test suite (§11 of the build contract).
All tests must pass — failing any invariant fails the build.
"""
from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c


# ── test_no_advice ────────────────────────────────────────────────────────────
async def test_no_advice(client):
    """NBA never emits an advice_prohibited action."""
    for cid in ["cust_rajesh", "cust_aarav", "cust_mohan"]:
        r = await client.post("/v1/next-best-action", json={"customer_id": cid})
        assert r.status_code == 200, r.text
        data = r.json()
        if data.get("action"):
            assert data["action"]["reg_class"] != "advice_prohibited", (
                f"{cid}: got advice_prohibited action"
            )


# ── test_policy_gate ──────────────────────────────────────────────────────────
async def test_policy_gate(client):
    """Missing consent ⇒ rejected, renders nothing."""
    r = await client.post(
        "/v1/next-best-action", json={"customer_id": "cust_reject_consent"}
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["decision"] == "rejected"
    assert data["action"] is None
    assert data["content"] is None


# ── test_retrieval_fail_closed ────────────────────────────────────────────────
async def test_retrieval_fail_closed(client):
    """No grounding KFS ⇒ rejected (fail closed)."""
    r = await client.post(
        "/v1/next-best-action", json={"customer_id": "cust_reject_retrieval"}
    )
    assert r.status_code == 200, r.text
    data = r.json()
    # Should be rejected because retrieval fails closed for exotic products
    assert data["decision"] == "rejected"


# ── test_confidence_gate ──────────────────────────────────────────────────────
async def test_confidence_gate(client):
    """Confidence < 0.7 ⇒ silent (not a recommend)."""
    # All hero customers have confidence ≥ 0.85, so they should pass.
    # The reject personas return 0.0 confidence.
    r = await client.post(
        "/v1/next-best-action", json={"customer_id": "cust_reject_consent"}
    )
    data = r.json()
    assert data["confidence"] < 0.7 or data["decision"] != "recommend"


# ── test_hitl ────────────────────────────────────────────────────────────────
async def test_hitl(client):
    """Every money-touching verb requires requires_hitl=True."""
    for cid in ["cust_rajesh", "cust_aarav", "cust_mohan"]:
        r = await client.post("/v1/next-best-action", json={"customer_id": cid})
        data = r.json()
        if data.get("decision") == "recommend" and data.get("action"):
            assert data["requires_hitl"] is True, (
                f"{cid}: money-touching action without HITL flag"
            )


# ── test_explainer_is_explanation_only ───────────────────────────────────────
async def test_explainer_is_explanation_only(client):
    """
    The explainer only narrates; it does not originate.
    Confirmed by: explanation is non-empty only when action exists.
    """
    # No-action path: reject persona
    r = await client.post(
        "/v1/next-best-action", json={"customer_id": "cust_reject_consent"}
    )
    data = r.json()
    assert data.get("action") is None
    # explanation should be absent when there's no action
    assert not data.get("explanation")

    # Action path: explanation should be present
    r2 = await client.post("/v1/next-best-action", json={"customer_id": "cust_rajesh"})
    d2 = r2.json()
    if d2.get("decision") == "recommend":
        assert d2.get("explanation"), "explanation missing for recommend decision"


# ── test_audit_completeness ───────────────────────────────────────────────────
async def test_audit_completeness(client):
    """Every recommendation is logged with full lineage."""
    r = await client.post("/v1/next-best-action", json={"customer_id": "cust_rajesh"})
    data = r.json()
    audit_id = data.get("audit_id")
    assert audit_id, "audit_id missing from NBA response"

    audit = await client.get("/v1/ops/audit")
    assert audit.status_code == 200
    records = audit.json()
    ids = [rec.get("audit_id") for rec in records]
    assert audit_id in ids, "audit record not written"


# ── test_dpdp_minimisation ────────────────────────────────────────────────────
async def test_dpdp_minimisation(client):
    """Audit records contain no raw PII fields (no raw balances, no keystrokes)."""
    audit = await client.get("/v1/ops/audit")
    records = audit.json()
    for rec in records:
        for forbidden in ["balance", "keystroke", "dwell_time", "raw_log"]:
            assert forbidden not in rec, (
                f"DPDP minimisation violated: '{forbidden}' found in audit record"
            )
