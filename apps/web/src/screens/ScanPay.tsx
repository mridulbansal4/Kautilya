/**
 * Scan & Pay — real-YONO Bharat QR / UPI scanner. A mock camera viewport with an animated scan
 * frame, plus a "My QR" tab to receive. SYNTHETIC (no real camera access).
 */
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "../components/organisms/AppBar";
import { SBIButton } from "../components/atoms/SBIButton";
import { PhIcon, QrCode } from "../lib/icons";
import { useAdaptive } from "../lib/adaptive";

export default function ScanPay() {
  const nav = useNavigate();
  const { customer } = useAdaptive();
  const [tab, setTab] = useState<"scan" | "mine">("scan");
  const upi = (customer?.display_name?.split(" ")[0] || "user").toLowerCase() + "@sbi";

  return (
    <div className="flex flex-1 flex-col bg-[#0b1220]">
      <AppBar title="Scan & Pay" back transparent />
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-24 text-white">
        {tab === "scan" ? (
          <>
            <div className="relative grid h-64 w-64 place-items-center rounded-2xl border border-white/15 bg-white/5">
              <QrCode size={120} weight="thin" className="text-white/25" />
              <motion.span
                className="absolute inset-x-6 h-0.5 rounded-full bg-[var(--colour-ai-secondary)] shadow-[0_0_18px_var(--colour-ai-secondary)]"
                initial={{ top: 24 }}
                animate={{ top: [24, 224, 24] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="absolute h-6 w-6 border-[var(--colour-ai-secondary)]"
                  style={{
                    top: i < 2 ? 8 : "auto", bottom: i >= 2 ? 8 : "auto",
                    left: i % 2 === 0 ? 8 : "auto", right: i % 2 === 1 ? 8 : "auto",
                    borderTopWidth: i < 2 ? 3 : 0, borderBottomWidth: i >= 2 ? 3 : 0,
                    borderLeftWidth: i % 2 === 0 ? 3 : 0, borderRightWidth: i % 2 === 1 ? 3 : 0,
                  }}
                />
              ))}
            </div>
            <p className="mt-6 t-body text-white/70">Point at any Bharat QR or UPI QR</p>
            <SBIButton variant="ai" className="mt-6" icon="Lightning" onClick={() => nav("/app/pay/send")}>
              Enter UPI ID instead
            </SBIButton>
          </>
        ) : (
          <div className="flex flex-col items-center rounded-2xl bg-white p-8 text-content-primary">
            <div className="grid h-44 w-44 place-items-center rounded-xl border border-line">
              <PhIcon name="QrCode" size={150} weight="bold" />
            </div>
            <div className="mt-4 t-title-sm">{customer?.display_name}</div>
            <div className="t-mono text-content-secondary">{upi}</div>
            <div className="mt-1 t-label-sm text-content-tertiary">Scan to pay me</div>
          </div>
        )}

        <div className="mt-8 flex gap-2 rounded-full bg-white/10 p-1">
          <button onClick={() => setTab("scan")} className={"rounded-full px-5 py-2 t-label " + (tab === "scan" ? "bg-white text-content-primary" : "text-white/70")}>Scan</button>
          <button onClick={() => setTab("mine")} className={"rounded-full px-5 py-2 t-label " + (tab === "mine" ? "bg-white text-content-primary" : "text-white/70")}>My QR</button>
        </div>
      </div>
    </div>
  );
}
