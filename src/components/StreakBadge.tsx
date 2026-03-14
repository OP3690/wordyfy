"use client";
import { useStreak } from "@/lib/useStreak";

export default function StreakBadge({ onClick, size = "md" }: { onClick?: () => void; size?: "sm"|"md" }) {
  const { streak, status, loading } = useStreak();
  if (loading) return null;
  const sm = size === "sm";
  const cfg = {
    active:   { bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)",  color: "#f97316", pulse: false },
    pending:  { bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.2)",  color: "#f97316", pulse: false },
    "at-risk":{ bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.35)", color: "#ef4444", pulse: true  },
    frozen:   { bg: "rgba(99,179,237,0.12)", border: "rgba(99,179,237,0.3)", color: "#60a5fa", pulse: false },
    broken:   { bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.2)",color: "var(--color-text-tertiary)", pulse: false },
  }[status];
  return (
    <>
      <style>{`@keyframes wf-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.7;transform:scale(1.06)}}`}</style>
      <button type="button" onClick={onClick} style={{ display:"inline-flex", alignItems:"center", gap: sm?4:6, padding: sm?"4px 10px":"6px 14px", borderRadius:99, border:`0.5px solid ${cfg.border}`, background:cfg.bg, cursor:onClick?"pointer":"default", animation:cfg.pulse?"wf-pulse 1.5s ease-in-out infinite":"none", outline:"none" }}>
        <span style={{ fontSize:sm?14:16 }}>{status==="frozen"?"🧊":status==="broken"?"💔":"🔥"}</span>
        <span style={{ fontSize:sm?13:15, fontWeight:600, color:cfg.color, fontVariantNumeric:"tabular-nums" }}>{streak.current}</span>
        {!sm && <span style={{ fontSize:12, color:cfg.color, opacity:0.8 }}>{status==="at-risk"?"at risk!":status==="frozen"?"frozen":status==="broken"?"start":"day streak"}</span>}
      </button>
    </>
  );
}
