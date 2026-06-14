"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  AlertTriangle,
  WifiOff,
  Clock,
  VideoOff,
  RefreshCw,
  Copy,
  Check,
  FolderOpen,
  Loader2,
} from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import VideoForm from "@/components/VideoForm";
import EmptyState from "@/components/EmptyState";
import AnimatedPage, { staggerContainer, staggerItem, fadeIn } from "@/components/AnimatedPage";

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
    title: "Session not found",
    hint: "It may have been trimmed (we keep the last 100).",
  },
  invalid_url: {
    icon: <VideoOff className="w-8 h-8" />,
    title: "Invalid URL",
    hint: "That doesn't look like a valid YouTube URL. Paste a link from youtube.com.",
  },
};

const SECTION_LINKS = [
  { label: "Notes", href: "/notes" },
  { label: "Quiz", href: "/quiz" },
  { label: "Flashcards", href: "/flashcards" },
  { label: "Interview", href: "/interview" },
  { label: "Timestamps", href: "/timestamps" },
  { label: "Formulas", href: "/formulas" },
];

export default function Home() {
  const {
    result,
    loading,
    error,
    sessionId,
    handleSubmit,
    restoreSession,
    clearError,
  } = useAnalysis();
  const [restoreId, setRestoreId] = useState("");
  const [copied, setCopied] = useState(false);

  const handleRestore = (e: React.FormEvent) => {
    e.preventDefault();
    if (restoreId.trim()) {
      restoreSession(restoreId.trim());
    }
  };

  const copySessionId = async () => {
    if (sessionId) {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <motion.div
            className="flex items-center gap-2 mb-6"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <GraduationCap className="w-7 h-7 text-violet-500" />
            <h1 className="text-xl font-bold">LearnTube AI</h1>
          </motion.div>
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
              variants={staggerItem}
              initial="hidden"
              animate="visible"
            >
              {ERROR_CONFIG[error.type]?.title || "Error"}
            </motion.h2>
            <motion.p
              className="text-sm text-gray-500 dark:text-gray-400 mb-2 max-w-sm mx-auto"
              variants={staggerItem}
              initial="hidden"
              animate="visible"
            >
              {error.message}
            </motion.p>
            <motion.p
              className="text-xs text-gray-400 dark:text-gray-500 mb-6"
              variants={staggerItem}
              initial="hidden"
              animate="visible"
            >
              {ERROR_CONFIG[error.type]?.hint ||
                "Try again with a different video."}
            </motion.p>
            <motion.button
              onClick={clearError}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/40 dark:text-violet-400 transition-colors"
              variants={staggerItem}
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
            <div className="max-w-sm mx-auto mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <RestoreForm
                restoreId={restoreId}
                setRestoreId={setRestoreId}
                onRestore={handleRestore}
                disabled={loading}
              />
            </div>
          </AnimatedPage>
        )}

        {/* Results area */}
        {result && (
          <AnimatedPage className="max-w-md mx-auto py-16 text-center">
            {!loading && (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500"
                  variants={staggerItem}
                >
                  <GraduationCap className="w-8 h-8" />
                </motion.div>
                <motion.h2 className="text-lg font-semibold mb-2" variants={staggerItem}>
                  Analysis complete!
                </motion.h2>
                <motion.p className="text-sm text-gray-500 dark:text-gray-400 mb-4" variants={staggerItem}>
                  Your study materials are ready. Use the navigation above to
                  explore each section.
                </motion.p>
              </motion.div>
            )}

            {/* Session id display */}
            {sessionId && (
              <motion.div
                className="mb-6 p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  Session ID (save this to restore later)
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded border border-gray-200 dark:border-gray-600 text-left truncate">
                    {sessionId}
                  </code>
                  <button
                    onClick={copySessionId}
                    className="shrink-0 p-2 rounded-lg text-sm font-medium text-violet-600 hover:text-violet-700 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/20 dark:hover:bg-violet-900/40 dark:text-violet-400 transition-colors"
                    title="Copy session ID"
                  >
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Section links with stagger */}
            <motion.div
              className="flex flex-wrap justify-center gap-2 mb-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {SECTION_LINKS.map((section) => (
                <motion.div key={section.label} variants={staggerItem}>
                  <Link
                    href={section.href}
                    className="inline-block px-4 py-2.5 rounded-lg text-sm font-medium bg-violet-50 text-violet-600 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-400 dark:hover:bg-violet-900/40 transition-colors"
                  >
                    {section.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Restore form */}
            {!loading && (
              <motion.div
                className="pt-6 border-t border-gray-200 dark:border-gray-800"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
              >
                <RestoreForm
                  restoreId={restoreId}
                  setRestoreId={setRestoreId}
                  onRestore={handleRestore}
                  disabled={loading}
                />
              </motion.div>
            )}
          </AnimatedPage>
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

function RestoreForm({
  restoreId,
  setRestoreId,
  onRestore,
  disabled,
}: {
  restoreId: string;
  setRestoreId: (v: string) => void;
  onRestore: (e: React.FormEvent) => void;
  disabled: boolean;
}) {
  return (
    <form onSubmit={onRestore} className="max-w-xs mx-auto">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Have a session ID? Paste it here to restore.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={restoreId}
          onChange={(e) => setRestoreId(e.target.value)}
          placeholder="Enter session id..."
          disabled={disabled}
          className="flex-1 min-w-0 px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !restoreId.trim()}
          className="px-4 py-2.5 rounded-lg text-sm font-medium bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Restore
        </button>
      </div>
    </form>
  );
}
