"use client";

import { HelpCircle, Loader2 } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import PageHeader from "@/components/PageHeader";
import QuizSection from "@/components/QuizSection";
import NoDataPrompt from "@/components/NoDataPrompt";
import AnimatedPage from "@/components/AnimatedPage";

export default function QuizPage() {
  const { result, loading } = useAnalysis();

  if (loading && !result) {
    return (
      <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={HelpCircle} title="Quiz" description="Test your understanding with MCQs" />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
          <p className="text-sm text-gray-500">Generating quiz...</p>
        </div>
      </AnimatedPage>
    );
  }

  if (!result) {
    return (
      <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={HelpCircle} title="Quiz" description="Test your understanding with MCQs" />
        <NoDataPrompt section="Quiz" />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
      <PageHeader icon={HelpCircle} title="Quiz" description="Test your understanding with MCQs" />
      <QuizSection content={result.quizzes} />
    </AnimatedPage>
  );
}
