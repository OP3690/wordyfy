"use client";

import { useState } from "react";

interface QuizResult {
  score: number;
  total: number;
  answers: ("correct" | "wrong" | "skipped")[];
  streak: number;
  date: string;
}

function answersToEmoji(answers: QuizResult["answers"]): string {
  return answers.map((a) => (a === "correct" ? "🟩" : a === "wrong" ? "🟥" : "⬜")).join("");
}

function getTitle(score: number, total: number): string {
  const pct = total > 0 ? score / total : 0;
  if (pct === 1) return "Perfect score! 🎯";
  if (pct >= 0.8) return "Excellent! 🔥";
  if (pct >= 0.6) return "Good job! 💪";
  if (pct >= 0.4) return "Keep going! 📚";
  return "Room to grow! 🌱";
}

export default function ShareCard({ result, username }: { result: QuizResult; username?: string }) {
  const [copied, setCopied] = useState(false);
  const emojiGrid = answersToEmoji(result.answers);
  const title = getTitle(result.score, result.total);
  const date = new Date(result.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

  const shareText = `WordyFy Quiz — ${date}\n\n${title}\n${result.score}/${result.total} words correct\n\n${emojiGrid}\n\n🔥 ${result.streak} day streak\n\nPlay at wordyfy.com/quiz`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: "WordyFy Quiz Result", text: shareText, url: "https://www.wordyfy.com/quiz" });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      <div className="w-full bg-[#1a1235] border border-purple-500/20 rounded-2xl p-6 text-center">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">W</div>
            <span className="text-white/60 text-sm">WordyFy</span>
          </div>
          <div className="text-white/40 text-xs">{date}</div>
        </div>
        <div className="mb-2">
          <span className="text-5xl font-bold text-white">{result.score}</span>
          <span className="text-white/40 text-2xl">/{result.total}</span>
        </div>
        <p className="text-purple-300 font-semibold mb-4">{title}</p>
        <div className="text-2xl tracking-widest mb-4">{emojiGrid}</div>
        {result.streak > 1 && (
          <div className="inline-flex items-center gap-1.5 bg-orange-500/15 text-orange-400 border border-orange-500/20 rounded-full px-3 py-1 text-sm mb-3">
            <span>🔥</span><span>{result.streak} day streak</span>
          </div>
        )}
        {username && <p className="text-white/30 text-xs">@{username}</p>}
        <p className="text-white/20 text-xs mt-2">wordyfy.com/quiz</p>
      </div>

      <div className="w-full space-y-2">
        <button onClick={handleNativeShare}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3.5 rounded-xl transition-colors">
          📤 Share Result
        </button>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={handleCopy}
            className="bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 py-2.5 rounded-xl text-sm transition-colors">
            {copied ? "✓ Copied" : "📋 Copy"}
          </button>
          <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank" rel="noopener noreferrer"
            className="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 py-2.5 rounded-xl text-sm text-center transition-colors">
            WA
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`WordyFy ${result.score}/${result.total} ${emojiGrid} ${title} → wordyfy.com/quiz`)}`}
            target="_blank" rel="noopener noreferrer"
            className="bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 py-2.5 rounded-xl text-sm text-center transition-colors">
            X
          </a>
        </div>
        <button
          type="button"
          onClick={() => {
            const url = `https://www.wordyfy.com/quiz?challenge=true&score=${result.score}`;
            navigator.clipboard?.writeText(url);
            alert("Challenge link copied! Send it to a friend 🎯");
          }}
          className="w-full text-purple-400 border border-purple-500/20 hover:bg-purple-500/10 font-medium py-3 rounded-xl text-sm transition-colors">
          ⚔️ Challenge a friend to beat your score
        </button>
      </div>
    </div>
  );
}
