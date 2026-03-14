"use client";

import { useState, useCallback, useEffect } from "react";
import { SRSCard, Difficulty, previewIntervals, getStrengthLabel } from "@/lib/sm2";

interface WordData {
  id: string;
  word: string;
  meaning: string;
  hindi: string;
  partOfSpeech: string;
  example: string;
}

interface ReviewSessionProps {
  dueCards: SRSCard[];
  getWordData: (wordId: string) => WordData | undefined;
  onRate: (wordId: string, difficulty: Difficulty) => void;
  onComplete: (stats: SessionStats) => void;
}

export interface SessionStats {
  total: number;
  again: number;
  hard: number;
  good: number;
  easy: number;
  durationSeconds: number;
}

type Phase = "question" | "answer";

const DIFFICULTY_CONFIG = [
  { key: "again" as Difficulty, label: "Again", sublabel: "Forgot", color: "#ef4444", bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", shortcut: "1" },
  { key: "hard" as Difficulty, label: "Hard", sublabel: "Struggled", color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)", shortcut: "2" },
  { key: "good" as Difficulty, label: "Good", sublabel: "Recalled", color: "#3b82f6", bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.25)", shortcut: "3" },
  { key: "easy" as Difficulty, label: "Easy", sublabel: "Perfect", color: "#10b981", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.25)", shortcut: "4" },
];

function fmtInterval(days: number): string {
  if (days === 1) return "1d";
  if (days < 7) return `${days}d`;
  if (days < 30) return `${Math.round(days / 7)}w`;
  return `${Math.round(days / 30)}mo`;
}

export default function ReviewSession({ dueCards, getWordData, onRate, onComplete }: ReviewSessionProps) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [flipped, setFlipped] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [stats, setStats] = useState<SessionStats>({ total: dueCards.length, again: 0, hard: 0, good: 0, easy: 0, durationSeconds: 0 });
  const [startTime] = useState(Date.now());

  const card = dueCards[index];
  const wordData = card ? getWordData(card.wordId) : undefined;
  const intervals = card ? previewIntervals(card) : null;
  const strength = card ? getStrengthLabel(card) : null;
  const progress = dueCards.length > 0 ? Math.round((index / dueCards.length) * 100) : 0;

  const handleReveal = useCallback(() => {
    if (phase === "question") {
      setPhase("answer");
      setFlipped(true);
    }
  }, [phase]);

  const handleRate = useCallback(
    (difficulty: Difficulty) => {
      if (animating || phase !== "answer" || !card) return;
      setAnimating(true);
      const newStats = {
        ...stats,
        [difficulty]: (stats[difficulty] ?? 0) + 1,
      };
      setStats(newStats);
      onRate(card.wordId, difficulty);
      setTimeout(() => {
        if (index + 1 >= dueCards.length) {
          onComplete({ ...newStats, durationSeconds: Math.round((Date.now() - startTime) / 1000) });
        } else {
          setIndex((i) => i + 1);
          setPhase("question");
          setFlipped(false);
        }
        setAnimating(false);
      }, 300);
    },
    [animating, phase, card, index, dueCards.length, onRate, onComplete, stats, startTime]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleReveal();
      }
      if (phase === "answer") {
        if (e.key === "1") handleRate("again");
        if (e.key === "2") handleRate("hard");
        if (e.key === "3") handleRate("good");
        if (e.key === "4") handleRate("easy");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleReveal, handleRate, phase]);

  if (!card || !wordData) return null;

  return (
    <div className="flex flex-col gap-5 max-w-[560px] mx-auto py-2">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#6C47FF] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {index + 1} / {dueCards.length}
        </span>
      </div>

      {/* Card */}
      <div
        onClick={phase === "question" ? handleReveal : undefined}
        className={`
          bg-white border rounded-xl p-8 min-h-[260px] flex flex-col justify-between
          ${phase === "question" ? "cursor-pointer border-gray-300" : "border-gray-200"}
          ${animating ? "opacity-40" : ""}
          transition-opacity duration-300
        `}
      >
        <div className="flex justify-between items-center mb-6">
          <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
            {wordData.partOfSpeech}
          </span>
          {strength && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded-full border"
              style={{ background: `${strength.color}15`, color: strength.color, borderColor: `${strength.color}30` }}
            >
              {strength.label}
            </span>
          )}
        </div>

        <div className="flex-1">
          <div className="text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-3">
            {wordData.word}
          </div>
          <div
            className={`transition-all duration-250 ${flipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
          >
            <p className="text-[17px] text-gray-900 leading-relaxed mb-3">{wordData.meaning}</p>
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg py-1.5 px-3.5 mb-4">
              <span className="text-sm">🇮🇳</span>
              <span className="text-[15px] text-[#7C5CFC]">{wordData.hindi}</span>
            </div>
            <p className="text-sm text-gray-600 italic leading-relaxed border-l-2 border-purple-500/30 pl-3">
              &ldquo;{wordData.example}&rdquo;
            </p>
          </div>
        </div>

        {phase === "question" && (
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-500">
              Tap to reveal · or press{" "}
              <kbd className="text-xs px-1.5 py-0.5 border border-gray-300 rounded bg-gray-100">Space</kbd>
            </span>
          </div>
        )}
      </div>

      {/* Difficulty buttons */}
      <div
        className={`grid grid-cols-4 gap-2 transition-all duration-200 ${
          phase === "answer" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        {DIFFICULTY_CONFIG.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => handleRate(d.key)}
            className="flex flex-col items-center gap-1 py-3 px-2 rounded-lg border bg-white cursor-pointer outline-none hover:bg-gray-50 transition-colors"
            style={{ borderColor: d.border }}
          >
            <span className="text-sm font-medium" style={{ color: d.color }}>
              {d.label}
            </span>
            <span className="text-[11px] text-gray-500">{d.sublabel}</span>
            {intervals && (
              <span
                className="text-[11px] font-medium mt-0.5 px-1.5 py-0.5 rounded-full"
                style={{ color: d.color, background: d.bg }}
              >
                {fmtInterval(intervals[d.key])}
              </span>
            )}
            <span className="text-[10px] text-gray-400">[{d.shortcut}]</span>
          </button>
        ))}
      </div>

      {card.lapses >= 3 && (
        <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg py-2 px-3 text-center">
          This word has lapsed {card.lapses} times. Try relearning it from scratch.
        </div>
      )}
    </div>
  );
}
