export type Difficulty = "again" | "hard" | "good" | "easy";

export interface SRSCard {
  wordId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  dueDate: string;
  lastReviewed: string;
  totalReviews: number;
  lapses: number;
  streak: number;
}

const QUALITY_MAP: Record<Difficulty, number> = {
  again: 0,
  hard: 2,
  good: 4,
  easy: 5,
};

export function createCard(wordId: string): SRSCard {
  return {
    wordId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: toDateString(new Date()),
    lastReviewed: toDateString(new Date()),
    totalReviews: 0,
    lapses: 0,
    streak: 0,
  };
}

export function reviewCard(card: SRSCard, difficulty: Difficulty): SRSCard {
  const q = QUALITY_MAP[difficulty];
  const now = new Date();
  let { easeFactor, interval, repetitions, lapses, streak } = card;

  if (q < 3) {
    repetitions = 0;
    interval = difficulty === "again" ? 1 : 3;
    lapses += 1;
    streak = 0;
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
    streak += 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  easeFactor = Math.max(1.3, Math.round(easeFactor * 100) / 100);
  interval = Math.min(365, Math.max(1, interval));

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    dueDate: toDateString(addDays(now, interval)),
    lastReviewed: toDateString(now),
    totalReviews: card.totalReviews + 1,
    lapses,
    streak,
  };
}

export function getDueCards(cards: SRSCard[]): SRSCard[] {
  const today = toDateString(new Date());
  return cards
    .filter((c) => c.dueDate <= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function getUpcomingCards(cards: SRSCard[], days = 7): { date: string; count: number }[] {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = toDateString(addDays(today, i + 1));
    return { date, count: cards.filter((c) => c.dueDate === date).length };
  });
}

export function getNextReviewLabel(card: SRSCard): string {
  const diff = Math.round(
    (new Date(card.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff <= 0) return "Due now";
  if (diff === 1) return "Tomorrow";
  if (diff < 7) return `In ${diff} days`;
  if (diff < 30) return `In ${Math.round(diff / 7)} weeks`;
  return `In ${Math.round(diff / 30)} months`;
}

export function getStrengthLabel(card: SRSCard): { label: string; color: string; pct: number } {
  const pct = Math.min(100, Math.round((card.repetitions / 8) * 100));
  if (card.repetitions === 0) return { label: "New", color: "#6C47FF", pct: 5 };
  if (card.repetitions <= 1) return { label: "Learning", color: "#f59e0b", pct: 20 };
  if (card.repetitions <= 3) return { label: "Young", color: "#3b82f6", pct: 50 };
  if (card.repetitions <= 6) return { label: "Mature", color: "#10b981", pct: 80 };
  return { label: "Mastered", color: "#10b981", pct: 100 };
}

export function previewIntervals(card: SRSCard): Record<Difficulty, number> {
  return {
    again: reviewCard(card, "again").interval,
    hard: reviewCard(card, "hard").interval,
    good: reviewCard(card, "good").interval,
    easy: reviewCard(card, "easy").interval,
  };
}

function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
