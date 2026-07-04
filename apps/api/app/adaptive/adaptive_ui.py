"""
Adaptive UI derivation (BUILD_PROMPT §7) — THE SHOWPIECE's brain, server-side.

deriveAdaptiveUIProfile(persona, dcs, screen) → AdaptiveUIProfile. The frontend holds ZERO
of this logic: the PersonaSwitcher only changes which customer_id is requested; the backend
re-derives the profile and the next-best-action. That is what proves the adaptation is
engine-driven, not UI-faked. The reasoning path stays identical across personas — only this
presentation profile changes.
"""
from __future__ import annotations

from ..contracts import (
    AdaptiveUIProfile,
    Archetype,
    Contrast,
    DcsBreakdown,
    Density,
)
from ..ontology.graph_port import GraphPort

# per-archetype presentation contract (PRD §7.2 / §7.3)
_PROFILES = {
    Archetype.young_student: dict(
        density=Density.comfortable, font_scale=1.0, language_register="hinglish",
        contrast_mode=Contrast.standard, max_choices=3, copy_tone="playful_motivational",
        surfaced_ai_components=["AISpendingSummaryWidget", "AIInsightCard", "DCSRing"],
        simplify_ui=False,
    ),
    Archetype.mid_career: dict(
        density=Density.comfortable, font_scale=1.0, language_register="formal_bilingual",
        contrast_mode=Contrast.standard, max_choices=2, copy_tone="respectful_advisory",
        surfaced_ai_components=["AIInsightCard", "AISpendingSummaryWidget", "AIMaturityCountdown"],
        simplify_ui=False,
    ),
    Archetype.senior: dict(
        density=Density.spacious, font_scale=1.3, language_register="simple_reassuring",
        contrast_mode=Contrast.high, max_choices=1, copy_tone="warm_protective",
        surfaced_ai_components=["AIAlertBanner", "AIInsightCard", "AIMaturityCountdown"],
        simplify_ui=True,
    ),
}

_GREETINGS = {
    Archetype.young_student: "Aur Aarav, kya scene hai?",
    Archetype.mid_career: "Good morning, Rajesh",
    Archetype.senior: "Namaste, Mohan ji",
}


def derive(graph: GraphPort, customer_id: str, dcs: DcsBreakdown, screen: str) -> AdaptiveUIProfile:
    persona = graph.get_persona(customer_id)
    customer = graph.get_customer(customer_id)
    archetype = Archetype(persona.archetype) if persona else Archetype.mid_career
    spec = _PROFILES[archetype]

    # DCS nudges the surface: a very low-confidence user gets one fewer choice (less overload)
    max_choices = spec["max_choices"]
    if dcs.composite < 35 and max_choices > 1:
        max_choices -= 1

    name = customer.display_name.split()[0] if customer else "there"
    greeting = _GREETINGS.get(archetype, f"Hello, {name}")

    return AdaptiveUIProfile(
        customer_id=customer_id,
        archetype=archetype,
        density=spec["density"],
        font_scale=spec["font_scale"],
        language_register=spec["language_register"],
        contrast_mode=spec["contrast_mode"],
        max_choices=max_choices,
        copy_tone=spec["copy_tone"],
        surfaced_ai_components=list(spec["surfaced_ai_components"]),
        simplify_ui=spec["simplify_ui"],
        greeting=greeting,
    )
