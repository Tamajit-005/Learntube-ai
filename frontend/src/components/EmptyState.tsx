"use client";

import { Play } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6">
        <Play className="w-8 h-8 text-violet-500" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Analyze any YouTube video</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md">
        Paste a YouTube URL above to get AI-generated notes, flashcards, quizzes,
        interview questions, timestamps, and key formulas from any educational video.
      </p>
    </div>
  );
}
