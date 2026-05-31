"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import toast from "react-hot-toast";
import type { AnalysisResult } from "@/types";
import type { ApiError } from "@/lib/api";
import { analyzeVideo } from "@/lib/api";

interface AnalysisContextValue {
  result: AnalysisResult | null;
  loading: boolean;
  error: ApiError | null;
  handleSubmit: (url: string) => Promise<void>;
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

  const handleSubmit = useCallback(async (url: string) => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await analyzeVideo(url);
      setResult(data);
      toast.success("Analysis complete!");
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr);
      toast.error(apiErr.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AnalysisContext.Provider value={{ result, loading, error, handleSubmit, clearError }}>
      {children}
    </AnalysisContext.Provider>
  );
}
