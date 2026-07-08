"""
Adaptive UI profile engine.
Produces a persona-first layout profile (density, font scale, language register,
surfaced AI components) from the customer archetype and DCS.
Server-side: the frontend never constructs layout logic.
"""
from __future__ import annotations

import time

from app.spine import graph as g

_PROFILE_MAP = {
    "mid_career": {
        "density": "comfortable",
        "font_scale": 1.0,
        "language_register": "formal_bilingual",
        "contrast_mode": "standard",
        "max_choices": 2,
        "copy_tone": "respectful_advisory",
        "surfaced_ai_components": ["AIInsightCard", "AISpendingSummaryWidget", "AIMaturityCountdown"],
        "simplify_ui": False,
    },
    "young_student": {
        "density": "comfortable",
        "font_scale": 1.0,
        "language_register": "hinglish",
        "contrast_mode": "standard",
        "max_choices": 3,
        "copy_tone": "playful_motivational",
        "surfaced_ai_components": ["AISpendingSummaryWidget", "AIInsightCard", "DCSRing"],
        "simplify_ui": False,
    },
    "senior": {
        "density": "spacious",
        "font_scale": 1.3,
        "language_register": "simple_reassuring",
        "contrast_mode": "high",
        "max_choices": 1,
        "copy_tone": "warm_protective",
        "surfaced_ai_components": ["AIAlertBanner", "AIInsightCard", "AIMaturityCountdown"],
        "simplify_ui": True,
    },
}

_GREETINGS = {
    "mid_career": "Good morning, {name}",
    "young_student": "Good morning, {name}",
    "senior": "Namaste, {name} ji",
}


def get_profile(customer_id: str, screen: str = "home") -> dict | None:
    node = g.G.nodes.get(customer_id)
    if node is None or node.get("type") != "Customer":
        return None
    archetype = node.get("archetype", "mid_career")
    profile = _PROFILE_MAP.get(archetype, _PROFILE_MAP["mid_career"]).copy()
    name = node.get("display_name", "").split()[0]
    greeting_tmpl = _GREETINGS.get(archetype, "Good morning, {name}")

    # time-aware greeting
    hour = time.localtime().tm_hour
    if hour < 12:
        greeting_tmpl = greeting_tmpl
    elif hour < 17:
        greeting_tmpl = greeting_tmpl.replace("morning", "afternoon")
    else:
        greeting_tmpl = greeting_tmpl.replace("morning", "evening")

    return {
        "customer_id": customer_id,
        "archetype": archetype,
        **profile,
        "greeting": greeting_tmpl.format(name=name),
        "data_source": "SYNTHETIC",
    }
