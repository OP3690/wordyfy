export interface StreakData {
  current: number;
  best: number;
  lastActivityDate: string;
  todayComplete: boolean;
  freezesAvailable: number;
  freezeUsedDates: string[];
  totalDaysActive: number;
  startDate: string;
  history: StreakDay[];
}

export interface StreakDay {
  date: string;
  completed: boolean;
  frozen: boolean;
}

export type StreakStatus = "active" | "at-risk" | "pending" | "frozen" | "broken";

export const MILESTONES = [7, 14, 30, 50, 100, 200, 365];

export const MILESTONE_META: Record<number, { emoji: string; title: string; desc: string; reward: string }> = {
  7:   { emoji: "🔥", title: "Week warrior!",      desc: "7 days straight. You're building a real habit.",        reward: "1 streak freeze earned" },
  14:  { emoji: "💪", title: "Two-week grind!",    desc: "Fourteen days of relentless vocabulary growth.",         reward: "2 streak freezes earned" },
  30:  { emoji: "🏆", title: "Month master!",      desc: "30 days — you've learned 200+ new words.",               reward: "3 streak freezes earned" },
  50:  { emoji: "⚡", title: "50-day legend!",     desc: "You're in the top 1% of vocabulary learners.",           reward: "Exclusive 'Legend' badge" },
  100: { emoji: "🌟", title: "Century champion!",  desc: "100 days. Your vocabulary has transformed.",             reward: "Exclusive 'Century' badge + 5 freezes" },
  200: { emoji: "💎", title: "Diamond streak!",    desc: "200 consecutive days. Extraordinary commitment.",        reward: "Lifetime 'Diamond' status" },
  365: { emoji: "👑", title: "Year of words!",     desc: "365 days. You did the impossible.",                      reward: "Hall of fame + lifetime premium" },
};

export const MILESTONE_FREEZE_REWARDS: Record<number, number> = { 7: 1, 14: 2, 30: 3, 50: 1, 100: 5 };

export function toDateString(date: Date): string { return date.toISOString().split("T")[0]; }
export function today(): string { return toDateString(new Date()); }
export function yesterday(): string { const d = new Date(); d.setDate(d.getDate() - 1); return toDateString(d); }
export function hoursLeftToday(): number {
  const now = new Date();
  const end = new Date(); end.setHours(23,59,59,999);
  return Math.max(0, (end.getTime() - now.getTime()) / (1000 * 60 * 60));
}
export function isAtRisk(data: StreakData): boolean {
  return !data.todayComplete && hoursLeftToday() < 3;
}
export function getStreakStatus(data: StreakData): StreakStatus {
  if (data.todayComplete) return "active";
  if (data.freezeUsedDates.includes(today())) return "frozen";
  if (isAtRisk(data)) return "at-risk";
  if (data.lastActivityDate !== today() && data.lastActivityDate !== yesterday()) return "broken";
  return "pending";
}
export function createStreak(): StreakData {
  const t = today();
  return { current: 0, best: 0, lastActivityDate: t, todayComplete: false, freezesAvailable: 0, freezeUsedDates: [], totalDaysActive: 0, startDate: t, history: [] };
}
export function completeDay(data: StreakData): { updatedData: StreakData; newStreak: number; milestoneHit: number | null; streakFreezeEarned: number } {
  const t = today();
  if (data.todayComplete && data.lastActivityDate === t) return { updatedData: data, newStreak: data.current, milestoneHit: null, streakFreezeEarned: 0 };
  const wasActive = data.lastActivityDate === yesterday() || data.freezeUsedDates.includes(yesterday());
  const newCurrent = wasActive ? data.current + 1 : 1;
  const newBest = Math.max(data.best, newCurrent);
  const milestoneHit = MILESTONES.includes(newCurrent) ? newCurrent : null;
  const freezeEarned = milestoneHit ? (MILESTONE_FREEZE_REWARDS[milestoneHit] ?? 0) : 0;
  const history = updateHistory(data.history, t, true, false);
  return {
    updatedData: { ...data, current: newCurrent, best: newBest, lastActivityDate: t, todayComplete: true, freezesAvailable: data.freezesAvailable + freezeEarned, totalDaysActive: data.totalDaysActive + 1, startDate: wasActive ? data.startDate : t, history },
    newStreak: newCurrent, milestoneHit, streakFreezeEarned: freezeEarned,
  };
}
export function applyFreeze(data: StreakData): StreakData | null {
  if (data.freezesAvailable <= 0 || data.todayComplete) return null;
  const t = today();
  if (data.freezeUsedDates.includes(t)) return null;
  return { ...data, freezesAvailable: data.freezesAvailable - 1, freezeUsedDates: [...data.freezeUsedDates, t], lastActivityDate: t, history: updateHistory(data.history, t, false, true) };
}
export function checkAndRepairStreak(data: StreakData): StreakData {
  const t = today();
  if (data.lastActivityDate === t) return data;
  const daysMissed = Math.round((new Date(t).getTime() - new Date(data.lastActivityDate).getTime()) / (1000 * 60 * 60 * 24));
  if (daysMissed <= 1) return data;
  if (data.freezeUsedDates.includes(yesterday())) return data;
  if (daysMissed === 2 && data.freezesAvailable > 0) {
    const healed = applyFreeze({ ...data, lastActivityDate: yesterday() });
    if (healed) return { ...healed, lastActivityDate: yesterday() };
  }
  return { ...data, current: 0, todayComplete: false, startDate: t, history: updateHistory(data.history, t, false, false) };
}
function updateHistory(history: StreakDay[], date: string, completed: boolean, frozen: boolean): StreakDay[] {
  const existing = history.findIndex((h) => h.date === date);
  const entry: StreakDay = { date, completed, frozen };
  const updated = existing >= 0 ? history.map((h, i) => i === existing ? entry : h) : [...history, entry];
  return updated.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
}
export function getRecentDays(data: StreakData, n = 14): StreakDay[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (n - 1 - i));
    const dateStr = toDateString(d);
    return data.history.find((h) => h.date === dateStr) ?? { date: dateStr, completed: false, frozen: false };
  });
}
export function nextMilestone(current: number): number | null { return MILESTONES.find((m) => m > current) ?? null; }
export function milestoneProgress(current: number): number {
  const prev = [...MILESTONES].reverse().find((m) => m <= current) ?? 0;
  const next = nextMilestone(current);
  if (!next) return 100;
  return Math.round(((current - prev) / (next - prev)) * 100);
}
