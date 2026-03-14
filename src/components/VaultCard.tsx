"use client";

import { SRSCard, getStrengthLabel, getNextReviewLabel } from "@/lib/sm2";

interface WordData {
  id: string;
  word: string;
  meaning: string;
  hindi: string;
  partOfSpeech: string;
}

interface VaultCardProps {
  word: WordData;
  card: SRSCard | undefined;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onReview: (id: string) => void;
}

export default function VaultCard({ word, card, onAdd, onRemove, onReview }: VaultCardProps) {
  const today = new Date().toISOString().split("T")[0];
  const isDue = card ? card.dueDate <= today : false;
  const strength = card ? getStrengthLabel(card) : null;
  const nextReview = card ? getNextReviewLabel(card) : null;

  return (
    <div
      className={`bg-white rounded-xl p-4 flex flex-col gap-2.5 border ${
        isDue ? "border-purple-400/40" : "border-gray-200"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-lg font-medium text-gray-900 mb-0.5">{word.word}</div>
          <div className="text-xs text-gray-400 italic">{word.partOfSpeech}</div>
        </div>
        {isDue && (
          <span className="text-[11px] font-medium py-0.5 px-2 rounded-full bg-purple-500/10 text-[#6C47FF] border border-purple-500/30">
            Due now
          </span>
        )}
      </div>

      <div>
        <p className="text-sm text-gray-600 m-0 mb-1 leading-snug">{word.meaning}</p>
        <span className="text-xs text-[#7C5CFC]">🇮🇳 {word.hindi}</span>
      </div>

      {card && strength && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-0.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${strength.pct}%`, background: strength.color }}
              />
            </div>
            <span className="text-[11px] font-medium" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
          <div className="flex gap-3">
            {[
              ["Next review", nextReview],
              ["Interval", `${card.interval}d`],
              ["Reviews", String(card.totalReviews)],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <div className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</div>
                <div className="text-xs font-medium text-gray-900">{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1.5">
        {card ? (
          <>
            {isDue && (
              <button
                type="button"
                onClick={() => onReview(word.id)}
                className="flex-1 py-2 rounded-lg border-0 bg-[#6C47FF] text-white text-sm font-medium cursor-pointer"
              >
                Review now
              </button>
            )}
            <button
              type="button"
              onClick={() => onRemove(word.id)}
              className={isDue ? "py-2 px-3 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm cursor-pointer" : "flex-1 py-2 px-3 rounded-lg border border-gray-200 bg-white text-gray-600 text-sm cursor-pointer"}
            >
              {isDue ? "Remove" : "Remove from SRS"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onAdd(word.id)}
            className="flex-1 py-2 rounded-lg border border-purple-500/30 bg-purple-500/5 text-[#6C47FF] text-sm font-medium cursor-pointer"
          >
            + Add to SRS review
          </button>
        )}
      </div>
    </div>
  );
}
