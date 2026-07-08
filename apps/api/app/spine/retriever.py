"""
Governed Retrieval Layer (§32.1) — fetches the enterprise facts a recommendation
must stand on.  In the MVP this is a small in-process KFS/product corpus.
If retrieval returns nothing relevant, the pipeline declines — fail closed.

Data is SYNTHETIC. A real deployment would use a vector DB over SBI KFS PDFs.
"""
from __future__ import annotations

from typing import Optional

# ── Synthetic KFS corpus ──────────────────────────────────────────────────────

KFS_CORPUS: dict[str, dict] = {
    "kfs_sip": {
        "ref": "kfs_sip",
        "product": "Index Growth SIP",
        "family": "MF",
        "key_facts": "Market-linked mutual fund SIP. Illustrative return: 11% p.a. (not guaranteed). "
                     "Minimum ticket ₹250/month. No lock-in. SEBI-registered AMC. "
                     "Distribution only - no personalised securities advice.",
        "disclosure": "Mutual fund investments are subject to market risks. Read all scheme "
                      "related documents carefully.",
        "reg_class": "distribution_allowed",
    },
    "kfs_microsip": {
        "ref": "kfs_microsip",
        "product": "Micro-SIP Starter",
        "family": "MF",
        "key_facts": "Low-ticket market-linked SIP for first-time investors. Min ₹100/week. "
                     "Illustrative: market-linked. SEBI-registered AMC.",
        "disclosure": "Mutual fund investments are subject to market risks.",
        "reg_class": "distribution_allowed",
    },
    "kfs_seniorfd": {
        "ref": "kfs_seniorfd",
        "product": "Senior Citizen Fixed Deposit",
        "family": "FD",
        "key_facts": "Fixed Deposit for customers aged 60+. Rate: 7.50% p.a. (assured). "
                     "Minimum deposit ₹10,000. Premature withdrawal allowed with penalty.",
        "disclosure": "Interest rates subject to change. DICGC insured up to ₹5 lakh.",
        "reg_class": "distribution_allowed",
    },
    "kfs_fd": {
        "ref": "kfs_fd",
        "product": "SBI Fixed Deposit",
        "family": "FD",
        "key_facts": "Standard FD. Rate: 6.80% p.a. Minimum ₹1,000. Various tenors available.",
        "disclosure": "DICGC insured up to ₹5 lakh.",
        "reg_class": "distribution_allowed",
    },
}


def retrieve(kfs_ref: Optional[str]) -> Optional[dict]:
    """
    Fetch grounding facts for a KFS reference.
    Returns None if no facts found (pipeline must fail closed).
    """
    if kfs_ref is None:
        return None
    return KFS_CORPUS.get(kfs_ref)


def retrieve_for_product(product_id: str) -> Optional[dict]:
    """Convenience: look up by product_id rather than kfs_ref."""
    # map product_id → kfs_ref
    mapping = {
        "prod_sip": "kfs_sip",
        "prod_microsip": "kfs_microsip",
        "prod_seniorfd": "kfs_seniorfd",
        "prod_fd": "kfs_fd",
    }
    return retrieve(mapping.get(product_id))
