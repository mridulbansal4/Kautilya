"""
Optional real-Anthropic explainer adapter (flagged: EXPLAINER_BACKEND=anthropic).

CRITICAL: this is STILL explanation-only. It is handed an action the deterministic NBA
already authored plus the grounded reasoning path, and is system-prompted to narrate ONLY
that — never to invent, rank, or originate a recommendation. If the SDK or key is absent it
raises, and explainer.py falls back to the deterministic template.

Uses the latest, most capable default model (claude-opus-4-8). No key is needed for the demo.
"""
from __future__ import annotations

import os

from ..ontology.reasoning_paths import Intent
from .nba import AuthoredAction
from .retriever import Grounding

_SYSTEM = (
    "You are the explanation layer of a governed banking decision engine. A deterministic "
    "engine has ALREADY authored the recommendation below. Your ONLY job is to explain it in "
    "exactly one warm, plain sentence. You must NOT invent, change, rank, or add any "
    "recommendation, product, or number that is not given to you. You give no investment advice."
)


def explain_with_anthropic(authored: AuthoredAction, intent: Intent, grounding: Grounding) -> str:
    import anthropic  # raises ImportError if not installed → template fallback

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    a = authored.action
    doc = grounding.doc or {}
    facts = (
        f"verb={a.verb}; product={a.product_name}; reg_class={a.reg_class}; "
        f"goal_type={intent.goal_type}; funded_pct={intent.goal_funded_pct}; "
        f"kfs={doc.get('rate_or_return')}; suggested_ticket={a.suggested_ticket}"
    )
    msg = client.messages.create(
        model=os.getenv("ANTHROPIC_MODEL", "claude-opus-4-8"),
        max_tokens=120,
        system=_SYSTEM,
        messages=[{
            "role": "user",
            "content": f"Authored action (explain in ONE sentence, do not add anything):\n{facts}",
        }],
    )
    return msg.content[0].text.strip()
