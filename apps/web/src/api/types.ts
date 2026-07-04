/**
 * TS twin of apps/api/app/contracts.py — the shared seam. Hand-mirrored (a real build would
 * generate this via openapi-typescript). The frontend can construct NONE of these from
 * scratch: it requests them, renders them, and POSTs the human's approval back.
 */
export type Archetype = "young_student" | "mid_career" | "senior";
export type Dormancy = "dormant" | "awakening" | "active";
export type Decision = "recommend" | "rejected" | "silent";
export type RegClass = "advice_prohibited" | "distribution_allowed" | "service" | "education";
export type ApprovalLevel = "auto" | "human_in_loop";
export type NbaClass = "service" | "alert" | "offer" | "education";
export type Density = "compact" | "comfortable" | "spacious";
export type Contrast = "standard" | "high";

export interface DcsBreakdown {
  payments: number;
  savings: number;
  investments: number;
  credit: number;
  composite: number;
}

export interface AccountProjection {
  account_id: string;
  type: string;
  balance_band: string;
  idle_surplus: boolean;
  kyc_level: string;
}

export interface GoalProjection {
  goal_id: string;
  type: string;
  target_band: string;
  funded_pct: number;
}

export interface CustomerProjection {
  customer_id: string;
  display_name: string;
  age_band: string;
  segment: string;
  archetype: Archetype;
  dormancy_state: Dormancy;
  registered_only: boolean;
  dcs: DcsBreakdown;
  accounts: AccountProjection[];
  goals: GoalProjection[];
  products_per_customer: number;
  data_source: "SYNTHETIC";
}

export interface AdaptiveUIProfile {
  customer_id: string;
  archetype: Archetype;
  density: Density;
  font_scale: number;
  language_register: string;
  contrast_mode: Contrast;
  max_choices: number;
  copy_tone: string;
  surfaced_ai_components: string[];
  simplify_ui: boolean;
  greeting: string;
  data_source: "SYNTHETIC";
}

export interface ReasoningHop {
  node: string;
  edge?: string | null;
  detail?: string | null;
  kind: "spine" | "ontology";
  status: "pass" | "reject" | "info";
}

export interface GovernedAction {
  verb: string;
  nba_class: NbaClass;
  reg_class: RegClass;
  approval_level: ApprovalLevel;
  product_id?: string | null;
  product_name?: string | null;
  min_ticket?: number | null;
  suggested_ticket?: number | null;
  kfs_ref?: string | null;
}

export interface AiContent {
  component: string;
  eyebrow: string;
  title: string;
  body: string;
  primary_cta: string;
  secondary_cta: string;
  icon: string;
}

export interface NextBestActionResponse {
  decision: Decision;
  reason_code?: string | null;
  action?: GovernedAction | null;
  content?: AiContent | null;
  explanation?: string | null;
  reasoning_path: ReasoningHop[];
  confidence: number;
  requires_hitl: boolean;
  audit_id?: string | null;
  model_version: string;
  data_source: "SYNTHETIC";
}

export interface DashboardDelta {
  dormant_to_active: number;
  products_per_customer_delta: number;
  dcs_delta: number;
  activation_rate: number;
  new_dormancy_state?: Dormancy | null;
}

export interface ConfirmResponse {
  ok: boolean;
  audit_id: string;
  human_decision: string;
  delta: DashboardDelta;
  data_source: "SYNTHETIC";
}

export interface FunnelStage {
  key: string;
  label: string;
  count: number;
}
export interface KpiTile {
  key: string;
  label: string;
  value: string;
  delta?: string | null;
  trend: "up" | "down" | "flat";
}
export interface ActivationResponse {
  funnel: FunnelStage[];
  kpis: KpiTile[];
  confirmed_today: number;
  data_source: "SYNTHETIC";
}
export interface BarrierNode {
  node_id: string;
  label: string;
  type: string;
  screen: string;
  severity: number;
  cohort_share: number;
}
export interface BarrierResponse {
  nodes: BarrierNode[];
  total_users: number;
  data_source: "SYNTHETIC";
}
export interface ObservabilityResponse {
  hallucinations_contained: number;
  policy_violations_prevented: number;
  retrieval_failures: number;
  recommendations_accepted: number;
  recommendations_rejected: number;
  confidence_evolution: number[];
  accept_rate: number;
  data_source: "SYNTHETIC";
}

export const HERO_IDS = ["cust_rajesh", "cust_aarav", "cust_mohan"] as const;
export type HeroId = (typeof HERO_IDS)[number];
