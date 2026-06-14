"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { AnalysisResult } from "@/types";
import type { ApiError } from "@/lib/api";
import { analyzeVideo, getCurrentHistory, getPreviousHistory } from "@/lib/api";

interface AnalysisContextValue {
  result: AnalysisResult | null;
  currentResult: AnalysisResult | null;
  previousResult: AnalysisResult | null;
  viewingPrevious: boolean;
  hasPrevious: boolean;
  loading: boolean;
  error: ApiError | null;
  handleSubmit: (url: string) => Promise<void>;
  toggleHistory: () => Promise<void>;
  clearSession: () => void;
  clearError: () => void;
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null);

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used within AnalysisProvider");
  return ctx;
}

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [previousResult, setPreviousResult] = useState<AnalysisResult | null>(null);
  const [viewingPrevious, setViewingPrevious] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Exposed result is whichever we're viewing
  const result = viewingPrevious ? previousResult : currentResult;
  const hasPrevious = previousResult !== null;

  const handleSubmit = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    setViewingPrevious(false);

    const prevCurrent = currentResult;
    setCurrentResult(null);

    try {
      const response = await analyzeVideo(url);
      setCurrentResult(response.result);
      // Old current becomes previous — mirrors backend save_last() behavior
      if (prevCurrent) {
        setPreviousResult(prevCurrent);
      }
      toast.success("Analysis complete!");
      router.push("/notes");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr);
      toast.error(apiErr.message);
    } finally {
      setLoading(false);
    }
  }, [currentResult]);

  const toggleHistory = useCallback(async () => {
    if (viewingPrevious) {
      // Switch back to current — no fetch needed
      setViewingPrevious(false);
      return;
    }

    // Switching to previous — fetch it from backend
    setLoading(true);
    setError(null);

    try {
      const record = await getPreviousHistory();
      setPreviousResult(record.result);
      setViewingPrevious(true);
      toast.success("Showing previous session");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr);
      if (apiErr.type !== "not_found") {
        toast.error(apiErr.message);
      }
    } finally {
      setLoading(false);
    }
  }, [viewingPrevious]);

  const clearSession = useCallback(() => {
    setCurrentResult(null);
    setPreviousResult(null);
    setError(null);
    setViewingPrevious(false);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AnalysisContext.Provider
      value={{
        result, currentResult, previousResult,
        viewingPrevious, hasPrevious,
        loading, error,
        handleSubmit, toggleHistory, clearSession, clearError,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}
