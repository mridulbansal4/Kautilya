"""
Explanation Layer (§32) — explanation-only, never originates an action.

Default: deterministic template (no API key needed).
Set EXPLAINER_BACKEND=anthropic to route through real Anthropic adapter (still explanation-only).
"""
from __future__ import annotations

import os
from typing import Optional

from app.contracts import GovernedAction


def explain_deterministic(
    action: GovernedAction,
    goal: Optional[dict],
    kfs: Optional[dict],
) -> str:
    """
    Deterministic template explainer. Receives a *validated, grounded, eligible* action
    and narrates its reasoning in plain language.
    The model cannot author a recommendation here — it only explains.
    """
    goal_type = goal.get("goal_type", "goal") if goal else "goal"
    funded_pct = goal.get("funded_pct", 0.0) if goal else 0.0
    pname = action.product_name or "this product"
    ticket = action.suggested_ticket or action.min_ticket or 0
    kfs_detail = kfs.get("key_facts", "eligible and suitable") if kfs else "eligible and suitable"

    # extract a return hint from KFS
    return_hint = ""
    if kfs and "Illustrative" in kfs.get("key_facts", ""):
        for part in kfs["key_facts"].split("."):
            if "p.a." in part or "%" in part:
                return_hint = part.strip()
                break

    explanation = (
        f"Because your {goal_type} goal is {int(funded_pct * 100)}% funded and your {pname} "
        f"is {kfs_detail[:80].rstrip(',')} "
        f"{'(' + return_hint + ')' if return_hint else ''}, "
        f"starting it now is the single highest-impact next step - surfaced only because the full "
        f"reasoning path and consent were verified first."
    ).replace("  ", " ").strip()

    return explanation


def explain(
    action: GovernedAction,
    goal: Optional[dict],
    kfs: Optional[dict],
) -> str:
    """Route to real LLM explainer if EXPLAINER_BACKEND=anthropic, else deterministic."""
    backend = os.getenv("EXPLAINER_BACKEND", "deterministic")
    if backend == "anthropic":
        try:
            return _explain_anthropic(action, goal, kfs)
        except Exception:
            pass  # fall through to deterministic
    return explain_deterministic(action, goal, kfs)


def _explain_anthropic(
    action: GovernedAction,
    goal: Optional[dict],
    kfs: Optional[dict],
) -> str:
    """Real Anthropic explanation — still explanation-only, never originates."""
    import anthropic  # type: ignore
    client = anthropic.Anthropic()
    prompt = (
        f"You are the Explanation Layer of a governed banking AI. "
        f"A deterministic NBA engine has already authored this action: {action.model_dump()}. "
        f"The customer goal: {goal}. KFS facts: {kfs}. "
        f"Write one plain-language sentence (max 60 words) explaining WHY this action was "
        f"surfaced. Do NOT invent any numbers, rates, or product terms not in the KFS. "
        f"Do NOT recommend any action yourself. Only explain the one already authored."
    )
    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=120,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text.strip()
