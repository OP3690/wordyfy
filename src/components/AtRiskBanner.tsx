"use client";
import { useState, useEffect } from "react";
import { useStreak } from "@/lib/useStreak";

export default function AtRiskBanner({ onAction }: { onAction: () => void }) {
  const { streak, status, atRisk, useFreeze } = useStreak();
  const [dismissed, setDismissed] = useState(false);
  const [freezeUsed, setFreezeUsed] = useState(false);
  const [timeStr, setTimeStr] = useState("");
  useEffect(() => {
    const update = () => { const now=new Date(),end=new Date(); end.setHours(23,59,59,999); const d=end.getTime()-now.getTime(); setTimeStr(`${Math.floor(d/3600000)}h ${Math.floor((d%3600000)/60000)}m ${Math.floor((d%60000)/1000)}s`); };
    update(); const t=setInterval(update,1000); return ()=>clearInterval(t);
  }, []);
  if (!atRisk||dismissed||streak.todayComplete||streak.current===0||status==="broken") return null;
  if (freezeUsed) return (
    <div style={{ background:"rgba(96,165,250,0.08)", border:"0.5px solid rgba(96,165,250,0.3)", borderRadius:"var(--border-radius-md)", padding:"10px 16px", display:"flex", alignItems:"center", gap:10, marginBottom:"1rem" }}>
      <span style={{fontSize:18}}>🧊</span>
      <div><p style={{fontSize:13,fontWeight:500,color:"#60a5fa",margin:"0 0 2px"}}>Streak frozen for today</p><p style={{fontSize:12,color:"var(--color-text-tertiary)",margin:0}}>Your {streak.current}-day streak is safe. Come back tomorrow!</p></div>
    </div>
  );
  return (
    <>
      <style>{`@keyframes wf-risk-pulse{0%,100%{border-color:rgba(239,68,68,0.3)}50%{border-color:rgba(239,68,68,0.7)}}`}</style>
      <div style={{ background:"rgba(239,68,68,0.06)", border:"0.5px solid rgba(239,68,68,0.3)", borderRadius:"var(--border-radius-lg)", padding:"1rem 1.25rem", marginBottom:"1rem", animation:"wf-risk-pulse 2s ease-in-out infinite" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{fontSize:20}}>⚠️</span>
            <div>
              <p style={{fontSize:14,fontWeight:600,color:"#ef4444",margin:"0 0 2px"}}>Your {streak.current}-day streak is at risk!</p>
              <p style={{fontSize:12,color:"var(--color-text-tertiary)",margin:0}}>Time remaining: <span style={{fontWeight:600,color:"#ef4444",fontVariantNumeric:"tabular-nums"}}>{timeStr}</span></p>
            </div>
          </div>
          <button type="button" onClick={()=>setDismissed(true)} style={{background:"none",border:"none",color:"var(--color-text-tertiary)",cursor:"pointer",fontSize:16,padding:0,flexShrink:0}} aria-label="Dismiss">×</button>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button type="button" onClick={onAction} style={{flex:2,padding:"9px 0",borderRadius:"var(--border-radius-md)",border:"none",background:"#ef4444",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer"}}>🎯 Do today&apos;s quiz now</button>
          {streak.freezesAvailable>0&&<button type="button" onClick={()=>{useFreeze();setFreezeUsed(true);}} style={{flex:1,padding:"9px 0",borderRadius:"var(--border-radius-md)",border:"0.5px solid rgba(96,165,250,0.3)",background:"rgba(96,165,250,0.08)",color:"#60a5fa",fontSize:13,fontWeight:500,cursor:"pointer",whiteSpace:"nowrap"}}>🧊 Freeze ({streak.freezesAvailable})</button>}
        </div>
      </div>
    </>
  );
}
