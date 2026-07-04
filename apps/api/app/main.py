"""
YONO Adoption Copilot — Backend (FastAPI). The Governed Spine lives here; the frontend only
renders. Routes mirror BUILD_PROMPT §3.1 exactly. Embedded ontology graph + SQLite audit are
local files — no services, no Docker. Everything is SYNTHETIC.
"""
from __future__ import annotations

import os

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .adaptive.adaptive_ui import derive as derive_profile
from .audit.audit_store import AuditStore
from .contracts import (
    ActivationResponse,
    AdaptiveUIProfile,
    Archetype,
    BarrierResponse,
    ConfirmRequest,
    ConfirmResponse,
    CustomerProjection,
    DashboardDelta,
    Dormancy,
    NextBestActionRequest,
    NextBestActionResponse,
    ObservabilityResponse,
    StreamTick,
)
from .engines import dcs as dcs_engine
from .engines import metrics
from .engines.barrier_twin import build as build_barriers
from .ontology.embedded_graph import EmbeddedGraph
from .ontology.seed_synthetic import build_graph
from .spine.graph import run_spine

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
AUDIT_DB = os.path.join(DATA_DIR, "audit.db")

app = FastAPI(title="YONO Adoption Copilot API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── singletons (embedded graph + audit, seeded on first boot) ──
GRAPH = EmbeddedGraph(build_graph())
AUDIT = AuditStore(AUDIT_DB)


class ConnectionManager:
    def __init__(self) -> None:
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket) -> None:
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, payload: dict) -> None:
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


MANAGER = ConnectionManager()


# ──────────────────────────────────────────────────────────────────────────────
def _projection(customer_id: str) -> CustomerProjection:
    from .contracts import AccountProjection as AP
    from .contracts import GoalProjection as GP

    customer = GRAPH.get_customer(customer_id)
    persona = GRAPH.get_persona(customer_id)
    if customer is None or persona is None:
        raise HTTPException(status_code=404, detail="unknown customer")
    accounts = [
        AP(account_id=a.account_id, type=a.type, balance_band=a.balance_band,
           idle_surplus=a.idle_surplus, kyc_level=a.kyc_level)
        for a in GRAPH.get_accounts(customer_id)
    ]
    goals = [
        GP(goal_id=g.goal_id, type=g.type, target_band=g.target_band, funded_pct=g.funded_pct)
        for g in GRAPH.get_goals(customer_id)
    ]
    return CustomerProjection(
        customer_id=customer_id,
        display_name=customer.display_name,
        age_band=customer.age_band,
        segment=customer.segment,
        archetype=Archetype(persona.archetype),
        dormancy_state=Dormancy(customer.dormancy_state),
        registered_only=customer.registered_only,
        dcs=dcs_engine.compute(GRAPH, customer_id),
        accounts=accounts,
        goals=goals,
        products_per_customer=GRAPH.get_holdings_count(customer_id),
    )


# ── routes (BUILD_PROMPT §3.1) ────────────────────────────────────────────────
@app.get("/v1/health")
def health() -> dict:
    return {"ok": True, "data_source": "SYNTHETIC", "model_version": "daie-spine-1.0.0"}


@app.get("/v1/customer/{customer_id}", response_model=CustomerProjection)
def get_customer(customer_id: str) -> CustomerProjection:
    return _projection(customer_id)


@app.get("/v1/adaptive-profile/{customer_id}", response_model=AdaptiveUIProfile)
def adaptive_profile(customer_id: str, screen: str = "home") -> AdaptiveUIProfile:
    dcs = dcs_engine.compute(GRAPH, customer_id)
    return derive_profile(GRAPH, customer_id, dcs, screen)


@app.post("/v1/next-best-action", response_model=NextBestActionResponse)
def next_best_action(req: NextBestActionRequest) -> NextBestActionResponse:
    return run_spine(GRAPH, AUDIT, req)


@app.post("/v1/action/confirm", response_model=ConfirmResponse)
async def confirm(req: ConfirmRequest) -> ConfirmResponse:
    row = AUDIT.get(req.audit_id)
    if row is None:
        raise HTTPException(status_code=404, detail="unknown audit_id")

    # HITL gate is honoured by the architecture: write-back only happens on approval.
    AUDIT.record_decision(req.audit_id, req.human_decision)
    delta = DashboardDelta()
    if req.human_decision == "approved":
        customer_id = row["customer_id"]
        was_dormant = (GRAPH.get_customer(customer_id) or None)
        prev_state = was_dormant.dormancy_state if was_dormant else "active"
        GRAPH.set_dormancy(customer_id, "active")
        if row["verb"] and row["verb"].startswith(("Recommend", "Suggest", "Offer")):
            # write a holding back to the ontology (products-per-customer +1)
            # map the verb's product if present in inputs; fall back to a generic family product
            GRAPH.add_holding(customer_id, _verb_product(row["verb"]))
        delta = DashboardDelta(
            dormant_to_active=1 if prev_state == "dormant" else 0,
            products_per_customer_delta=1,
            dcs_delta=8,
            activation_rate=_activation_rate(),
            new_dormancy_state=Dormancy.active,
        )
        # push the live tick so /ops moves on stage
        tick = StreamTick(
            audit_id=req.audit_id, customer_id=customer_id, delta=delta,
            activation=metrics.build_activation(GRAPH, AUDIT),
        )
        await MANAGER.broadcast(tick.model_dump())

    return ConfirmResponse(ok=True, audit_id=req.audit_id,
                           human_decision=req.human_decision, delta=delta)


@app.get("/v1/ops/activation", response_model=ActivationResponse)
def ops_activation() -> ActivationResponse:
    return metrics.build_activation(GRAPH, AUDIT)


@app.get("/v1/ops/barriers", response_model=BarrierResponse)
def ops_barriers() -> BarrierResponse:
    return build_barriers(GRAPH)


@app.get("/v1/ops/observability", response_model=ObservabilityResponse)
def ops_observability() -> ObservabilityResponse:
    return metrics.build_observability(AUDIT)


@app.websocket("/v1/stream")
async def stream(ws: WebSocket) -> None:
    await MANAGER.connect(ws)
    try:
        # send an initial snapshot so a late-connecting dashboard is populated
        await ws.send_json({"type": "snapshot",
                            "activation": metrics.build_activation(GRAPH, AUDIT).model_dump()})
        while True:
            await ws.receive_text()  # keepalive; client may ping
    except WebSocketDisconnect:
        MANAGER.disconnect(ws)


# ── helpers ──
def _verb_product(verb: str) -> str:
    return {
        "RecommendSIP": "prod_sip",
        "RecommendMicroSIP": "prod_microsip",
        "SuggestSeniorFD": "prod_seniorfd",
        "SuggestFD": "prod_fd",
        "OfferTermCover": "prod_termcover",
        "SuggestCreditBuilder": "prod_creditbuilder",
    }.get(verb, "prod_fd")


def _activation_rate() -> float:
    counts = GRAPH.dormancy_counts()
    total = sum(counts.values()) or 1
    return round(counts.get("active", 0) / total * 100, 1)
