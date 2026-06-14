"use client";

import { FunctionSquare, Loader2 } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import PageHeader from "@/components/PageHeader";
import FormulasSection from "@/components/FormulasSection";
import NoDataPrompt from "@/components/NoDataPrompt";
import AnimatedPage from "@/components/AnimatedPage";

export default function FormulasPage() {
  const { result, loading } = useAnalysis();

  if (loading) {
    return (
      <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={FunctionSquare} title="Formulas & Key Syntax" description="Important formulas and code patterns" />
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-4" />
          <p className="text-sm text-gray-500">Generating formulas...</p>
        </div>
      </AnimatedPage>
    );
  }

  if (!result) {
    return (
      <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={FunctionSquare} title="Formulas & Key Syntax" description="Important formulas and code patterns" />
        <NoDataPrompt section="Formulas" />
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
      <PageHeader icon={FunctionSquare} title="Formulas & Key Syntax" description="Important formulas and code patterns" />
      <FormulasSection content={result.formulas} />
    </AnimatedPage>
  );
}
