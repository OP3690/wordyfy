'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Flame, X, Share2 } from 'lucide-react';

const MILESTONES = [7, 14, 30, 50, 100];

export function StreakBadge({
  streak,
  lastQuizDate,
  atRisk = false,
  className = '',
}: {
  streak: number;
  lastQuizDate: string | null;
  atRisk?: boolean;
  className?: string;
}) {
  const today = new Date().toDateString();
  const practicedToday = lastQuizDate ? new Date(lastQuizDate).toDateString() === today : false;
  const showAtRisk = streak > 0 && !practicedToday && atRisk;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-sm ${
        showAtRisk
          ? 'bg-red-100 text-red-700 animate-pulse'
          : streak > 0
          ? 'bg-amber-100 text-amber-800'
          : 'bg-gray-100 text-gray-600'
      } ${className}`}
      title={showAtRisk ? 'Practice today to keep your streak!' : `${streak} day streak`}
    >
      <Flame className={`h-4 w-4 ${showAtRisk ? 'text-red-600' : 'text-amber-600'}`} />
      <span>{streak}</span>
      <span className="text-xs font-medium opacity-80">day{streak !== 1 ? 's' : ''}</span>
    </div>
  );
}

export function PushNotificationPrompt({
  onDismiss,
  onEnable,
  className = '',
}: {
  onDismiss: () => void;
  onEnable: () => void;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className={`p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-start justify-between gap-3 ${className}`}>
      <div>
        <p className="text-sm font-medium text-gray-900">Don&apos;t miss a day</p>
        <p className="text-xs text-gray-600 mt-0.5">Get a reminder to practice and protect your streak.</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => {
            onEnable();
            setVisible(false);
          }}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
        >
          Enable
        </button>
        <button type="button" onClick={() => { onDismiss(); setVisible(false); }} className="p-1 text-gray-400 hover:text-gray-600 rounded" aria-label="Dismiss">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function StreakMilestoneModal({
  streak,
  onClose,
  siteName = 'Wordyfy',
}: {
  streak: number;
  onClose: () => void;
  siteName?: string;
}) {
  const message = `${streak} day vocabulary streak on ${siteName}! 🔥 Build your word power with quizzes and Hindi meanings.`;
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : 'https://wordyfy.com';
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + shareUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(shareUrl)}`;

  const copyShare = () => {
    const text = message + '\n' + shareUrl;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="milestone-title">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Flame className="h-8 w-8 text-amber-600" />
        </div>
        <h2 id="milestone-title" className="text-xl font-bold text-gray-900 mb-2">{streak} Day Streak!</h2>
        <p className="text-gray-600 text-sm mb-6">Amazing progress. Share your milestone and motivate others.</p>
        <div className="space-y-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700"
          >
            <Share2 className="h-4 w-4" />
            Share on WhatsApp
          </a>
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-100 text-gray-800 rounded-xl text-sm font-medium hover:bg-gray-200"
          >
            Share on X
          </a>
          <button type="button" onClick={copyShare} className="w-full py-2.5 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-xl">
            Copy message
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2 text-gray-500 text-sm hover:text-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export function useStreakMilestone(currentStreak: number) {
  const [showMilestone, setShowMilestone] = useState<number | null>(null);
  const [seenMilestones, setSeenMilestones] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const s = localStorage.getItem('wordyfy_seen_milestones');
      return s ? new Set(JSON.parse(s)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (currentStreak < 1) return;
    if (!MILESTONES.includes(currentStreak)) return;
    if (seenMilestones.has(currentStreak)) return;
    setShowMilestone(currentStreak);
    setSeenMilestones((prev) => {
      const next = new Set(prev);
      next.add(currentStreak);
      try {
        localStorage.setItem('wordyfy_seen_milestones', JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, [currentStreak, seenMilestones]);

  return { showMilestone, dismissMilestone: () => setShowMilestone(null) };
}
