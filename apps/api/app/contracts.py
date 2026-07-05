"""
Shared contracts (Pydantic models) - the governed seam between spine and HTTP layer.
TS twin: apps/web/src/api/types.ts  (hand-mirrored).
All data is SYNTHETIC.
"""
from __future__ import annotations

import uuid
from typing import Literal, Optional

from pydantic import BaseModel, Field

# ── Enums / Literals ──────────────────────────────────────────────────────────

Archetype = Literal["young_student", "mid_career", "senior"]
DormancyState = Literal["dormant", "awakening", "active"]
Decision = Literal["recommend", "rejected", "silent"]
RegClass = Literal["advice_prohibited", "distribution_allowed", "service", "education"]
ApprovalLevel = Literal["auto", "human_in_loop"]
NbaClass = Literal["service", "alert", "offer", "education"]
Density = Literal["compact", "comfortable", "spacious"]
Contrast = Literal["standard", "high"]
HopKind = Literal["spine", "ontology"]
HopStatus = Literal["pass", "reject", "info"]

DATA_SOURCE = Literal["SYNTHETIC"]
MODEL_VERSION = "daie-spine-1.0.0"


# ── Customer projection ───────────────────────────────────────────────────────

class DcsBreakdown(BaseModel):
    payments: float
    savings: float
    investments: float
    credit: float
    composite: float


class AccountProjection(BaseModel):
    account_id: str
    type: str
    balance_band: str
    idle_surplus: bool
    kyc_level: str


class GoalProjection(BaseModel):
    goal_id: str
    type: str
    target_band: str
    funded_pct: float


class CustomerProjection(BaseModel):
    customer_id: str
    display_name: str
    age_band: str
    segment: str
    archetype: Archetype
    dormancy_state: DormancyState
    registered_only: bool
    dcs: DcsBreakdown
    accounts: list[AccountProjection]
    goals: list[GoalProjection]
    products_per_customer: int
    data_source: DATA_SOURCE = "SYNTHETIC"


# ── Adaptive UI ───────────────────────────────────────────────────────────────

class AdaptiveUIProfile(BaseModel):
    customer_id: str
    archetype: Archetype
    density: Density
    font_scale: float
    language_register: str
    contrast_mode: Contrast
    max_choices: int
    copy_tone: str
    surfaced_ai_components: list[str]
    simplify_ui: bool
    greeting: str
    data_source: DATA_SOURCE = "SYNTHETIC"


# ── NBA / reasoning ──────────────────────────────────────────────────────────

class ReasoningHop(BaseModel):
    node: str
    edge: Optional[str] = None
    detail: Optional[str] = None
    kind: HopKind
    status: HopStatus


class GovernedAction(BaseModel):
    verb: str
    nba_class: NbaClass
    reg_class: RegClass
    approval_level: ApprovalLevel
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    min_ticket: Optional[int] = None
    suggested_ticket: Optional[int] = None
    kfs_ref: Optional[str] = None


class AiContent(BaseModel):
    component: str
    eyebrow: str
    title: str
    body: str
    primary_cta: str
    secondary_cta: str
    icon: str


class NextBestActionResponse(BaseModel):
    decision: Decision
    reason_code: Optional[str] = None
    action: Optional[GovernedAction] = None
    content: Optional[AiContent] = None
    explanation: Optional[str] = None
    reasoning_path: list[ReasoningHop]
    confidence: float
    requires_hitl: bool
    audit_id: Optional[str] = None
    model_version: str = MODEL_VERSION
    data_source: DATA_SOURCE = "SYNTHETIC"


# ── Request bodies ────────────────────────────────────────────────────────────

class NbaRequest(BaseModel):
    customer_id: str
    screen: str = "home"
    signal: Optional[str] = None


class ConfirmRequest(BaseModel):
    audit_id: str
    human_decision: Literal["approved", "declined"] = "approved"


class ConsentRequest(BaseModel):
    customer_id: str
    purpose: str
    granted: bool


# ── Confirm response ──────────────────────────────────────────────────────────

class DashboardDelta(BaseModel):
    dormant_to_active: int
    products_per_customer_delta: int
    dcs_delta: float
    activation_rate: float
    new_dormancy_state: Optional[DormancyState] = None


class ConfirmResponse(BaseModel):
    ok: bool
    audit_id: str
    human_decision: str
    delta: DashboardDelta
    data_source: DATA_SOURCE = "SYNTHETIC"


# ── Ops dashboards ────────────────────────────────────────────────────────────

class FunnelStage(BaseModel):
    key: str
    label: str
    count: int


class KpiTile(BaseModel):
    key: str
    label: str
    value: str
    delta: Optional[str] = None
    trend: Literal["up", "down", "flat"]


class ActivationResponse(BaseModel):
    funnel: list[FunnelStage]
    kpis: list[KpiTile]
    confirmed_today: int
    data_source: DATA_SOURCE = "SYNTHETIC"


class BarrierNode(BaseModel):
    node_id: str
    label: str
    type: str
    screen: str
    severity: float
    cohort_share: float


class BarrierResponse(BaseModel):
    nodes: list[BarrierNode]
    total_users: int
    data_source: DATA_SOURCE = "SYNTHETIC"


class ObservabilityResponse(BaseModel):
    hallucinations_contained: int
    policy_violations_prevented: int
    retrieval_failures: int
    recommendations_accepted: int
    recommendations_rejected: int
    confidence_evolution: list[float]
    accept_rate: float
    data_source: DATA_SOURCE = "SYNTHETIC"


# ── Audit record ──────────────────────────────────────────────────────────────

class AuditRecord(BaseModel):
    audit_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    decision: Decision
    action_verb: Optional[str] = None
    reg_class: Optional[RegClass] = None
    confidence: float
    policy_verdict: str
    human_decision: Optional[str] = None
    graph_path_summary: str = ""
    model_version: str = MODEL_VERSION
    data_source: DATA_SOURCE = "SYNTHETIC"
