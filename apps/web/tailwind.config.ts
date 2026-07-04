import type { Config } from "tailwindcss";

/**
 * Tailwind preset — every theme value maps to a CSS var from src/tokens/tokens.css
 * (which reproduces DESIGN.md §4). Components reference `bg-brand`, `text-content-secondary`,
 * `shadow-e3`, `rounded-lg` … never a raw hex or px. DESIGN.md remains canonical.
 */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "var(--colour-brand-primary)",
          light: "var(--colour-brand-primary-light)",
          dark: "var(--colour-blue-800)",
          50: "var(--colour-blue-50)",
        },
        bg: {
          app: "var(--colour-bg-app)",
          surface: "var(--colour-bg-surface)",
        },
        content: {
          primary: "var(--colour-content-primary)",
          secondary: "var(--colour-content-secondary)",
          tertiary: "var(--colour-content-tertiary)",
          disabled: "var(--colour-content-disabled)",
          inverse: "var(--colour-content-inverse)",
        },
        credit: "var(--colour-credit)",
        debit: "var(--colour-debit)",
        pending: "var(--colour-pending)",
        line: "var(--colour-border-default)",
        ai: {
          DEFAULT: "var(--colour-ai-primary)",
          secondary: "var(--colour-ai-secondary)",
          surface: "var(--colour-ai-surface)",
          border: "var(--colour-ai-border)",
          text: "var(--colour-ai-on-surface)",
        },
        // spending categories (AISpendingSummaryWidget — DESIGN.md §8.2)
        cat: {
          food: "#FF7043",
          bills: "var(--colour-brand-primary)",
          shopping: "#7B1FA2",
          travel: "#00838F",
          health: "var(--colour-credit)",
          emi: "var(--colour-debit)",
          other: "var(--colour-neutral-500)",
        },
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        e1: "var(--shadow-1)",
        e2: "var(--shadow-2)",
        e3: "var(--shadow-3)",
        e4: "var(--shadow-4)",
        e8: "var(--shadow-8)",
        e16: "var(--shadow-16)",
        e24: "var(--shadow-24)",
        apple: "var(--shadow-apple)",
        ai: "var(--shadow-ai)",
        "ai-strong": "var(--shadow-ai-strong)",
      },
      fontFamily: {
        sans: "var(--font-family-primary)",
        mono: "var(--font-family-mono)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        decelerate: "var(--ease-decelerate)",
        accelerate: "var(--ease-accelerate)",
        emphasized: "var(--ease-emphasized)",
        spring: "var(--ease-spring)",
      },
      maxWidth: { phone: "390px" },
    },
  },
  plugins: [],
} satisfies Config;
