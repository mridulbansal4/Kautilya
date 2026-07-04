"""
Explanation Layer (spine hop 7). The LLM is LAST and EXPLANATION-ONLY: it is wired AFTER
the action already exists and only narrates the path the deterministic engine authored.
Fed NO action, it REFUSES — it never invents one (BUILD_PROMPT §2, §5;
guardrail test_explainer_is_explanation_only).

Default is this deterministic template explainer so the demo never needs a live key.
Set EXPLAINER_BACKEND=anthropic to route through explainer_llm (still explanation-only).
"""
from __future__ import annotations

import os
from typing import Optional

from ..ontology.reasoning_paths import Intent
from .nba import AuthoredAction
from .retriever import Grounding


class ExplainerRefusal(RuntimeError):
    """Raised when the explainer is asked to explain a non-existent action."""


def explain(authored: Optional[AuthoredAction], intent: Intent, grounding: Grounding) -> str:
    # EXPLANATION-ONLY: with no authored action there is nothing to explain. Refuse.
    if authored is None:
        raise ExplainerRefusal(
            "Explainer refuses: no action was authored by the NBA engine. "
            "The explanation layer never originates a recommendation."
        )

    backend = os.getenv("EXPLAINER_BACKEND", "template").lower()
    if backend == "anthropic":
        try:
            from .explainer_llm import explain_with_anthropic

            return explain_with_anthropic(authored, intent, grounding)
        except Exception:
            # fail safe back to the template — never block the demo on a model call
            pass
    return _template_explain(authored, intent, grounding)


def _template_explain(authored: AuthoredAction, intent: Intent, grounding: Grounding) -> str:
    a = authored.action
    doc = grounding.doc or {}
    funded = int(intent.goal_funded_pct * 100)
    rate = doc.get("rate_or_return", "the published rate")
    return (
        f"Because your {intent.goal_type} goal is {funded}% funded and your "
        f"{a.product_name} is eligible and suitable ({rate}), starting it now is the "
        f"single highest-impact next step — surfaced only because the full reasoning path "
        f"and consent were verified first."
    )
