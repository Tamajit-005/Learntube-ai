"use client";

import { HelpCircle } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import PageHeader from "@/components/PageHeader";
import QuizSection from "@/components/QuizSection";
import NoDataPrompt from "@/components/NoDataPrompt";

export default function QuizPage() {
  const { result, loading } = useAnalysis();

  if (loading) {
    return (
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={HelpCircle} title="Quiz" description="Test your understanding with MCQs" />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500">Generating quiz...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={HelpCircle} title="Quiz" description="Test your understanding with MCQs" />
        <NoDataPrompt section="Quiz" />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
      <PageHeader icon={HelpCircle} title="Quiz" description="Test your understanding with MCQs" />
      <QuizSection content={result.quizzes} />
    </div>
  );
}
