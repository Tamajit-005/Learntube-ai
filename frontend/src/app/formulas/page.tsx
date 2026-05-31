"use client";

import { FunctionSquare } from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import PageHeader from "@/components/PageHeader";
import FormulasSection from "@/components/FormulasSection";
import NoDataPrompt from "@/components/NoDataPrompt";

export default function FormulasPage() {
  const { result, loading } = useAnalysis();

  if (loading) {
    return (
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={FunctionSquare} title="Formulas & Key Syntax" description="Important formulas and code patterns" />
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4" />
          <p className="text-sm text-gray-500">Generating formulas...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <PageHeader icon={FunctionSquare} title="Formulas & Key Syntax" description="Important formulas and code patterns" />
        <NoDataPrompt section="Formulas" />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
      <PageHeader icon={FunctionSquare} title="Formulas & Key Syntax" description="Important formulas and code patterns" />
      <FormulasSection content={result.formulas} />
    </div>
  );
}
