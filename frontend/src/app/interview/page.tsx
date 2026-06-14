"use client";

import { Briefcase, Loader2 } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import PageHeader from "@/components/PageHeader";
import InterviewSection from "@/components/InterviewSection";
import NoDataPrompt from "@/components/NoDataPrompt";
import AnimatedPage from "@/components/AnimatedPage";

export default function InterviewPage() {
  const { result, loading } = useAnalysis();

  if (loading) {
    return (
      <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={Briefcase} title="Interview Questions" description="Practice questions by difficulty level" />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
          <p className="text-sm text-gray-500">Generating interview questions...</p>
        </div>
      </AnimatedPage>
    );
  }

  if (!result) {
    return (
      <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={Briefcase} title="Interview Questions" description="Practice questions by difficulty level" />
        <NoDataPrompt section="Interview Questions" />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
      <PageHeader icon={Briefcase} title="Interview Questions" description="Practice questions by difficulty level" />
      <InterviewSection content={result.interview_questions} />
    </AnimatedPage>
  );
}
