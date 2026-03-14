"use client";
import { useEffect, useState } from "react";
import { MILESTONE_META, MILESTONES } from "@/lib/streak";

export default function MilestoneModal({ milestone, currentStreak, onDismiss }: { milestone: number; currentStreak: number; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);
  const meta = MILESTONE_META[milestone];
  useEffect(() => { const t = setTimeout(() => setVisible(true), 50); return () => clearTimeout(t); }, []);
  if (!meta) return null;
  const APP_URL = "https://www.wordyfy.com";
  const shareText = `${meta.emoji} Just hit a ${milestone}-day streak on WordyFy!\n\n"${meta.desc}"\n\nCan you keep up? → ${APP_URL}/quiz`;
  const tweetText = `${meta.emoji} ${milestone}-day vocabulary streak on @wordyfy!\n\n${meta.title}\n\nJoin me → ${APP_URL}`;
  const close = () => { setVisible(false); setTimeout(onDismiss, 250); };

  return (
    <>
      <style>{`
        @keyframes wf-confetti{0%{transform:translateY(-10px) rotate(0);opacity:1}100%{transform:translateY(80px) rotate(360deg);opacity:0}}
        @keyframes wf-modal-in{from{transform:translateY(24px) scale(0.96);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
        @keyframes wf-modal-out{from{transform:translateY(0) scale(1);opacity:1}to{transform:translateY(16px) scale(0.97);opacity:0}}
        @keyframes wf-bounce{0%,100%{transform:translateY(0)}40%{transform:translateY(-12px)}60%{transform:translateY(-6px)}}
      `}</style>
      <div onClick={close} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:999,opacity:visible?1:0,transition:"opacity 0.25s",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 16px 24px" }} role="dialog" aria-modal="true" aria-labelledby="milestone-title">
        <div onClick={e=>e.stopPropagation()} style={{ width:"100%",maxWidth:420,background:"var(--color-background-primary)",borderRadius:"var(--border-radius-xl)",border:"0.5px solid var(--color-border-secondary)",padding:"2rem 1.75rem 1.5rem",animation:visible?"wf-modal-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards":"wf-modal-out 0.25s ease forwards",position:"relative",overflow:"hidden" }}>
          {Array.from({length:8}).map((_,i)=>(
            <div key={i} style={{ position:"absolute",top:-8,left:`${10+i*11}%`,width:6,height:6,borderRadius:"50%",background:["#f97316","#6C47FF","#10b981","#3b82f6","#f59e0b","#ec4899","#f97316","#6C47FF"][i],animation:`wf-confetti ${0.8+i*0.1}s ease ${i*0.07}s forwards` }} />
          ))}
          <button type="button" onClick={close} style={{ position:"absolute",top:14,right:14,width:28,height:28,borderRadius:"50%",border:"0.5px solid var(--color-border-tertiary)",background:"var(--color-background-secondary)",color:"var(--color-text-tertiary)",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }} aria-label="Close">×</button>
          <div style={{textAlign:"center",fontSize:64,lineHeight:1,marginBottom:"1rem",animation:"wf-bounce 0.7s ease 0.3s"}}>{meta.emoji}</div>
          <h2 id="milestone-title" style={{textAlign:"center",fontSize:22,fontWeight:600,color:"var(--color-text-primary)",margin:"0 0 8px"}}>{meta.title}</h2>
          <div style={{textAlign:"center",marginBottom:12}}>
            <span style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(249,115,22,0.1)",border:"0.5px solid rgba(249,115,22,0.3)",borderRadius:99,padding:"4px 14px",fontSize:15,fontWeight:600,color:"#f97316"}}>🔥 {currentStreak} day streak</span>
          </div>
          <p style={{textAlign:"center",fontSize:14,color:"var(--color-text-secondary)",lineHeight:1.6,marginBottom:"1rem"}}>{meta.desc}</p>
          <div style={{textAlign:"center",marginBottom:"1.5rem"}}><span style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(108,71,255,0.08)",border:"0.5px solid rgba(108,71,255,0.25)",borderRadius:"var(--border-radius-md)",padding:"6px 14px",fontSize:13,color:"#6C47FF"}}>🎁 {meta.reward}</span></div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:0,marginBottom:"1.5rem"}}>
            {[7,14,30,50,100].map((m,i)=>{const reached=m<=milestone,cur=m===milestone;return(
              <div key={m} style={{display:"flex",alignItems:"center"}}>
                <div style={{width:cur?32:20,height:cur?32:20,borderRadius:"50%",background:reached?(cur?"#f97316":"rgba(249,115,22,0.3)"):"var(--color-background-tertiary)",border:cur?"2px solid #f97316":`0.5px solid ${reached?"rgba(249,115,22,0.4)":"var(--color-border-tertiary)"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:cur?14:9,color:reached?(cur?"#fff":"#f97316"):"var(--color-text-tertiary)",fontWeight:500,flexShrink:0}}>
                  {cur?MILESTONE_META[m]?.emoji:m}
                </div>
                {i<4&&<div style={{width:20,height:2,background:m<milestone?"rgba(249,115,22,0.3)":"var(--color-background-tertiary)"}}/>}
              </div>
            );})}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <button type="button" onClick={async()=>{if(navigator.share)await navigator.share({title:`WordyFy ${milestone}-day streak!`,text:shareText,url:APP_URL});else{await navigator.clipboard.writeText(shareText);alert("Copied!");}}} style={{width:"100%",padding:"12px 0",borderRadius:"var(--border-radius-md)",border:"none",background:"#6C47FF",color:"#fff",fontSize:14,fontWeight:500,cursor:"pointer"}}>📤 Share your achievement</button>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" style={{display:"block",textAlign:"center",padding:"10px 0",borderRadius:"var(--border-radius-md)",background:"rgba(37,211,102,0.08)",border:"0.5px solid rgba(37,211,102,0.25)",color:"#22c55e",fontSize:13,fontWeight:500,textDecoration:"none"}}>WhatsApp</a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`} target="_blank" rel="noopener noreferrer" style={{display:"block",textAlign:"center",padding:"10px 0",borderRadius:"var(--border-radius-md)",background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-tertiary)",color:"var(--color-text-secondary)",fontSize:13,fontWeight:500,textDecoration:"none"}}>Post on X</a>
            </div>
            <button type="button" onClick={close} style={{width:"100%",padding:"10px 0",borderRadius:"var(--border-radius-md)",border:"none",background:"transparent",color:"var(--color-text-tertiary)",fontSize:13,cursor:"pointer"}}>Keep learning →</button>
          </div>
        </div>
      </div>
    </>
  );
}
