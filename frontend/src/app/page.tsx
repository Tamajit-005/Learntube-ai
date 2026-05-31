"use client";

import { GraduationCap, AlertTriangle, WifiOff, Clock, VideoOff, RefreshCw } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import VideoForm from "@/components/VideoForm";
import EmptyState from "@/components/EmptyState";

const ERROR_CONFIG: Record<string, { icon: React.ReactNode; title: string; hint: string }> = {
  no_transcript: {
    icon: <VideoOff className="w-8 h-8" />,
    title: "No captions available",
    hint: "Try a video with closed captions enabled. Most educational and lecture videos have them.",
  },
  rate_limit: {
    icon: <Clock className="w-8 h-8" />,
    title: "Service busy",
    hint: "The AI service is temporarily rate-limited. Wait a moment and try again.",
  },
  network: {
    icon: <WifiOff className="w-8 h-8" />,
    title: "Connection error",
    hint: "Make sure the backend server is running on port 8000.",
  },
  server_error: {
    icon: <AlertTriangle className="w-8 h-8" />,
    title: "Something went wrong",
    hint: "Try a shorter or different video. If the problem persists, check the server logs.",
  },
};

export default function Home() {
  const { result, loading, error, handleSubmit, clearError } = useAnalysis();

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="w-7 h-7 text-violet-500" />
            <h1 className="text-xl font-bold">LearnTube AI</h1>
          </div>
          <VideoForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray-500">Fetching transcript and generating study materials...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="max-w-md mx-auto py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500">
              {ERROR_CONFIG[error.type]?.icon || <AlertTriangle className="w-8 h-8" />}
            </div>
            <h2 className="text-lg font-semibold mb-2">
              {ERROR_CONFIG[error.type]?.title || "Error"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 max-w-sm mx-auto">
              {error.message}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
              {ERROR_CONFIG[error.type]?.hint || "Try again with a different video."}
            </p>
            <button
              onClick={clearError}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/40 dark:text-violet-400 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try another video
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !result && !error && <EmptyState />}

        {/* Success - show link to sections */}
        {result && !loading && (
          <div className="max-w-md mx-auto py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500">
              <GraduationCap className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Analysis complete!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Your study materials are ready. Use the navigation above to explore each section.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Notes", "Quiz", "Flashcards", "Interview", "Timestamps", "Formulas"].map((section) => (
                <a
                  key={section}
                  href={`/${section.toLowerCase()}`}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/40 transition-colors"
                >
                  {section}
                </a>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-4">
        <p className="text-xs text-center text-gray-400">
          Powered by Groq &middot; LearnTube AI
        </p>
      </footer>
    </div>
  );
}
