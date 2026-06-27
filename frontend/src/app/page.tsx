"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  WifiOff,
  Clock,
  VideoOff,
  RefreshCw,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import VideoForm from "@/components/VideoForm";
import EmptyState from "@/components/EmptyState";
import AnimatedPage, { fadeIn } from "@/components/AnimatedPage";

const ERROR_CONFIG: Record<
  string,
  { icon: React.ReactNode; title: string; hint: string }
> = {
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
    hint: "Try a shorter or different video.",
  },
  not_found: {
    icon: <FolderOpen className="w-8 h-8" />,
    title: "No history found",
    hint: "Analyze a video first to create a session.",
  },
  invalid_url: {
    icon: <VideoOff className="w-8 h-8" />,
    title: "Invalid URL",
    hint: "That doesn't look like a valid YouTube URL. Paste a link from youtube.com.",
  },
};

export default function Home() {
  const { result, loading, error, handleSubmit, clearError } = useAnalysis();

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <VideoForm onSubmit={handleSubmit} loading={loading} />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {/* Loading */}
        {loading && (
          <AnimatedPage className="flex flex-col items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mb-4"
            >
              <Loader2 className="w-8 h-8 text-violet-500" />
            </motion.div>
            <motion.p
              className="text-sm text-gray-500"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              Generating your study materials...
            </motion.p>
          </AnimatedPage>
        )}

        {/* Error */}
        {error && !loading && (
          <AnimatedPage className="max-w-md mx-auto py-16 text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {ERROR_CONFIG[error.type]?.icon || (
                <AlertTriangle className="w-8 h-8" />
              )}
            </motion.div>
            <motion.h2
              className="text-lg font-semibold mb-2"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              {ERROR_CONFIG[error.type]?.title || "Error"}
            </motion.h2>
            <motion.p
              className="text-sm text-gray-500 dark:text-gray-400 mb-2 max-w-sm mx-auto"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              {error.message}
            </motion.p>
            <motion.p
              className="text-xs text-gray-400 dark:text-gray-500 mb-6"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
            >
              {ERROR_CONFIG[error.type]?.hint ||
                "Try again with a different video."}
            </motion.p>
            <motion.button
              onClick={clearError}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/40 dark:text-violet-400 transition-colors"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-4 h-4" />
              Try another video
            </motion.button>
          </AnimatedPage>
        )}

        {/* Empty (no loading, no result, no error) */}
        {!loading && !result && !error && (
          <AnimatedPage>
            <EmptyState />
          </AnimatedPage>
        )}

        {/* Result — page redirects to /notes on completion, this is a fallback */}
        {result && (
          <AnimatedPage className="max-w-md mx-auto py-16 text-center">
            {!loading && (
              <motion.p
                className="text-sm text-gray-400"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
              >
                Analysis complete. Redirecting to study materials...
              </motion.p>
            )}
          </AnimatedPage>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-4">
        <p className="text-xs text-center text-gray-400">LearnTube AI</p>
      </footer>
    </div>
  );
}
