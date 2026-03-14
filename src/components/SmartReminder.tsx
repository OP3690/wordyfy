'use client';

import { useEffect, useRef } from 'react';

const REMINDER_TIME_KEY = 'wordyfy_reminder_time'; // "HH:mm" or null
const REMINDER_SHOWN_KEY = 'wordyfy_reminder_shown_date';

function getReminderTime(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REMINDER_TIME_KEY);
}

export function setReminderTime(time: string | null) {
  if (typeof window === 'undefined') return;
  if (time) localStorage.setItem(REMINDER_TIME_KEY, time);
  else localStorage.removeItem(REMINDER_TIME_KEY);
}

/**
 * Call when user has practiced today (quiz completed or word reviewed) so we don't remind.
 */
export function markPracticedToday() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REMINDER_SHOWN_KEY, new Date().toDateString());
}

/**
 * Smart push reminder: if user has enabled notifications, has a reminder time,
 * and hasn't practiced today, show one notification when they're on the app (after reminder time).
 */
export default function SmartReminder({
  hasPracticedToday,
  notificationPermission,
}: {
  hasPracticedToday: boolean;
  notificationPermission: NotificationPermission;
}) {
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (notificationPermission !== 'granted') return;
    if (hasPracticedToday) return;
    if (notifiedRef.current) return;

    const reminderTime = getReminderTime();
    if (!reminderTime) return;

    const [hours, minutes] = reminderTime.split(':').map(Number);
    const now = new Date();
    const reminderToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    if (now.getTime() < reminderToday.getTime()) return;

    const shown = localStorage.getItem(REMINDER_SHOWN_KEY);
    if (shown === now.toDateString()) return;

    notifiedRef.current = true;
    localStorage.setItem(REMINDER_SHOWN_KEY, now.toDateString());
    new Notification('WordyFy 🔥', {
      body: "Don't break your streak! Take a quick quiz or review a few words.",
      icon: '/puzzle_icon.png',
      tag: 'wordyfy-daily-reminder',
    });
  }, [hasPracticedToday, notificationPermission]);

  return null;
}
