"use client";

import { useState, useEffect, useCallback } from "react";
import { SRSCard, Difficulty, createCard, reviewCard, getDueCards, getUpcomingCards } from "./sm2";

const STORAGE_KEY = "wordyfy_srs_cards";

function loadCards(): SRSCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCards(cards: SRSCard[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function useSRS() {
  const [cards, setCards] = useState<SRSCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCards(loadCards());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) saveCards(cards);
  }, [cards, loading]);

  const addWord = useCallback((wordId: string) => {
    setCards((prev) => {
      if (prev.find((c) => c.wordId === wordId)) return prev;
      return [...prev, createCard(wordId)];
    });
  }, []);

  const removeWord = useCallback((wordId: string) => {
    setCards((prev) => prev.filter((c) => c.wordId !== wordId));
  }, []);

  const rateCard = useCallback((wordId: string, difficulty: Difficulty): SRSCard | null => {
    const card = cards.find((c) => c.wordId === wordId);
    if (!card) return null;
    const updated = reviewCard(card, difficulty);
    setCards((prev) => prev.map((c) => (c.wordId === wordId ? updated : c)));
    return updated;
  }, [cards]);

  const getCard = useCallback((wordId: string) => cards.find((c) => c.wordId === wordId), [cards]);

  return {
    cards,
    loading,
    dueCards: getDueCards(cards),
    upcoming: getUpcomingCards(cards, 7),
    masteredCards: cards.filter((c) => c.repetitions >= 7),
    newCards: cards.filter((c) => c.repetitions === 0),
    addWord,
    removeWord,
    rateCard,
    getCard,
    totalCards: cards.length,
    dueCount: getDueCards(cards).length,
  };
}
