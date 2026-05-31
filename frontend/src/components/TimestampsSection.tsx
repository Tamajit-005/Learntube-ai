"use client";

import { Clock } from "lucide-react";
import type { Timestamp } from "@/types";

interface TimestampsSectionProps {
  timestamps: Timestamp[];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TimestampsSection({ timestamps }: TimestampsSectionProps) {
  if (!timestamps || timestamps.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-violet-500" />
        <h2 className="text-lg font-semibold">Timestamps</h2>
      </div>

      <div className="space-y-1">
        {timestamps.map((t, i) => (
          <div
            key={i}
            className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="shrink-0 font-mono text-xs text-violet-500 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded mt-0.5">
              {formatTime(t.timestamp)}
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
