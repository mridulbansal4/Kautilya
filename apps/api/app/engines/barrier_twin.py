"""
Adoption Barrier Twin — maps friction nodes onto the ontology.
Surfaced on the executive /ops dashboard.
"""
from __future__ import annotations

from app.spine import graph as g


def get_barriers() -> dict:
    """Return the barrier twin payload for the ops dashboard."""
    nodes = g.get_friction_nodes()
    return {
        "nodes": nodes,
        "total_users": 10006,
        "data_source": "SYNTHETIC",
    }
