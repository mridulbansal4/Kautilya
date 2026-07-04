/**
 * Zustand — UI STATE ONLY (BUILD_PROMPT §3). No ontology, no NBA, no profile derivation lives
 * here. The PersonaSwitcher just changes `activeCustomerId`; the backend re-derives everything.
 */
import { create } from "zustand";
import type { HeroId } from "../api/types";

interface UiState {
  activeCustomerId: HeroId;
  demoMode: boolean; // show the persona-switch "demo" bar
  showReasoningPath: boolean; // split-screen Why-path inspector
  signalFired: boolean; // Act-1: the salary/pension-credit signal has fired
  dismissedInsights: Record<string, boolean>;
  aiEnabled: boolean; // AI Preferences opt-out (DESIGN.md §8.3 Rule 3)

  setActiveCustomer: (id: HeroId) => void;
  toggleDemoMode: () => void;
  toggleReasoningPath: () => void;
  fireSignal: () => void;
  dismissInsight: (id: string) => void;
  setAiEnabled: (on: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeCustomerId: "cust_rajesh",
  demoMode: true,
  showReasoningPath: false,
  signalFired: false,
  dismissedInsights: {},
  aiEnabled: true,

  // switching persona resets the per-customer demo state so each persona starts fresh
  setActiveCustomer: (id) =>
    set({ activeCustomerId: id, signalFired: false, dismissedInsights: {} }),
  toggleDemoMode: () => set((s) => ({ demoMode: !s.demoMode })),
  toggleReasoningPath: () => set((s) => ({ showReasoningPath: !s.showReasoningPath })),
  fireSignal: () => set({ signalFired: true }),
  dismissInsight: (id) =>
    set((s) => ({ dismissedInsights: { ...s.dismissedInsights, [id]: true } })),
  setAiEnabled: (on) => set({ aiEnabled: on }),
}));
