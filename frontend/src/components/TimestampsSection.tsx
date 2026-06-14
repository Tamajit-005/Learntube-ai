"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import type { Timestamp } from "@/types";
import { staggerContainer, staggerItem } from "@/components/AnimatedPage";

interface TimestampsSectionProps {
  timestamps: Timestamp[];
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const mm = h > 0 ? m.toString().padStart(2, "0") : m.toString();
  const ss = s.toString().padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

export default function TimestampsSection({ timestamps }: TimestampsSectionProps) {
  if (!timestamps || timestamps.length === 0) return null;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-violet-500" />
        <h2 className="text-lg font-semibold">Timestamps</h2>
      </div>

      <motion.div
        className="space-y-1"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {timestamps.map((t, i) => (
          <motion.div
            key={i}
            variants={staggerItem}
            className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <span className="shrink-0 font-mono text-xs text-violet-500 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded mt-0.5">
              {formatTime(t.timestamp)}
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t.summary}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
