"use client";

import { Layers, Loader2 } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import PageHeader from "@/components/PageHeader";
import FlashCardsSection from "@/components/FlashcardsSection";
import NoDataPrompt from "@/components/NoDataPrompt";
import AnimatedPage from "@/components/AnimatedPage";

export default function FlashcardsPage() {
  const { result, loading } = useAnalysis();

  if (loading && !result) {
    return (
      <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={Layers} title="Flashcards" description="Flip through key concepts" />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
          <p className="text-sm text-gray-500">Generating flashcards...</p>
        </div>
      </AnimatedPage>
    );
  }

  if (!result) {
    return (
      <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={Layers} title="Flashcards" description="Flip through key concepts" />
        <NoDataPrompt section="Flashcards" />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
      <PageHeader icon={Layers} title="Flashcards" description="Flip through key concepts" />
      <FlashCardsSection content={result.flashcards} />
    </AnimatedPage>
  );
}
