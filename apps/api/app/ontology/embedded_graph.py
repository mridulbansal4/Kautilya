"""
EmbeddedGraph — the DEFAULT in-process ontology graph (NetworkX, no server).

Implements GraphPort. Loaded once at startup from `seed_synthetic.build_graph()`.
A real Neo4j is a one-file swap (`neo4j_adapter.py`) with zero caller changes — every
spine node only ever touches the GraphPort surface, never NetworkX directly.

SYNTHETIC: nodes carry only DPDP-minimised *bands*, never raw balances or PII.
"""
from __future__ import annotations

from typing import Optional

import networkx as nx

from . import schema as S
from .schema import (
    Account,
    ConsentArtifact,
    Customer,
    Goal,
    LifeEvent,
    Persona,
    Product,
)


class EmbeddedGraph:
    def __init__(self, g: nx.MultiDiGraph) -> None:
        self.g = g

    # ── helpers ──────────────────────────────────────────────────────────────
    def _node(self, node_id: str) -> Optional[dict]:
        return self.g.nodes[node_id] if node_id in self.g.nodes else None

    def _neighbours(self, node_id: str, rel: str, kind: Optional[str] = None) -> list[str]:
        out: list[str] = []
        if node_id not in self.g:
            return out
        for _, dst, data in self.g.out_edges(node_id, data=True):
            if data.get("rel") != rel:
                continue
            if kind is not None and self.g.nodes[dst].get("kind") != kind:
                continue
            out.append(dst)
        return out

    # ── projections ──────────────────────────────────────────────────────────
    def get_customer(self, customer_id: str) -> Optional[Customer]:
        n = self._node(customer_id)
        if not n or n.get("kind") != S.CUSTOMER:
            return None
        return Customer(
            customer_id=customer_id,
            display_name=n["display_name"],
            age_band=n["age_band"],
            segment=n["segment"],
            dormancy_state=n["dormancy_state"],
            registered_only=n["registered_only"],
            consent_state=n["consent_state"],
        )

    def get_persona(self, customer_id: str) -> Optional[Persona]:
        # Persona node points PERSONA_OF -> Customer; find the inbound persona.
        for src, _dst, data in self.g.in_edges(customer_id, data=True):
            if data.get("rel") == S.PERSONA_OF:
                p = self.g.nodes[src]
                return Persona(
                    archetype=p["archetype"],
                    digital_literacy=p["digital_literacy"],
                    risk_appetite=p["risk_appetite"],
                    preferred_language=p["preferred_language"],
                    font_scale_pref=p["font_scale_pref"],
                    cognitive_load_tolerance=p["cognitive_load_tolerance"],
                    vernacular_pref=p["vernacular_pref"],
                )
        return None

    def get_accounts(self, customer_id: str) -> list[Account]:
        res: list[Account] = []
        for aid in self._neighbours(customer_id, S.HAS, S.ACCOUNT):
            a = self.g.nodes[aid]
            res.append(
                Account(
                    account_id=aid,
                    type=a["type"],
                    balance_band=a["balance_band"],
                    idle_surplus=a["idle_surplus"],
                    kyc_level=a["kyc_level"],
                )
            )
        return res

    def get_goals(self, customer_id: str) -> list[Goal]:
        res: list[Goal] = []
        for gid in self._neighbours(customer_id, S.DECLARED, S.GOAL):
            gn = self.g.nodes[gid]
            res.append(
                Goal(
                    goal_id=gid,
                    type=gn["type"],
                    target_band=gn["target_band"],
                    funded_pct=gn["funded_pct"],
                )
            )
        return res

    def get_holdings_count(self, customer_id: str) -> int:
        return len(self._neighbours(customer_id, S.HOLDS, S.HOLDING))

    def get_consents(self, customer_id: str) -> list[ConsentArtifact]:
        res: list[ConsentArtifact] = []
        for cid in self._neighbours(customer_id, S.HAS_CONSENT, S.CONSENT):
            c = self.g.nodes[cid]
            res.append(
                ConsentArtifact(
                    consent_id=cid,
                    purpose=c["purpose"],
                    granted=c["granted"],
                    expires_at=c.get("expires_at"),
                )
            )
        return res

    # ── traversal for reasoning paths ─────────────────────────────────────────
    def latest_life_event(self, customer_id: str) -> Optional[LifeEvent]:
        events: list[tuple[str, dict]] = []
        for aid in self._neighbours(customer_id, S.HAS, S.ACCOUNT):
            for tid in self._neighbours(aid, S.GENERATED, S.TRANSACTION):
                for eid in self._neighbours(tid, S.TRIGGERED_BY, S.LIFE_EVENT):
                    events.append((eid, self.g.nodes[eid]))
        if not events:
            return None
        # deterministic: last seeded event wins (seed orders by recency)
        eid, e = events[-1]
        return LifeEvent(event_id=eid, type=e["type"])

    def underfunded_goal_products(
        self, customer_id: str, goal_type: str
    ) -> list[tuple[Goal, Product]]:
        pairs: list[tuple[Goal, Product]] = []
        for gid in self._neighbours(customer_id, S.DECLARED, S.GOAL):
            gn = self.g.nodes[gid]
            if gn["type"] != goal_type:
                continue
            goal = Goal(
                goal_id=gid,
                type=gn["type"],
                target_band=gn["target_band"],
                funded_pct=gn["funded_pct"],
            )
            for pid in self._neighbours(gid, S.UNDERFUNDED_IMPLIES, S.PRODUCT):
                prod = self.get_product(pid)
                if prod:
                    pairs.append((goal, prod))
        return pairs

    def is_eligible(self, customer_id: str, product_id: str) -> bool:
        for pid in self._neighbours(customer_id, S.ELIGIBLE_FOR, S.PRODUCT):
            if pid == product_id:
                return True
        return False

    def get_product(self, product_id: str) -> Optional[Product]:
        p = self._node(product_id)
        if not p or p.get("kind") != S.PRODUCT:
            return None
        return Product(
            product_id=product_id,
            family=p["family"],
            name=p["name"],
            kfs_ref=p["kfs_ref"],
            min_ticket=p["min_ticket"],
            senior_variant=p["senior_variant"],
            eligibility_rules=p.get("eligibility_rules", {}),
        )

    # ── write-back ─────────────────────────────────────────────────────────────
    def set_dormancy(self, customer_id: str, state: str) -> None:
        if customer_id in self.g.nodes:
            self.g.nodes[customer_id]["dormancy_state"] = state

    def add_holding(self, customer_id: str, product_id: str) -> None:
        hid = f"hold_{customer_id}_{product_id}"
        if hid in self.g.nodes:
            return
        self.g.add_node(hid, kind=S.HOLDING, product_id=product_id, status="active")
        self.g.add_edge(customer_id, hid, rel=S.HOLDS)
        self.g.add_edge(hid, product_id, rel=S.OF)

    # ── aggregate ──────────────────────────────────────────────────────────────
    def all_customer_ids(self) -> list[str]:
        return [n for n, d in self.g.nodes(data=True) if d.get("kind") == S.CUSTOMER]

    def friction_aggregate(self) -> list[dict]:
        out: list[dict] = []
        for n, d in self.g.nodes(data=True):
            if d.get("kind") != S.FRICTION_NODE:
                continue
            out.append(
                {
                    "node_id": n,
                    "label": d["label"],
                    "type": d["type"],
                    "screen": d["screen"],
                    "severity": d["severity"],
                    "cohort_share": d["cohort_share"],
                }
            )
        return sorted(out, key=lambda x: x["cohort_share"], reverse=True)

    def dormancy_counts(self) -> dict[str, int]:
        counts = {"dormant": 0, "awakening": 0, "active": 0}
        for _n, d in self.g.nodes(data=True):
            if d.get("kind") == S.CUSTOMER:
                counts[d["dormancy_state"]] = counts.get(d["dormancy_state"], 0) + 1
        return counts
