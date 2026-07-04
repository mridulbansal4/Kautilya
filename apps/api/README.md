# apps/api — Governed Reasoning Spine (FastAPI)

The backend *thinks*; the frontend renders. The ontology, policy gate, NBA (the only action
author), explainer (explanation-only), DCS, Barrier Twin and the AdaptiveUIProfile derivation
all live here, so governance is enforced by architecture — not by trusting the UI.

```bash
uv sync                 # install (embedded NetworkX graph + SQLite audit, no services)
uv run fastapi dev      # http://localhost:8000  (seeds on first boot)
uv run pytest           # §11 guardrails — must pass
```

All data is **SYNTHETIC**. See `app/spine/graph.py` for the spine wiring and
`app/ontology/seed_synthetic.py` for the three hero personas + reject fixtures.
