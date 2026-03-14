"use client";

import { SessionStats } from "./ReviewSession";

interface SessionCompleteProps {
  stats: SessionStats;
  upcoming: { date: string; count: number }[];
  onReviewMore: () => void;
  onGoToVault: () => void;
}

function fmtDur(s: number) {
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

export default function SessionComplete({ stats, upcoming, onReviewMore, onGoToVault }: SessionCompleteProps) {
  const accuracy = stats.total > 0 ? Math.round(((stats.good + stats.easy) / stats.total) * 100) : 0;
  const shareText = `WordyFy SRS — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}\n\n${stats.total} words reviewed · ${accuracy}% accuracy\n\n${Array(Math.round(accuracy / 10)).fill("🟩").join("")}${Array(10 - Math.round(accuracy / 10)).fill("⬜").join("")}\n\nBuilding vocabulary daily → wordyfy.com/vault`;

  return (
    <div className="max-w-[520px] mx-auto py-2 pb-8 flex flex-col gap-4">
      <div className="text-center py-6 pt-4">
        <div className="text-5xl mb-2">
          {accuracy === 100 ? "🎯" : accuracy >= 80 ? "🔥" : accuracy >= 60 ? "💪" : "📚"}
        </div>
        <h2 className="text-xl font-medium text-gray-900 m-0 mb-1">Session complete</h2>
        <p className="text-sm text-gray-600 m-0">
          {stats.total} cards · {fmtDur(stats.durationSeconds)}
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-6">
        <div className="relative w-[72px] h-[72px] shrink-0">
          <svg viewBox="0 0 72 72" width={72} height={72}>
            <circle cx="36" cy="36" r="30" fill="none" stroke="#e5e7eb" strokeWidth="5" />
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke={accuracy >= 80 ? "#10b981" : accuracy >= 60 ? "#3b82f6" : "#f59e0b"}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 30}
              strokeDashoffset={2 * Math.PI * 30 * (1 - accuracy / 100)}
              transform="rotate(-90 36 36)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-[15px] font-medium text-gray-900">
            {accuracy}%
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-2 gap-x-4">
          {(
            [
              ["Again", stats.again, "#ef4444"],
              ["Hard", stats.hard, "#f59e0b"],
              ["Good", stats.good, "#3b82f6"],
              ["Easy", stats.easy, "#10b981"],
            ] as const
          ).map(([label, val, color]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-sm text-gray-600">{label}</span>
              <span className="text-sm font-medium text-gray-900 ml-auto">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {upcoming.some((u) => u.count > 0) && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 px-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Upcoming reviews</p>
          <div className="flex gap-1.5 items-end">
            {upcoming.map((u) => {
              const max = Math.max(...upcoming.map((x) => x.count), 1);
              const h = Math.max(8, (u.count / max) * 48);
              return (
                <div key={u.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[11px] text-gray-500">{u.count || ""}</span>
                  <div
                    className="w-full rounded bg-purple-500/25"
                    style={{
                      height: u.count > 0 ? h : 8,
                      background: u.count > 0 ? "rgba(108,71,255,0.25)" : "#e5e7eb",
                    }}
                  />
                  <span className="text-[10px] text-gray-500">{fmtDate(u.date).split(" ")[0]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-4 px-5">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2.5">Share your progress</p>
        <div className="flex gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2.5 rounded-lg bg-green-500/10 border border-green-500/25 text-green-600 text-sm font-medium no-underline"
          >
            WhatsApp
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2.5 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 text-sm font-medium no-underline"
          >
            Post on X
          </a>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onGoToVault}
          className="flex-1 py-3 rounded-lg border border-gray-200 bg-white text-gray-900 text-sm font-medium cursor-pointer"
        >
          Back to vault
        </button>
        <button
          type="button"
          onClick={onReviewMore}
          className="flex-1 py-3 rounded-lg border-0 bg-[#6C47FF] text-white text-sm font-medium cursor-pointer"
        >
          Review more →
        </button>
      </div>
    </div>
  );
}
