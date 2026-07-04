/**
 * Icon registry — Phosphor only (skill: NO emojis; the PRD's 🔥 / 🛒 become real icons).
 * Standardised weight so the whole UI reads consistently.
 */
import {
  ArrowLeft,
  ArrowsLeftRight,
  Bell,
  Briefcase,
  CaretRight,
  ChartLineUp,
  ChartPieSlice,
  CheckCircle,
  Confetti,
  CurrencyInr,
  Eye,
  EyeSlash,
  FileText,
  Fire,
  ForkKnife,
  Gauge,
  Gift,
  GraduationCap,
  Handshake,
  House,
  Info,
  Lightning,
  ListChecks,
  MagnifyingGlass,
  PiggyBank,
  Plus,
  Power,
  QrCode,
  Receipt,
  ShieldCheck,
  ShoppingCart,
  Sliders,
  Sparkle,
  Storefront,
  TrendUp,
  User,
  WarningCircle,
  X,
  type Icon,
  type IconWeight,
} from "@phosphor-icons/react";

const REGISTRY: Record<string, Icon> = {
  // AiContent.icon values authored by the backend
  ChartLineUp,
  Flame: Fire,
  ShieldCheck,
  // nav + ui
  House, ArrowsLeftRight, TrendUp, Gift, DotsThree: ListChecks, Storefront,
  CurrencyInr, FileText, QrCode, PiggyBank, ArrowLeft, X, Eye, EyeSlash, Bell,
  MagnifyingGlass, Sliders, Plus, CaretRight, User, Power, Receipt,
  // ai
  Sparkle, Lightning, WarningCircle, CheckCircle, Info, Gauge, Confetti, Handshake,
  // categories (DESIGN.md spending map)
  ForkKnife, ShoppingCart, GraduationCap, ChartPieSlice, Briefcase,
};

export function PhIcon({
  name,
  size = 24,
  weight = "regular",
  className,
}: {
  name: string;
  size?: number;
  weight?: IconWeight;
  className?: string;
}) {
  const Cmp = REGISTRY[name] ?? Sparkle;
  return <Cmp size={size} weight={weight} className={className} />;
}

export {
  ArrowLeft, ArrowsLeftRight, Bell, CaretRight, CheckCircle, Confetti, CurrencyInr,
  Eye, EyeSlash, FileText, Fire, House, Info, Lightning, MagnifyingGlass, PiggyBank,
  Plus, Power, QrCode, ShieldCheck, Sliders, Sparkle, Storefront, TrendUp, User,
  WarningCircle, X, Gift, Receipt, Gauge, Handshake, GraduationCap,
};
