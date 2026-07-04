/**
 * AdaptiveProvider — fetches the active customer's projection + AdaptiveUIProfile + the authored
 * next-best-action, and exposes them to the phone tree. Switching persona (in the store) triggers
 * a refetch; the UI morphs because the *backend* re-derived the profile, not because the FE faked it.
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import type {
  AdaptiveUIProfile,
  CustomerProjection,
  NextBestActionResponse,
} from "../api/types";
import { useUiStore } from "../store/uiStore";

interface AdaptiveCtx {
  customer: CustomerProjection | null;
  profile: AdaptiveUIProfile | null;
  nba: NextBestActionResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const Ctx = createContext<AdaptiveCtx>({
  customer: null, profile: null, nba: null, loading: true, error: null, refresh: () => {},
});

const SIGNAL_BY_ARCHETYPE: Record<string, string> = {
  mid_career: "salary_credit",
  young_student: "salary_credit",
  senior: "pension_credit",
};

export function AdaptiveProvider({ children }: { children: React.ReactNode }) {
  const activeCustomerId = useUiStore((s) => s.activeCustomerId);
  const [customer, setCustomer] = useState<CustomerProjection | null>(null);
  const [profile, setProfile] = useState<AdaptiveUIProfile | null>(null);
  const [nba, setNba] = useState<NextBestActionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const [c, p] = await Promise.all([
          api.getCustomer(activeCustomerId),
          api.getAdaptiveProfile(activeCustomerId),
        ]);
        if (!alive) return;
        setCustomer(c);
        setProfile(p);
        const signal = SIGNAL_BY_ARCHETYPE[p.archetype];
        const action = await api.nextBestAction(activeCustomerId, "home", signal);
        if (!alive) return;
        setNba(action);
      } catch (e) {
        if (alive) setError(String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [activeCustomerId, nonce]);

  return (
    <Ctx.Provider value={{ customer, profile, nba, loading, error, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAdaptive = () => useContext(Ctx);
