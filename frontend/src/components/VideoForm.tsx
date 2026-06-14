"use client";

import { useState } from "react";
import { Search, Loader2, AlertCircle } from "lucide-react";

interface VideoFormProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

const YOUTUBE_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;

export default function VideoForm({ onSubmit, loading }: VideoFormProps) {
  const [url, setUrl] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) return;

    if (!YOUTUBE_REGEX.test(trimmed)) {
      setValidationError("Please enter a valid YouTube URL (youtube.com or youtu.be)");
      return;
    }

    setValidationError("");
    onSubmit(trimmed);
  };

  const handleChange = (value: string) => {
    setUrl(value);
    if (validationError) setValidationError("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={url}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="https://youtube.com/watch?v=... or https://youtu.be/..."
            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-white dark:bg-slate-800 ${
              validationError
                ? "border-red-400 dark:border-red-500 focus:ring-red-500"
                : "border-gray-200 dark:border-gray-700 focus:ring-violet-500"
            }`}
            disabled={loading}
          />
          {validationError && (
            <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1.5 ml-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {validationError}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze"
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-2 ml-1">
        Works with YouTube videos that have captions enabled (most educational and lecture videos).
      </p>
    </form>
  );
}
