/**
 * Stage-reliability parachute (BUILD_PROMPT §3). With VITE_MOCK=1 the frontend runs entirely
 * on these bundled fixtures — a flaky network never kills the pitch. These are RECORDED
 * backend responses, not client-authored logic: the frontend still never constructs an action.
 */
import type {
  ActivationResponse,
  AdaptiveUIProfile,
  BarrierResponse,
  CustomerProjection,
  NextBestActionResponse,
  ObservabilityResponse,
} from "./types";

export const MOCK_CUSTOMERS: Record<string, CustomerProjection> = {
  cust_rajesh: {
    customer_id: "cust_rajesh", display_name: "Rajesh Kumar", age_band: "35-44",
    segment: "salaried", archetype: "mid_career", dormancy_state: "dormant",
    registered_only: true,
    dcs: { payments: 80, savings: 55, investments: 25, credit: 60, composite: 56 },
    accounts: [
      { account_id: "acc_rajesh_sa", type: "SA", balance_band: "high", idle_surplus: true, kyc_level: "full" },
      { account_id: "acc_rajesh_fd", type: "FD", balance_band: "medium", idle_surplus: false, kyc_level: "full" },
    ],
    goals: [
      { goal_id: "goal_rajesh_ret", type: "retirement", target_band: "high", funded_pct: 0.3 },
      { goal_id: "goal_rajesh_edu", type: "education", target_band: "high", funded_pct: 0.45 },
    ],
    products_per_customer: 0, data_source: "SYNTHETIC",
  },
  cust_aarav: {
    customer_id: "cust_aarav", display_name: "Aarav Mehta", age_band: "18-24",
    segment: "student", archetype: "young_student", dormancy_state: "dormant",
    registered_only: true,
    dcs: { payments: 82, savings: 30, investments: 5, credit: 20, composite: 38 },
    accounts: [
      { account_id: "acc_aarav_sa", type: "SA", balance_band: "low", idle_surplus: false, kyc_level: "full" },
    ],
    goals: [
      { goal_id: "goal_aarav_gadget", type: "gadget", target_band: "low", funded_pct: 0.2 },
      { goal_id: "goal_aarav_credit", type: "credit_building", target_band: "low", funded_pct: 0.1 },
    ],
    products_per_customer: 0, data_source: "SYNTHETIC",
  },
  cust_mohan: {
    customer_id: "cust_mohan", display_name: "Mohan Lal", age_band: "65+",
    segment: "pensioner", archetype: "senior", dormancy_state: "dormant",
    registered_only: true,
    dcs: { payments: 50, savings: 35, investments: 10, credit: 15, composite: 29 },
    accounts: [
      { account_id: "acc_mohan_sa", type: "SA", balance_band: "high", idle_surplus: true, kyc_level: "full" },
    ],
    goals: [
      { goal_id: "goal_mohan_income", type: "income", target_band: "high", funded_pct: 0.25 },
      { goal_id: "goal_mohan_emerg", type: "emergency", target_band: "medium", funded_pct: 0.5 },
    ],
    products_per_customer: 0, data_source: "SYNTHETIC",
  },
};

export const MOCK_PROFILES: Record<string, AdaptiveUIProfile> = {
  cust_rajesh: {
    customer_id: "cust_rajesh", archetype: "mid_career", density: "comfortable", font_scale: 1.0,
    language_register: "formal_bilingual", contrast_mode: "standard", max_choices: 2,
    copy_tone: "respectful_advisory",
    surfaced_ai_components: ["AIInsightCard", "AISpendingSummaryWidget", "AIMaturityCountdown"],
    simplify_ui: false, greeting: "Good morning, Rajesh", data_source: "SYNTHETIC",
  },
  cust_aarav: {
    customer_id: "cust_aarav", archetype: "young_student", density: "comfortable", font_scale: 1.0,
    language_register: "hinglish", contrast_mode: "standard", max_choices: 3,
    copy_tone: "playful_motivational",
    surfaced_ai_components: ["AISpendingSummaryWidget", "AIInsightCard", "DCSRing"],
    simplify_ui: false, greeting: "Good morning, Aarav", data_source: "SYNTHETIC",
  },
  cust_mohan: {
    customer_id: "cust_mohan", archetype: "senior", density: "spacious", font_scale: 1.3,
    language_register: "simple_reassuring", contrast_mode: "high", max_choices: 1,
    copy_tone: "warm_protective",
    surfaced_ai_components: ["AIAlertBanner", "AIInsightCard", "AIMaturityCountdown"],
    simplify_ui: true, greeting: "Namaste, Mohan ji", data_source: "SYNTHETIC",
  },
};

const RAJESH_PATH: NextBestActionResponse["reasoning_path"] = [
  { node: "Intent Detection", detail: "intent='retirement_investment' for mid_career", kind: "spine", status: "pass" },
  { node: "Policy & Compliance", detail: "consent 'investment_distribution' granted · RBI/DPDP/SEBI/IRDAI clear", kind: "spine", status: "pass" },
  { node: "Governed Retrieval", detail: "grounded on Index Growth SIP — Key Facts", kind: "spine", status: "pass" },
  { node: "Customer{dormancy:'dormant'}", edge: "HAS", detail: "Account{type:'SA', idle_surplus:true}", kind: "ontology", status: "pass" },
  { node: "Transaction", edge: "TRIGGERED_BY", detail: "LifeEvent{type:'salary_credit'}", kind: "ontology", status: "pass" },
  { node: "Customer -> Goal{type:'retirement'}", edge: "DECLARED", detail: "funded_pct:0.3", kind: "ontology", status: "pass" },
  { node: "Goal -> Product", edge: "UNDERFUNDED_IMPLIES", detail: "Product{name:'Index Growth SIP'}", kind: "ontology", status: "pass" },
  { node: "Business Rules", detail: "eligible + suitable for Index Growth SIP", kind: "spine", status: "pass" },
  { node: "NBA Engine", detail: "authored RecommendSIP (offer)", kind: "spine", status: "pass" },
  { node: "Explanation Layer", detail: "narrated authored action (no origination)", kind: "spine", status: "pass" },
  { node: "Personalised Experience", detail: "surface=AIInsightCard", kind: "spine", status: "pass" },
  { node: "Human-in-the-loop", detail: "awaiting human approval", kind: "spine", status: "info" },
];

export const MOCK_NBA: Record<string, NextBestActionResponse> = {
  cust_rajesh: {
    decision: "recommend",
    action: {
      verb: "RecommendSIP", nba_class: "offer", reg_class: "distribution_allowed",
      approval_level: "human_in_loop", product_id: "prod_sip", product_name: "Index Growth SIP",
      min_ticket: 250, suggested_ticket: 250, kfs_ref: "kfs_sip",
    },
    content: {
      component: "AIInsightCard", eyebrow: "AI Insight",
      title: "Idle surplus detected after your salary credit",
      body: "₹40,000 has been sitting idle since your salary credit — about ₹1,400/yr in lost interest (illustrative). A ₹250/day SIP moves your retirement goal from 30% toward on-track.",
      primary_cta: "Review this nudge", secondary_cta: "Not now", icon: "ChartLineUp",
    },
    explanation:
      "Because your retirement goal is 30% funded and your Index Growth SIP is eligible and suitable (market-linked, illustrative 11% p.a. (not guaranteed)), starting it now is the single highest-impact next step — surfaced only because the full reasoning path and consent were verified first.",
    reasoning_path: RAJESH_PATH, confidence: 0.92, requires_hitl: true,
    audit_id: "aud_mock_rajesh", model_version: "daie-spine-1.0.0", data_source: "SYNTHETIC",
  },
  cust_aarav: {
    decision: "recommend",
    action: {
      verb: "RecommendMicroSIP", nba_class: "offer", reg_class: "distribution_allowed",
      approval_level: "human_in_loop", product_id: "prod_microsip", product_name: "Micro-SIP Starter",
      min_ticket: 100, suggested_ticket: 100, kfs_ref: "kfs_microsip",
    },
    content: {
      component: "AIInsightCard", eyebrow: "AI Streak",
      title: "Start your first investing streak",
      body: "Chai chhod ke ₹100/week SIP? Over 1 year that's ₹5,200 + market growth. Build the habit, build your score.",
      primary_cta: "Start ₹100 SIP", secondary_cta: "Maybe later", icon: "Flame",
    },
    explanation:
      "Because your gadget goal is 20% funded and your Micro-SIP Starter is eligible and suitable, starting it now is the single highest-impact next step — surfaced only because the full reasoning path and consent were verified first.",
    reasoning_path: RAJESH_PATH.map((h) =>
      h.node.includes("retirement")
        ? { ...h, node: "Customer -> Goal{type:'gadget'}", detail: "funded_pct:0.2" }
        : h.detail?.includes("Index Growth")
        ? { ...h, detail: h.detail.replace("Index Growth SIP", "Micro-SIP Starter") }
        : h,
    ),
    confidence: 0.85, requires_hitl: true, audit_id: "aud_mock_aarav",
    model_version: "daie-spine-1.0.0", data_source: "SYNTHETIC",
  },
  cust_mohan: {
    decision: "recommend",
    action: {
      verb: "SuggestSeniorFD", nba_class: "offer", reg_class: "distribution_allowed",
      approval_level: "human_in_loop", product_id: "prod_seniorfd",
      product_name: "Senior Citizen Fixed Deposit", min_ticket: 10000, suggested_ticket: 10000,
      kfs_ref: "kfs_seniorfd",
    },
    content: {
      component: "AIInsightCard", eyebrow: "Suraksha · AI Suggestion",
      title: "Your pension is safe. It can also earn more.",
      body: "Namaste. Your pension credit is secure. A Senior Citizen FD earns a higher assured rate (7.50%). Would you like our branch manager to call and explain? No app steps needed.",
      primary_cta: "Ask branch manager to call", secondary_cta: "Tell me more", icon: "ShieldCheck",
    },
    explanation:
      "Because your income goal is 25% funded and your Senior Citizen Fixed Deposit is eligible and suitable (7.50% p.a.), starting it now is the single highest-impact next step — surfaced only because the full reasoning path and consent were verified first.",
    reasoning_path: RAJESH_PATH.map((h) =>
      h.node.includes("retirement")
        ? { ...h, node: "Customer -> Goal{type:'income'}", detail: "funded_pct:0.25" }
        : h.detail?.includes("salary_credit")
        ? { ...h, detail: "LifeEvent{type:'pension_credit'}" }
        : h.detail?.includes("Index Growth")
        ? { ...h, detail: h.detail.replace("Index Growth SIP", "Senior Citizen Fixed Deposit") }
        : h,
    ),
    confidence: 0.88, requires_hitl: true, audit_id: "aud_mock_mohan",
    model_version: "daie-spine-1.0.0", data_source: "SYNTHETIC",
  },
};

export const MOCK_ACTIVATION: ActivationResponse = {
  funnel: [
    { key: "registered", label: "Registered", count: 10006 },
    { key: "dormant", label: "Dormant", count: 5784 },
    { key: "awakening", label: "Awakening", count: 1739 },
    { key: "active", label: "Activated", count: 2483 },
  ],
  kpis: [
    { key: "activation_rate", label: "Activation rate", value: "24.8%", delta: "+0", trend: "up" },
    { key: "ppc", label: "Products / customer", value: "2.30", delta: "+0", trend: "flat" },
    { key: "cti", label: "Cost-to-income contribution", value: "47.2%", delta: "-0.00", trend: "down" },
    { key: "lending", label: "Digital-lending throughput", value: "₹18.4k cr", delta: "+", trend: "flat" },
  ],
  confirmed_today: 0, data_source: "SYNTHETIC",
};

export const MOCK_BARRIERS: BarrierResponse = {
  total_users: 10006,
  data_source: "SYNTHETIC",
  nodes: [
    { node_id: "fric_reliability", label: "App reliability / timeout", type: "reliability", screen: "all", severity: 0.9, cohort_share: 0.34 },
    { node_id: "fric_vkyc", label: "VKYC abandonment", type: "onboarding", screen: "onboarding", severity: 0.8, cohort_share: 0.3 },
    { node_id: "fric_mf_overload", label: "Cognitive overload — MF selection", type: "cognitive", screen: "invest", severity: 0.72, cohort_share: 0.2 },
    { node_id: "fric_balance_hidden", label: "Balance hidden by default", type: "ux", screen: "home", severity: 0.42, cohort_share: 0.16 },
    { node_id: "fric_settings_flat", label: "Flat settings hierarchy (20+ items)", type: "ux", screen: "profile", severity: 0.33, cohort_share: 0.12 },
  ],
};

export const MOCK_OBSERVABILITY: ObservabilityResponse = {
  hallucinations_contained: 3,
  policy_violations_prevented: 7,
  retrieval_failures: 3,
  recommendations_accepted: 0,
  recommendations_rejected: 0,
  confidence_evolution: [0.85, 0.86, 0.88, 0.9, 0.91, 0.92],
  accept_rate: 0.0,
  data_source: "SYNTHETIC",
};
