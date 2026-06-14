"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import toast from "react-hot-toast";
import type { AnalysisResult } from "@/types";
import type { ApiError } from "@/lib/api";
import { analyzeVideo, getSession } from "@/lib/api";

interface AnalysisContextValue {
  result: AnalysisResult | null;
  loading: boolean;
  error: ApiError | null;
  sessionId: string | null;
  handleSubmit: (url: string) => Promise<void>;
  restoreSession: (id: string) => Promise<void>;
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
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const handleSubmit = useCallback(async (url: string) => {
    setLoading(true);
    setResult(null);
    setError(null);
    setSessionId(null);

    try {
      const response = await analyzeVideo(url);
      setResult(response.result);
      setSessionId(response.session_id);
      toast.success("Analysis complete!");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr);
      toast.error(apiErr.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreSession = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const record = await getSession(id);
      setResult(record.result);
      setSessionId(record.id);
      toast.success("Session restored!");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr);
      if (apiErr.type !== "not_found") {
        toast.error(apiErr.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSession = useCallback(() => {
    setResult(null);
    setError(null);
    setSessionId(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AnalysisContext.Provider
      value={{
        result, loading, error,
        sessionId,
        handleSubmit, restoreSession, clearSession, clearError,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}
