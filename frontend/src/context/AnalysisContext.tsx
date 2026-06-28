"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { AnalysisResult, SessionRecord } from "@/types";
import type { ApiError } from "@/lib/api";
import { analyzeVideo } from "@/lib/api";
import { useAuth } from "./AuthContext";

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
  const { user, isLoading: authLoading } = useAuth();
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [previousResult, setPreviousResult] = useState<AnalysisResult | null>(null);
  const [viewingPrevious, setViewingPrevious] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const prevUserRef = useRef(user);

  // Restore guest session from localStorage once auth state is resolved,
  // or clear stale guest data if user is logged in.
  // Also detects login transitions to clear in-memory state.
  useEffect(() => {
    if (authLoading) return;

    const wasLoggedIn = prevUserRef.current !== null;
    const nowLoggedIn = user !== null;

    // Login transition: clear in-memory state + guest localStorage
    if (!wasLoggedIn && nowLoggedIn) {
      setCurrentResult(null);
      setPreviousResult(null);
      setViewingPrevious(false);
      saveToLS(LS_CURRENT, null);
      saveToLS(LS_PREVIOUS, null);
    }

    // Initial hydration (only runs once, before hydrated is true)
    if (!hydrated) {
      if (nowLoggedIn) {
        // Logged in — clear stale guest localStorage
        saveToLS(LS_CURRENT, null);
        saveToLS(LS_PREVIOUS, null);
      } else {
        // Guest — restore persisted session
        const current = loadFromLS(LS_CURRENT);
        if (current) setCurrentResult(current.result);
        const previous = loadFromLS(LS_PREVIOUS);
        if (previous) setPreviousResult(previous.result);
      }
      setHydrated(true);
    }

    prevUserRef.current = user;
  }, [user, authLoading, hydrated]);

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

      // Only persist to localStorage for guest users
      if (!user) {
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
  }, [currentResult, user, router]);

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
