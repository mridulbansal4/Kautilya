/**
 * Typed API client. Talks to the governed spine at /v1 (proxied to :8000). The frontend can
 * never construct an action — it only requests one, renders the one the backend authored, and
 * POSTs the human's approval back.
 *
 * VITE_MOCK=1 → serve bundled fixtures (the stage parachute). The seam is identical either way.
 */
import {
  MOCK_ACTIVATION,
  MOCK_BARRIERS,
  MOCK_CUSTOMERS,
  MOCK_NBA,
  MOCK_OBSERVABILITY,
  MOCK_PROFILES,
} from "./mockFixtures";
import type {
  ActivationResponse,
  AdaptiveUIProfile,
  BarrierResponse,
  ConfirmResponse,
  CustomerProjection,
  NextBestActionResponse,
  ObservabilityResponse,
} from "./types";

export const MOCK_MODE = import.meta.env.VITE_MOCK === "1";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function get<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { "content-type": "application/json" } });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json() as Promise<T>;
}
async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  async getCustomer(id: string): Promise<CustomerProjection> {
    if (MOCK_MODE) return structuredClone(MOCK_CUSTOMERS[id] ?? MOCK_CUSTOMERS.cust_rajesh);
    return get(`/v1/customer/${id}`);
  },

  async getAdaptiveProfile(id: string, screen = "home"): Promise<AdaptiveUIProfile> {
    if (MOCK_MODE) return structuredClone(MOCK_PROFILES[id] ?? MOCK_PROFILES.cust_rajesh);
    return get(`/v1/adaptive-profile/${id}?screen=${screen}`);
  },

  async nextBestAction(
    customer_id: string,
    screen = "home",
    signal?: string,
  ): Promise<NextBestActionResponse> {
    if (MOCK_MODE) {
      await delay(450); // let the shimmer breathe
      return structuredClone(MOCK_NBA[customer_id] ?? MOCK_NBA.cust_rajesh);
    }
    return post(`/v1/next-best-action`, { customer_id, screen, signal });
  },

  async confirm(audit_id: string, human_decision: "approved" | "declined" = "approved"): Promise<ConfirmResponse> {
    if (MOCK_MODE) {
      await delay(300);
      return {
        ok: true, audit_id, human_decision,
        delta: {
          dormant_to_active: human_decision === "approved" ? 1 : 0,
          products_per_customer_delta: human_decision === "approved" ? 1 : 0,
          dcs_delta: human_decision === "approved" ? 8 : 0,
          activation_rate: 24.9, new_dormancy_state: "active",
        },
        data_source: "SYNTHETIC",
      };
    }
    return post(`/v1/action/confirm`, { audit_id, human_decision });
  },

  async opsActivation(): Promise<ActivationResponse> {
    if (MOCK_MODE) return structuredClone(MOCK_ACTIVATION);
    return get(`/v1/ops/activation`);
  },
  async opsBarriers(): Promise<BarrierResponse> {
    if (MOCK_MODE) return structuredClone(MOCK_BARRIERS);
    return get(`/v1/ops/barriers`);
  },
  async opsObservability(): Promise<ObservabilityResponse> {
    if (MOCK_MODE) return structuredClone(MOCK_OBSERVABILITY);
    return get(`/v1/ops/observability`);
  },
};

/** WebSocket for the live funnel tick. Returns a cleanup fn. No-op in mock mode. */
export function openStream(onTick: (msg: any) => void): () => void {
  if (MOCK_MODE) return () => {};
  const proto = location.protocol === "https:" ? "wss" : "ws";
  const ws = new WebSocket(`${proto}://${location.host}/v1/stream`);
  ws.onmessage = (e) => {
    try {
      onTick(JSON.parse(e.data));
    } catch {
      /* ignore */
    }
  };
  return () => ws.close();
}
