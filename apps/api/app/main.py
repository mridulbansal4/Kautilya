"""
YONO Adoption Copilot — Governed Reasoning Spine (FastAPI)
SYNTHETIC demo. No real SBI data ever.

Endpoints:
  GET  /v1/customer/{id}
  GET  /v1/adaptive-profile/{id}
  POST /v1/next-best-action
  POST /v1/action/confirm
  GET  /v1/ops/activation
  GET  /v1/ops/barriers
  GET  /v1/ops/observability
  GET  /v1/ops/audit
  POST /v1/ops/consent
  WS   /v1/stream
"""
from __future__ import annotations

import asyncio
import json
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.adaptive.adaptive_ui import get_profile
from app.audit.audit_store import get_all as get_audit, update_human_decision, write as audit_write
from app.contracts import (
    ActivationResponse,
    AdaptiveUIProfile,
    BarrierResponse,
    ConfirmRequest,
    ConfirmResponse,
    ConsentRequest,
    CustomerProjection,
    DashboardDelta,
    NbaRequest,
    NextBestActionResponse,
    ObservabilityResponse,
)
from app.engines import barrier_twin, intervention, metrics
from app.spine import graph as g, policy_engine
from app.spine import nba

# ── Lifespan (seeds graph on startup) ─────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Graph is seeded on module import of spine.graph — nothing extra needed.
    yield


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="YONO Adoption Copilot — Governed Spine",
    version="1.0.0",
    description="SYNTHETIC demo. No real SBI customer data.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Customer ──────────────────────────────────────────────────────────────────

@app.get("/v1/customer/{customer_id}", response_model=CustomerProjection)
def get_customer(customer_id: str):
    data = g.get_customer(customer_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return data


# ── Adaptive UI profile ───────────────────────────────────────────────────────

@app.get("/v1/adaptive-profile/{customer_id}", response_model=AdaptiveUIProfile)
def get_adaptive_profile(customer_id: str, screen: str = "home"):
    profile = get_profile(customer_id, screen)
    if profile is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return profile


# ── Next-Best-Action ──────────────────────────────────────────────────────────

@app.post("/v1/next-best-action", response_model=NextBestActionResponse)
def next_best_action(req: NbaRequest):
    # 1. Policy & Compliance gate (first-class, can block)
    verdict = policy_engine.run(req.customer_id)

    # 2. NBA engine authors the action (deterministic)
    result = nba.run(req.customer_id, verdict, signal=req.signal)

    # 3. Audit write-back (every recommendation, including rejects)
    audit_write({
        "audit_id": result.audit_id,
        "customer_id": req.customer_id,
        "decision": result.decision,
        "action_verb": result.action.verb if result.action else None,
        "reg_class": result.action.reg_class if result.action else verdict.reg_class,
        "confidence": result.confidence,
        "policy_verdict": verdict.rule_fired,
        "model_version": result.model_version,
        "data_source": "SYNTHETIC",
    })

    return result


# ── HITL confirm ──────────────────────────────────────────────────────────────

@app.post("/v1/action/confirm", response_model=ConfirmResponse)
def confirm_action(req: ConfirmRequest):
    # Update audit record
    update_human_decision(req.audit_id, req.human_decision)

    # Resolve customer_id from audit log
    from app.audit.audit_store import audit_log
    customer_id = next(
        (r["customer_id"] for r in audit_log if r.get("audit_id") == req.audit_id),
        None,
    )
    if customer_id is None:
        raise HTTPException(status_code=404, detail="Audit record not found")

    # Apply to graph (intervention engine)
    delta = intervention.apply_confirmation(customer_id, req.human_decision)

    return ConfirmResponse(
        ok=True,
        audit_id=req.audit_id,
        human_decision=req.human_decision,
        delta=DashboardDelta(**delta),
    )


# ── Ops dashboards ────────────────────────────────────────────────────────────

@app.get("/v1/ops/activation", response_model=ActivationResponse)
def ops_activation():
    return metrics.activation_response()


@app.get("/v1/ops/barriers", response_model=BarrierResponse)
def ops_barriers():
    return barrier_twin.get_barriers()


@app.get("/v1/ops/observability", response_model=ObservabilityResponse)
def ops_observability():
    return metrics.observability_response()


@app.get("/v1/ops/audit")
def ops_audit() -> list[dict]:
    return get_audit()


@app.post("/v1/ops/consent")
def set_consent(req: ConsentRequest):
    node = g.G.nodes.get(req.customer_id)
    if node is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    node[f"consent_{req.purpose}"] = req.granted
    return {"ok": True}


# ── WebSocket live funnel tick ────────────────────────────────────────────────

_ws_connections: list[WebSocket] = []


@app.websocket("/v1/stream")
async def ws_stream(websocket: WebSocket):
    await websocket.accept()
    _ws_connections.append(websocket)
    try:
        while True:
            # Send a live funnel tick every 5 seconds
            await asyncio.sleep(5)
            payload = metrics.activation_response()
            await websocket.send_text(json.dumps(payload))
    except WebSocketDisconnect:
        _ws_connections.remove(websocket)
    except Exception:
        if websocket in _ws_connections:
            _ws_connections.remove(websocket)


# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_version": "daie-spine-1.0.0",
        "data_source": "SYNTHETIC",
        "graph_nodes": len(g.G.nodes),
        "graph_edges": len(g.G.edges),
    }
