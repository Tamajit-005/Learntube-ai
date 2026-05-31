"use client";

import Link from "next/link";
import { ArrowLeft, Play } from "lucide-react";

interface NoDataPromptProps {
  section: string;
}

export default function NoDataPrompt({ section }: NoDataPromptProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-6">
        <Play className="w-8 h-8 text-gray-400" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No {section} yet</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
        Analyze a YouTube video first to generate {section.toLowerCase()}.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Go to Home
      </Link>
    </div>
  );
}
