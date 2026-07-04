"""
Intervention Engine (BUILD_PROMPT §6.4). On an opportunity it classifies HOW to surface —
ephemeral micro-intervention | structural UI change | explainable nudge card — never a heavy
pop-up. Copy obeys the behavioural-science mapping (loss-aversion framing, reflection test,
social proof) and never renders if the reflection test fails or confidence < 0.7.
"""
from __future__ import annotations

from typing import Literal

Kind = Literal["nudge", "structural", "ephemeral"]


def classify(verb: str, archetype: str) -> Kind:
    # senior gets a structural simplification (bigger targets, one CTA), not just a card
    if archetype == "senior":
        return "structural"
    if verb in {"ScamShieldAlert"}:
        return "ephemeral"
    return "nudge"
