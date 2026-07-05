"""
Policy & Compliance Engine (§32.2) — the governance gate.
Validates every request before NBA runs.
Returns (verdict: allow|block, rule_fired: str, reg_class).
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

from app.spine import graph as g


@dataclass
class PolicyVerdict:
    allowed: bool
    rule_fired: str
    reg_class: str = "distribution_allowed"
    reason_code: Optional[str] = None


# ── Hard policies (executed in order; first block wins) ───────────────────────

def _check_consent(node: dict) -> PolicyVerdict | None:
    """DPDP §5 — must have explicit investment_distribution consent."""
    if not node.get("consent_investment_distribution", False):
        return PolicyVerdict(
            allowed=False,
            rule_fired="DPDP_CONSENT_MISSING",
            reg_class="advice_prohibited",
            reason_code="consent_not_granted",
        )
    return None


def _check_advice_class(node: dict) -> PolicyVerdict | None:
    """SEBI RIA — never issue personalised advice on securities."""
    interest = node.get("product_interest", "")
    if "security" in interest or "equity_advice" in interest or "advisory" in interest:
        return PolicyVerdict(
            allowed=False,
            rule_fired="SEBI_ADVICE_PROHIBITED",
            reg_class="advice_prohibited",
            reason_code="advice_class_blocked",
        )
    return None


def _check_eligibility(node: dict, products: list[str]) -> PolicyVerdict | None:
    """Internal eligibility — must have at least one eligible product."""
    if node.get("min_kyc", False):
        # incomplete KYC → ineligible for investment products
        return PolicyVerdict(
            allowed=False,
            rule_fired="ELIGIBILITY_KYC_INCOMPLETE",
            reg_class="education",
            reason_code="customer_ineligible",
        )
    if not products:
        return PolicyVerdict(
            allowed=False,
            rule_fired="ELIGIBILITY_NO_PRODUCT",
            reg_class="education",
            reason_code="no_eligible_product",
        )
    return None


def _check_retrieval(node: dict) -> PolicyVerdict | None:
    """Governed retrieval (§32.1) — exotic products have no KFS; fail closed."""
    interest = node.get("product_interest", "")
    if "exotic" in interest or "derivative" in interest:
        return PolicyVerdict(
            allowed=False,
            rule_fired="RETRIEVAL_FAIL_CLOSED",
            reg_class="education",
            reason_code="no_grounding_kfs",
        )
    return None


# ── Public gate ───────────────────────────────────────────────────────────────

def run(customer_id: str) -> PolicyVerdict:
    """
    Run all policy checks for the given customer.
    Returns the first blocking verdict, or an ALLOW verdict.
    """
    node = g.G.nodes.get(customer_id)
    if node is None:
        return PolicyVerdict(
            allowed=False,
            rule_fired="UNKNOWN_CUSTOMER",
            reg_class="advice_prohibited",
            reason_code="customer_not_found",
        )

    eligible_products = g.get_eligible_products(customer_id)

    for check in [
        _check_consent(node),
        _check_advice_class(node),
        _check_retrieval(node),
        _check_eligibility(node, eligible_products),
    ]:
        if check is not None:
            return check

    return PolicyVerdict(
        allowed=True,
        rule_fired="ALL_POLICIES_PASSED",
        reg_class="distribution_allowed",
    )
