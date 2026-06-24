"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { AnalysisResult, SessionRecord } from "@/types";
import type { ApiError } from "@/lib/api";
import { analyzeVideo } from "@/lib/api";

const LS_CURRENT = "learntube_current";
const LS_PREVIOUS = "learntube_previous";

function saveToLS(key: string, record: SessionRecord | null) {
  if (record === null) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, JSON.stringify(record));
  }
}

function loadFromLS(key: string): SessionRecord | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.url && parsed.result) return parsed;
    return null;
  } catch {
    return null;
  }
}

interface AnalysisContextValue {
  result: AnalysisResult | null;
  currentResult: AnalysisResult | null;
  previousResult: AnalysisResult | null;
  viewingPrevious: boolean;
  hasPrevious: boolean;
  loading: boolean;
  error: ApiError | null;
  handleSubmit: (url: string) => Promise<void>;
  toggleHistory: () => void;
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
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = loadFromLS(LS_CURRENT);
    return saved ? saved.result : null;
  });
  const [previousResult, setPreviousResult] = useState<AnalysisResult | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = loadFromLS(LS_PREVIOUS);
    return saved ? saved.result : null;
  });
  const [viewingPrevious, setViewingPrevious] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [hydrated, setHydrated] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setHydrated(true); }, []);

  // Exposed result is whichever we're viewing (null until hydrated to avoid SSR mismatch)
  const result = hydrated ? (viewingPrevious ? previousResult : currentResult) : null;
  const hasPrevious = hydrated ? previousResult !== null : false;

  const handleSubmit = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);
    setViewingPrevious(false);

    const prevCurrent = currentResult;
    setCurrentResult(null);

    try {
      const response = await analyzeVideo(url);
      setCurrentResult(response.result);

      // Persist to localStorage
      saveToLS(LS_CURRENT, {
        url,
        analyzed_at: new Date().toISOString(),
        result: response.result,
      });
      if (prevCurrent) {
        setPreviousResult(prevCurrent);
        saveToLS(LS_PREVIOUS, {
          url: "(previous)",
          analyzed_at: "",
          result: prevCurrent,
        });
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
  }, [currentResult, router]);

  const toggleHistory = useCallback(() => {
    if (viewingPrevious) {
      setViewingPrevious(false);
    } else {
      setViewingPrevious(true);
    }
  }, [viewingPrevious]);

  const clearSession = useCallback(() => {
    setCurrentResult(null);
    setPreviousResult(null);
    setError(null);
    setViewingPrevious(false);
    saveToLS(LS_CURRENT, null);
    saveToLS(LS_PREVIOUS, null);
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
