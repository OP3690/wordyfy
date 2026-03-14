"use client";

import { useState, useEffect, useCallback } from "react";
import { StreakData, StreakStatus, createStreak, completeDay, applyFreeze, checkAndRepairStreak, getStreakStatus, isAtRisk, nextMilestone, milestoneProgress, hoursLeftToday } from "./streak";

const KEY = "wordyfy_streak_v2";
const load = (): StreakData => { try { const r = typeof window !== "undefined" && localStorage.getItem(KEY); return r ? JSON.parse(r) : createStreak(); } catch { return createStreak(); } };
const save = (d: StreakData) => { if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(d)); };

export interface UseStreakReturn {
  streak: StreakData; status: StreakStatus; atRisk: boolean; hoursLeft: number;
  next: number | null; progressPct: number; pendingMilestone: number | null; loading: boolean;
  markComplete: () => { milestoneHit: number | null; freezeEarned: number };
  useFreeze: () => boolean;
  dismissMilestone: () => void;
}

export function useStreak(): UseStreakReturn {
  const [streak, setStreak] = useState<StreakData>(createStreak());
  const [loading, setLoading] = useState(true);
  const [pendingMilestone, setPendingMilestone] = useState<number | null>(null);

  useEffect(() => {
    const d = checkAndRepairStreak(load());
    setStreak(d); save(d); setLoading(false);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setStreak((p) => { const r = checkAndRepairStreak(p); save(r); return r; }), 60000);
    return () => clearInterval(t);
  }, []);

  const markComplete = useCallback(() => {
    let result = { milestoneHit: null as number | null, freezeEarned: 0 };
    setStreak((p) => {
      const { updatedData, milestoneHit, streakFreezeEarned } = completeDay(p);
      result = { milestoneHit, freezeEarned: streakFreezeEarned };
      if (milestoneHit) setPendingMilestone(milestoneHit);
      save(updatedData); return updatedData;
    });
    return result;
  }, []);

  const useFreeze = useCallback(() => {
    let ok = false;
    setStreak((p) => { const u = applyFreeze(p); if (!u) return p; ok = true; save(u); return u; });
    return ok;
  }, []);

  const dismissMilestone = useCallback(() => setPendingMilestone(null), []);

  return {
    streak, loading, pendingMilestone, dismissMilestone,
    status: getStreakStatus(streak),
    atRisk: isAtRisk(streak),
    hoursLeft: hoursLeftToday(),
    next: nextMilestone(streak.current),
    progressPct: milestoneProgress(streak.current),
    markComplete, useFreeze,
  };
}
