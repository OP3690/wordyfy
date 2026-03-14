"use client";
import React, { createContext, useContext } from "react";
import { useStreak, UseStreakReturn } from "@/lib/useStreak";
import MilestoneModal from "@/components/MilestoneModal";

const Ctx = createContext<UseStreakReturn | null>(null);

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const hook = useStreak();
  return (
    <Ctx.Provider value={hook}>
      {children}
      {hook.pendingMilestone != null && (
        <MilestoneModal milestone={hook.pendingMilestone} currentStreak={hook.streak.current} onDismiss={hook.dismissMilestone} />
      )}
    </Ctx.Provider>
  );
}

export function useStreakContext(): UseStreakReturn {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Must be inside <StreakProvider>");
  return ctx;
}
