"""
Ontology node + edge schema (BUILD_PROMPT §4.1 / §4.2).

These dataclasses are the in-process node payloads stored on the embedded graph.
Iterated from the master report schema to make Persona, AdaptiveUIProfile, Intervention,
ConsentArtifact and AuditEvent first-class — so consent and persona-adaptation are
structural, not bolted on.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

# Node label constants (used as the `kind` attribute on graph nodes)
CUSTOMER = "Customer"
PERSONA = "Persona"
ACCOUNT = "Account"
TRANSACTION = "Transaction"
GOAL = "Goal"
LIFE_EVENT = "LifeEvent"
PRODUCT = "Product"
HOLDING = "Holding"
FRICTION_NODE = "FrictionNode"
CONSENT = "ConsentArtifact"

# Edge relationship constants (BUILD_PROMPT §4.2)
PERSONA_OF = "PERSONA_OF"
HAS = "HAS"
GENERATED = "GENERATED"
TRIGGERED_BY = "TRIGGERED_BY"
DECLARED = "DECLARED"
UNDERFUNDED_IMPLIES = "UNDERFUNDED_IMPLIES"
ELIGIBLE_FOR = "ELIGIBLE_FOR"
HOLDS = "HOLDS"
OF = "OF"
HAS_CONSENT = "HAS_CONSENT"
HITS = "HITS"


@dataclass
class Customer:
    customer_id: str
    display_name: str
    age_band: str
    segment: str
    dormancy_state: str          # dormant | awakening | active
    registered_only: bool
    consent_state: str           # full | partial | none


@dataclass
class Persona:
    archetype: str               # young_student | mid_career | senior
    digital_literacy: float      # 0-1
    risk_appetite: str           # low | medium | high
    preferred_language: str
    font_scale_pref: float
    cognitive_load_tolerance: float
    vernacular_pref: bool


@dataclass
class Account:
    account_id: str
    type: str                    # SA | CA | FD | loan
    balance_band: str            # low | medium | high
    idle_surplus: bool
    kyc_level: str               # full | min | video_pending


@dataclass
class Transaction:
    txn_id: str
    type: str
    amount_band: str
    timestamp: str
    channel: str


@dataclass
class LifeEvent:
    event_id: str
    type: str                    # salary_credit | pension_credit | new_device | ...


@dataclass
class Goal:
    goal_id: str
    type: str                    # retirement | education | emergency | credit_building | gadget | income
    target_band: str
    funded_pct: float


@dataclass
class Product:
    product_id: str
    family: str                  # MF | insurance | FD | card | loan
    name: str
    kfs_ref: str                 # synthetic Key Facts Statement reference (RAG grounding)
    min_ticket: int
    senior_variant: bool
    eligibility_rules: dict = field(default_factory=dict)


@dataclass
class Holding:
    holding_id: str
    product_id: str
    status: str


@dataclass
class FrictionNode:
    node_id: str
    type: str
    screen: str
    severity: float
    cohort_share: float


@dataclass
class ConsentArtifact:
    consent_id: str
    purpose: str                 # investment_distribution | account_analytics | marketing | ...
    granted: bool
    expires_at: Optional[str]
