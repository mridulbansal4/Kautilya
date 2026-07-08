"""
SQLite-backed audit store.
Logs every recommendation with inputs, policy verdict, graph path, model version,
consent artifact, and human decision — the RBI/DPDP 'model register' artifact.

Data is SYNTHETIC.
"""
from __future__ import annotations

import json
import sqlite3
import uuid
from pathlib import Path
from typing import Any

DB_PATH = Path(__file__).parent / "audit.db"

# In-memory list (also kept for fast observability metrics)
audit_log: list[dict] = []

# ── SQLite setup ──────────────────────────────────────────────────────────────

def _get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def _init_db() -> None:
    with _get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS audit (
                audit_id TEXT PRIMARY KEY,
                customer_id TEXT,
                decision TEXT,
                action_verb TEXT,
                reg_class TEXT,
                confidence REAL,
                policy_verdict TEXT,
                human_decision TEXT,
                graph_path_summary TEXT,
                model_version TEXT,
                data_source TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()


_init_db()


# ── Public API ────────────────────────────────────────────────────────────────

def write(record: dict) -> None:
    """Write an audit record to SQLite and in-memory log."""
    if "audit_id" not in record:
        record["audit_id"] = str(uuid.uuid4())
    audit_log.append(record)
    with _get_conn() as conn:
        conn.execute(
            """INSERT OR REPLACE INTO audit
               (audit_id, customer_id, decision, action_verb, reg_class, confidence,
                policy_verdict, human_decision, graph_path_summary, model_version, data_source)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                record.get("audit_id"),
                record.get("customer_id"),
                record.get("decision"),
                record.get("action_verb"),
                record.get("reg_class"),
                record.get("confidence"),
                record.get("policy_verdict"),
                record.get("human_decision"),
                record.get("graph_path_summary", ""),
                record.get("model_version", "daie-spine-1.0.0"),
                record.get("data_source", "SYNTHETIC"),
            ),
        )
        conn.commit()


def update_human_decision(audit_id: str, decision: str) -> None:
    """Update the human_decision field after HITL gate."""
    for r in audit_log:
        if r.get("audit_id") == audit_id:
            r["human_decision"] = decision
    with _get_conn() as conn:
        conn.execute(
            "UPDATE audit SET human_decision=? WHERE audit_id=?",
            (decision, audit_id),
        )
        conn.commit()


def get_all() -> list[dict]:
    with _get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM audit ORDER BY created_at DESC LIMIT 200"
        ).fetchall()
    return [dict(r) for r in rows]
