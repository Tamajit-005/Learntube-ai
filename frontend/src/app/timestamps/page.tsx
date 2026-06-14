"use client";

import { Clock, Loader2 } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import PageHeader from "@/components/PageHeader";
import TimestampsSection from "@/components/TimestampsSection";
import NoDataPrompt from "@/components/NoDataPrompt";
import AnimatedPage from "@/components/AnimatedPage";

export default function TimestampsPage() {
  const { result, loading } = useAnalysis();

  if (loading) {
    return (
      <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={Clock} title="Timestamps" description="Video timeline with chapter summaries" />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
          <p className="text-sm text-gray-500">Generating timestamps...</p>
        </div>
      </AnimatedPage>
    );
  }

  if (!result) {
    return (
      <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={Clock} title="Timestamps" description="Video timeline with chapter summaries" />
        <NoDataPrompt section="Timestamps" />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
      <PageHeader icon={Clock} title="Timestamps" description="Video timeline with chapter summaries" />
      <TimestampsSection timestamps={result.timestamps} />
    </AnimatedPage>
  );
}
