"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSRS } from "@/lib/useSRS";
import ReviewSession, { SessionStats } from "@/components/ReviewSession";
import SessionComplete from "@/components/SessionComplete";
import { getUserSession } from "@/lib/auth";
import { Word } from "@/types/word";

type View = "session" | "complete";

function wordToReviewData(w: Word): { id: string; word: string; meaning: string; hindi: string; partOfSpeech: string; example: string } {
  const id = w._id ? String(w._id) : "";
  const meaning =
    (w.meanings?.[0]?.definitions?.[0]?.definition as string) ||
    (w as unknown as { definition?: string }).definition ||
    "No definition";
  const example =
    (w.meanings?.[0]?.definitions?.[0]?.example as string) ||
    (w as unknown as { example?: string }).example ||
    `Example: "${w.englishWord}" in a sentence.`;
  return {
    id,
    word: w.englishWord.charAt(0).toUpperCase() + w.englishWord.slice(1),
    meaning,
    hindi: w.translation || (w as Word & { hindiTranslation?: string }).hindiTranslation || "—",
    partOfSpeech: w.partOfSpeech || w.meanings?.[0]?.partOfSpeech || "noun",
    example,
  };
}

export default function VaultReviewPage() {
  const { dueCards, upcoming, rateCard, loading } = useSRS();
  const [view, setView] = useState<View>("session");
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);
  const [wordMap, setWordMap] = useState<Record<string, { id: string; word: string; meaning: string; hindi: string; partOfSpeech: string; example: string }>>({});
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const { userId } = getUserSession();
    if (!userId) {
      window.location.href = "/login";
      return;
    }
    setAuthChecked(true);
    fetch(`/api/words?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => {
        const words: Word[] = data.words || [];
        const map: Record<string, ReturnType<typeof wordToReviewData>> = {};
        words.forEach((w) => {
          const id = w._id ? String(w._id) : "";
          if (id) map[id] = wordToReviewData(w);
        });
        setWordMap(map);
      })
      .catch(() => setWordMap({}));
  }, []);

  const getWordData = useMemo(
    () => (id: string) => wordMap[id],
    [wordMap]
  );

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-gray-50 max-w-[560px] mx-auto px-6 py-8">
        <div className="py-16 text-center text-gray-500 text-sm">Loading review queue…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 max-w-[560px] mx-auto px-6 py-6">
      <div className="mb-6">
        <Link href="/vault" className="text-sm text-gray-500 no-underline hover:text-gray-700">
          ← Vault
        </Link>
        <div className="flex justify-between items-center mt-2">
          <h1 className="text-xl font-medium text-gray-900 m-0">Daily review</h1>
          <span
            className={`text-sm font-medium px-2.5 py-1 rounded-full ${
              dueCards.length > 0 ? "bg-purple-500/10 text-[#6C47FF] border border-purple-500/20" : "bg-gray-100 text-gray-500 border border-gray-200"
            }`}
          >
            {dueCards.length} due
          </span>
        </div>
      </div>

      {dueCards.length === 0 && view === "session" && (
        <div className="bg-white border border-gray-200 rounded-xl py-12 px-8 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            No words due right now. Come back tomorrow.
          </p>
          <Link
            href="/vault"
            className="inline-block py-2.5 px-6 rounded-lg bg-[#6C47FF] text-white text-sm font-medium no-underline"
          >
            Add more words →
          </Link>
        </div>
      )}

      {view === "session" && dueCards.length > 0 && (
        <ReviewSession
          dueCards={dueCards}
          getWordData={getWordData}
          onRate={(id, d) => rateCard(id, d)}
          onComplete={(s) => {
            setSessionStats(s);
            setView("complete");
          }}
        />
      )}

      {view === "complete" && sessionStats && (
        <SessionComplete
          stats={sessionStats}
          upcoming={upcoming}
          onReviewMore={() => setView("session")}
          onGoToVault={() => {
            window.location.href = "/vault";
          }}
        />
      )}
    </main>
  );
}
