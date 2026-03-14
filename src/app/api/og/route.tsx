import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "default";
  const word = searchParams.get("word") || "";
  const meaning = searchParams.get("meaning") || "";
  const hindi = searchParams.get("hindi") || "";
  const score = searchParams.get("score") || "";
  const streak = searchParams.get("streak") || "";
  const emoji = searchParams.get("emoji") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0f0f11 0%, #1a1235 50%, #0f0f11 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Purple glow */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(circle, rgba(108,71,255,0.2) 0%, transparent 70%)" }} />

        {/* Logo */}
        <div style={{ position: "absolute", top: 40, left: 60, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#6C47FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "white" }}>W</div>
          <span style={{ color: "#ffffff", fontSize: 22, fontWeight: 600 }}>WordyFy</span>
        </div>
        <div style={{ position: "absolute", top: 48, right: 60, color: "rgba(255,255,255,0.4)", fontSize: 18 }}>wordyfy.com</div>

        {/* WORD type */}
        {type === "word" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", padding: "0 80px", marginTop: 80, flex: 1 }}>
            <div style={{ fontSize: 14, color: "#6C47FF", fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", marginBottom: 16 }}>Word of the Day</div>
            <div style={{ fontSize: 96, fontWeight: 700, color: "#ffffff", lineHeight: 1.1, marginBottom: 20 }}>{word}</div>
            <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", marginBottom: 16, maxWidth: 800 }}>{meaning}</div>
            {hindi && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(108,71,255,0.2)", border: "1px solid rgba(108,71,255,0.4)", borderRadius: 12, padding: "10px 20px" }}>
                <span style={{ fontSize: 22 }}>🇮🇳</span>
                <span style={{ color: "#a78bfa", fontSize: 24 }}>{hindi}</span>
              </div>
            )}
          </div>
        )}

        {/* QUIZ type */}
        {type === "quiz" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 24 }}>
            <div style={{ fontSize: 18, color: "#a78bfa", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>Daily Quiz Result</div>
            <div style={{ fontSize: 80, fontWeight: 800, color: "#ffffff" }}>{score}/10</div>
            {emoji && <div style={{ fontSize: 36, letterSpacing: 4, background: "rgba(255,255,255,0.05)", borderRadius: 16, padding: "16px 28px" }}>{emoji}</div>}
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }}>Can you beat me? 👇</div>
          </div>
        )}

        {/* STREAK type */}
        {type === "streak" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 16 }}>
            <div style={{ fontSize: 80 }}>🔥</div>
            <div style={{ fontSize: 100, fontWeight: 800, color: "#f97316", lineHeight: 1 }}>{streak}</div>
            <div style={{ fontSize: 32, color: "#ffffff", fontWeight: 600 }}>Day Streak!</div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 20 }}>I&apos;m on a vocabulary winning streak on WordyFy</div>
          </div>
        )}

        {/* DEFAULT type */}
        {type === "default" && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, gap: 20, textAlign: "center", padding: "0 80px" }}>
            <div style={{ fontSize: 64, fontWeight: 800, color: "#ffffff", lineHeight: 1.2 }}>Make Words Your Superpower</div>
            <div style={{ fontSize: 28, color: "rgba(255,255,255,0.6)" }}>AI-powered vocabulary · Hindi translations · Daily quizzes</div>
          </div>
        )}

        {/* Bottom bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #6C47FF, #a78bfa, #6C47FF)" }} />
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
