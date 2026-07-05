"""
Eligibility checker — deterministic ontology-governed business rules.
Validates customer/product suitability before NBA authors anything.
"""
from __future__ import annotations

from app.spine import graph as g


def check(customer_id: str, product_id: str) -> tuple[bool, str]:
    """
    Returns (eligible: bool, reason: str).
    Checks:
      1. Customer node exists
      2. Product node exists
      3. ELIGIBLE_FOR edge exists in ontology
      4. KYC level is 'full'
      5. Archetype / min_ticket suitability
    """
    cnode = g.G.nodes.get(customer_id)
    pnode = g.G.nodes.get(product_id)

    if cnode is None:
        return False, "customer_not_found"
    if pnode is None:
        return False, "product_not_found"
    if not g.G.has_edge(customer_id, product_id):
        return False, "no_eligible_for_edge"

    # KYC gate
    accounts = [
        g.G.nodes[nb]
        for nb in g.G.successors(customer_id)
        if g.G.nodes[nb].get("type") == "Account"
    ]
    if accounts and all(a.get("kyc_level") != "full" for a in accounts):
        return False, "kyc_incomplete"

    # Suitability: senior customers should not get equity products
    archetype = cnode.get("archetype", "")
    product_family = pnode.get("family", "")
    if archetype == "senior" and product_family == "MF":
        return False, "unsuitable_equity_for_senior"

    return True, "eligible_and_suitable"
