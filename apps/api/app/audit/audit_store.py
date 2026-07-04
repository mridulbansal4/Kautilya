"""
Audit store (BUILD_PROMPT §3, §11) — the RBI/DPDP "model register" artifact, a local SQLite
file (apps/api/data/audit.db, SYNTHETIC). Every authored/confirmed/rejected action writes an
AuditEvent with inputs, reasoning path, reg-class, consent id, model version and the human
decision. Dashboards read from here.

DPDP minimisation (test_dpdp_minimisation): we persist only banded inputs + a barrier code —
never raw keystrokes, dwell timings, or unbanded balances.
"""
from __future__ import annotations

import json
import os
import sqlite3
import uuid
from typing import Optional

_SCHEMA = """
CREATE TABLE IF NOT EXISTS audit_events (
    event_id        TEXT PRIMARY KEY,
    action_id       TEXT,
    customer_id     TEXT,
    verb            TEXT,
    nba_class       TEXT,
    reg_class       TEXT,
    approval_level  TEXT,
    confidence      REAL,
    inputs          TEXT,   -- JSON: banded signals only (DPDP-minimised)
    graph_path      TEXT,   -- JSON: reasoning path
    consent_id      TEXT,
    model_version   TEXT,
    human_decision  TEXT,   -- pending | approved | declined
    outcome         TEXT,   -- authored | confirmed | rejected
    reason_code     TEXT,
    created_at      TEXT DEFAULT (datetime('now'))
);
"""


class AuditStore:
    def __init__(self, db_path: str) -> None:
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.db_path = db_path
        self._conn = sqlite3.connect(db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._conn.executescript(_SCHEMA)
        self._conn.commit()

    # ── writes ──
    def write_authored(
        self,
        *,
        customer_id: str,
        verb: str,
        nba_class: str,
        reg_class: str,
        approval_level: str,
        confidence: float,
        inputs: dict,
        graph_path: list,
        consent_id: Optional[str],
    ) -> str:
        event_id = f"aud_{uuid.uuid4().hex[:12]}"
        self._conn.execute(
            """INSERT INTO audit_events
               (event_id, action_id, customer_id, verb, nba_class, reg_class, approval_level,
                confidence, inputs, graph_path, consent_id, model_version,
                human_decision, outcome, reason_code)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (
                event_id, event_id, customer_id, verb, nba_class, reg_class, approval_level,
                confidence, json.dumps(inputs), json.dumps(graph_path), consent_id,
                "daie-spine-1.0.0", "pending", "authored", None,
            ),
        )
        self._conn.commit()
        return event_id

    def write_rejection(self, *, customer_id: str, reason_code: str, graph_path: list) -> str:
        event_id = f"aud_{uuid.uuid4().hex[:12]}"
        self._conn.execute(
            """INSERT INTO audit_events
               (event_id, customer_id, graph_path, model_version, human_decision, outcome, reason_code)
               VALUES (?,?,?,?,?,?,?)""",
            (event_id, customer_id, json.dumps(graph_path), "daie-spine-1.0.0",
             "n/a", "rejected", reason_code),
        )
        self._conn.commit()
        return event_id

    def record_decision(self, audit_id: str, human_decision: str) -> Optional[sqlite3.Row]:
        outcome = "confirmed" if human_decision == "approved" else "declined"
        self._conn.execute(
            "UPDATE audit_events SET human_decision=?, outcome=? WHERE event_id=?",
            (human_decision, outcome, audit_id),
        )
        self._conn.commit()
        return self.get(audit_id)

    # ── reads ──
    def get(self, audit_id: str) -> Optional[sqlite3.Row]:
        cur = self._conn.execute("SELECT * FROM audit_events WHERE event_id=?", (audit_id,))
        return cur.fetchone()

    def count(self, **where) -> int:
        clause = " AND ".join(f"{k}=?" for k in where)
        sql = "SELECT COUNT(*) FROM audit_events"
        if clause:
            sql += f" WHERE {clause}"
        return self._conn.execute(sql, tuple(where.values())).fetchone()[0]

    def confirmed_count(self) -> int:
        return self.count(outcome="confirmed")

    def confidence_evolution(self, limit: int = 12) -> list[float]:
        cur = self._conn.execute(
            "SELECT confidence FROM audit_events WHERE confidence IS NOT NULL "
            "ORDER BY created_at DESC LIMIT ?",
            (limit,),
        )
        return [round(r[0], 2) for r in reversed(cur.fetchall())]
