from __future__ import annotations

import pytest

from app.audit.audit_store import AuditStore
from app.ontology.embedded_graph import EmbeddedGraph
from app.ontology.seed_synthetic import build_graph


@pytest.fixture()
def graph() -> EmbeddedGraph:
    # fresh graph per test — confirm() mutates dormancy, so isolate
    return EmbeddedGraph(build_graph())


@pytest.fixture()
def audit(tmp_path) -> AuditStore:
    return AuditStore(str(tmp_path / "audit.db"))
