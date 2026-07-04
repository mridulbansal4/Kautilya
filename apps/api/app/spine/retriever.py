"""
Governed Retrieval (spine hop 3). Fetches the grounding fact (a synthetic Key Facts
Statement) for the candidate product. RETRIEVAL MISS → fail closed: the spine STOPS and
no ungrounded answer is ever produced (BUILD_PROMPT §5, guardrail test_retrieval_fail_closed).

The KFS corpus is SYNTHETIC and deliberately small; `kfs_missing` has no entry so the
retrieval-miss reject path is demonstrable on cust_reject_retrieval.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Optional

# Synthetic Key Facts Statements (the RAG grounding corpus). SYNTHETIC.
KFS_CORPUS: dict[str, dict] = {
    "kfs_sip": {
        "title": "Index Growth SIP — Key Facts",
        "rate_or_return": "market-linked, illustrative 11% p.a. (not guaranteed)",
        "min_ticket": 250,
        "risk_label": "moderate to high",
        "fact": "A Systematic Investment Plan invests a fixed amount on a fixed date. "
                "Returns are market-linked and not assured.",
    },
    "kfs_microsip": {
        "title": "Micro-SIP Starter — Key Facts",
        "rate_or_return": "market-linked, illustrative 11% p.a. (not guaranteed)",
        "min_ticket": 100,
        "risk_label": "moderate to high",
        "fact": "Micro-SIP allows investing from as little as ₹100. Market-linked, not assured.",
    },
    "kfs_seniorfd": {
        "title": "Senior Citizen Fixed Deposit — Key Facts",
        "rate_or_return": "7.50% p.a. (0.50% senior-citizen uplift)",
        "min_ticket": 10000,
        "risk_label": "capital-safe (DICGC insured up to ₹5,00,000)",
        "fact": "A term deposit at a fixed assured rate. Premature withdrawal carries a penalty.",
    },
    "kfs_fd": {
        "title": "Fixed Deposit — Key Facts",
        "rate_or_return": "7.00% p.a.",
        "min_ticket": 5000,
        "risk_label": "capital-safe (DICGC insured up to ₹5,00,000)",
        "fact": "A term deposit at a fixed assured rate.",
    },
    "kfs_term": {
        "title": "Term Life Cover — Key Facts",
        "rate_or_return": "n/a (pure protection)",
        "min_ticket": 0,
        "risk_label": "protection product",
        "fact": "Pays a sum assured to nominees on death during the policy term. No maturity value.",
    },
    "kfs_creditbuilder": {
        "title": "Secured Credit Builder Card — Key Facts",
        "rate_or_return": "n/a",
        "min_ticket": 0,
        "risk_label": "secured against a fixed deposit",
        "fact": "A card secured by an FD that reports to bureaus to help build a credit history.",
    },
    # 'kfs_missing' intentionally absent → retrieval fail-closed fixture.
}


@dataclass
class Grounding:
    kfs_ref: str
    found: bool
    doc: Optional[dict] = None


def retrieve(kfs_ref: Optional[str]) -> Grounding:
    if not kfs_ref or kfs_ref not in KFS_CORPUS:
        return Grounding(kfs_ref=kfs_ref or "", found=False, doc=None)
    return Grounding(kfs_ref=kfs_ref, found=True, doc=KFS_CORPUS[kfs_ref])
