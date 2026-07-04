"""
Shared API + ontology contracts — the single source of truth for the seam between
apps/api (this backend, which *thinks*) and apps/web (the frontend, which *renders*).

Mirrors DESIGN.md §12.3 `AIComponent` and BUILD_PROMPT §3.1 / §4. Pydantic models here
are the canonical schema; the web app's `src/api/types.ts` is the hand-mirrored TS twin.

Everything produced here is SYNTHETIC. No real SBI customer data is ever represented.
"""
from __future__ import annotations

from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field

MODEL_VERSION = "daie-spine-1.0.0"


# ──────────────────────────────────────────────────────────────────────────────
# Enumerations (ontology vocabulary — BUILD_PROMPT §4)
# ──────────────────────────────────────────────────────────────────────────────
class Archetype(str, Enum):
    young_student = "young_student"
    mid_career = "mid_career"
    senior = "senior"


class Dormancy(str, Enum):
    dormant = "dormant"
    awakening = "awakening"
    active = "active"


class RegClass(str, Enum):
    advice_prohibited = "advice_prohibited"
    distribution_allowed = "distribution_allowed"
    service = "service"
    education = "education"


class ApprovalLevel(str, Enum):
    auto = "auto"
    human_in_loop = "human_in_loop"


class NbaClass(str, Enum):
    service = "service"   # fix a problem
    alert = "alert"       # warn of a loss
    offer = "offer"       # suitability-checked product
    education = "education"  # explain a concept


class Decision(str, Enum):
    recommend = "recommend"
    rejected = "rejected"   # policy gate / retrieval miss → render nothing
    silent = "silent"       # below confidence or no useful action


class Density(str, Enum):
    compact = "compact"
    comfortable = "comfortable"
    spacious = "spacious"


class Contrast(str, Enum):
    standard = "standard"
    high = "high"


# Governed action verbs (BUILD_PROMPT §4.3). Each verb declares its contract in
# spine/nba.py::VERB_CONTRACTS. Money-touching verbs are always human_in_loop.
Verb = Literal[
    "RecommendSIP",
    "RecommendMicroSIP",
    "OfferTermCover",
    "SuggestFD",
    "SuggestSeniorFD",
    "ReactivateAccount",
    "SimplifyUI",
    "SurfaceKFS",
    "EscalateToRM",
    "SuggestCreditBuilder",
    "ScamShieldAlert",
]


# ──────────────────────────────────────────────────────────────────────────────
# Customer projection (DPDP-minimised — bands only, never raw amounts)
# ──────────────────────────────────────────────────────────────────────────────
class DcsBreakdown(BaseModel):
    payments: int = Field(ge=0, le=100)
    savings: int = Field(ge=0, le=100)
    investments: int = Field(ge=0, le=100)
    credit: int = Field(ge=0, le=100)
    composite: int = Field(ge=0, le=100)


class AccountProjection(BaseModel):
    account_id: str
    type: str                  # SA | CA | FD | loan
    balance_band: str          # low | medium | high
    idle_surplus: bool
    kyc_level: str


class GoalProjection(BaseModel):
    goal_id: str
    type: str
    target_band: str
    funded_pct: float = Field(ge=0, le=1)


class CustomerProjection(BaseModel):
    customer_id: str
    display_name: str
    age_band: str
    segment: str
    archetype: Archetype
    dormancy_state: Dormancy
    registered_only: bool
    dcs: DcsBreakdown
    accounts: list[AccountProjection]
    goals: list[GoalProjection]
    products_per_customer: int
    data_source: Literal["SYNTHETIC"] = "SYNTHETIC"


# ──────────────────────────────────────────────────────────────────────────────
# AdaptiveUIProfile (derived: Persona × DCS × ScreenContext) — BUILD_PROMPT §7
# ──────────────────────────────────────────────────────────────────────────────
class AdaptiveUIProfile(BaseModel):
    customer_id: str
    archetype: Archetype
    density: Density
    font_scale: float
    language_register: str          # hinglish | formal_bilingual | simple_reassuring
    contrast_mode: Contrast
    max_choices: int = Field(ge=1, le=4)
    copy_tone: str                  # playful_motivational | respectful_advisory | warm_protective
    surfaced_ai_components: list[str]
    simplify_ui: bool               # senior structural change (bigger targets, fewer fields)
    greeting: str                   # personalised, persona-toned
    data_source: Literal["SYNTHETIC"] = "SYNTHETIC"


# ──────────────────────────────────────────────────────────────────────────────
# Next-Best-Action (the governed spine output) — BUILD_PROMPT §3.1 / §5
# ──────────────────────────────────────────────────────────────────────────────
class ReasoningHop(BaseModel):
    """One lit hop in the spine OR one edge in the ontology traversal."""
    node: str
    edge: Optional[str] = None
    detail: Optional[str] = None
    kind: Literal["spine", "ontology"] = "ontology"
    status: Literal["pass", "reject", "info"] = "info"


class GovernedAction(BaseModel):
    verb: Verb
    nba_class: NbaClass
    reg_class: RegClass
    approval_level: ApprovalLevel
    product_id: Optional[str] = None
    product_name: Optional[str] = None
    min_ticket: Optional[int] = None
    suggested_ticket: Optional[int] = None
    kfs_ref: Optional[str] = None


class AiContent(BaseModel):
    """Persona-toned surface text. The reasoning_path is identical across personas;
    only this presentation differs."""
    component: str                  # which DESIGN.md §8.2 component renders this
    eyebrow: str                    # the "AI Insight" / "Scam Shield" label
    title: str
    body: str
    primary_cta: str
    secondary_cta: str
    icon: str                       # phosphor icon name (no emojis — skill rule)


class NextBestActionRequest(BaseModel):
    customer_id: str
    screen: str = "home"
    signal: Optional[str] = None    # e.g. 'salary_credit', 'pension_credit'


class NextBestActionResponse(BaseModel):
    decision: Decision
    reason_code: Optional[str] = None        # populated on rejected / silent
    action: Optional[GovernedAction] = None
    content: Optional[AiContent] = None
    explanation: Optional[str] = None        # one sentence, explainer-authored
    reasoning_path: list[ReasoningHop] = Field(default_factory=list)
    confidence: float = 0.0
    requires_hitl: bool = False
    audit_id: Optional[str] = None
    model_version: str = MODEL_VERSION
    data_source: Literal["SYNTHETIC"] = "SYNTHETIC"


# ──────────────────────────────────────────────────────────────────────────────
# Confirm (the human-in-the-loop gate) — BUILD_PROMPT §3.1
# ──────────────────────────────────────────────────────────────────────────────
class ConfirmRequest(BaseModel):
    audit_id: str
    human_decision: Literal["approved", "declined"] = "approved"


class DashboardDelta(BaseModel):
    dormant_to_active: int = 0
    products_per_customer_delta: int = 0
    dcs_delta: int = 0
    activation_rate: float = 0.0
    new_dormancy_state: Optional[Dormancy] = None


class ConfirmResponse(BaseModel):
    ok: bool
    audit_id: str
    human_decision: str
    delta: DashboardDelta
    data_source: Literal["SYNTHETIC"] = "SYNTHETIC"


# ──────────────────────────────────────────────────────────────────────────────
# Ops surfaces (the Act-3 close) — BUILD_PROMPT §12
# ──────────────────────────────────────────────────────────────────────────────
class FunnelStage(BaseModel):
    key: str
    label: str
    count: int


class KpiTile(BaseModel):
    key: str
    label: str
    value: str
    delta: Optional[str] = None
    trend: Literal["up", "down", "flat"] = "flat"


class ActivationResponse(BaseModel):
    funnel: list[FunnelStage]
    kpis: list[KpiTile]
    confirmed_today: int
    data_source: Literal["SYNTHETIC"] = "SYNTHETIC"


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
    data_source: Literal["SYNTHETIC"] = "SYNTHETIC"


class ObservabilityResponse(BaseModel):
    hallucinations_contained: int
    policy_violations_prevented: int
    retrieval_failures: int
    recommendations_accepted: int
    recommendations_rejected: int
    confidence_evolution: list[float]
    accept_rate: float
    data_source: Literal["SYNTHETIC"] = "SYNTHETIC"


class StreamTick(BaseModel):
    """Pushed over WS on every confirm so /ops ticks live on stage."""
    type: Literal["funnel_tick"] = "funnel_tick"
    audit_id: str
    customer_id: str
    delta: DashboardDelta
    activation: ActivationResponse
