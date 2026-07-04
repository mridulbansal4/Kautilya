/** Ops data hook — fetches the three ops surfaces and subscribes to the live WS funnel tick. */
import { useEffect, useState } from "react";
import { api, openStream } from "../api/client";
import type { ActivationResponse, BarrierResponse, ObservabilityResponse } from "../api/types";

export function useOps() {
  const [activation, setActivation] = useState<ActivationResponse | null>(null);
  const [barriers, setBarriers] = useState<BarrierResponse | null>(null);
  const [obs, setObs] = useState<ObservabilityResponse | null>(null);
  const [pulse, setPulse] = useState(0); // increments on each live tick (for flash animations)

  async function refresh() {
    const [a, o] = await Promise.all([api.opsActivation(), api.opsObservability()]);
    setActivation(a);
    setObs(o);
  }

  useEffect(() => {
    api.opsBarriers().then(setBarriers).catch(() => {});
    refresh().catch(() => {});
    const close = openStream((msg) => {
      if (msg?.activation) {
        setActivation(msg.activation);
        setPulse((p) => p + 1);
        // refresh observability too (accept counts changed)
        api.opsObservability().then(setObs).catch(() => {});
      }
    });
    return close;
  }, []);

  return { activation, barriers, obs, pulse, refresh };
}
