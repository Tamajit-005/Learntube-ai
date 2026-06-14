"use client";

import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { fadeIn } from "@/components/AnimatedPage";

interface FormulasSectionProps {
  content: string;
}

export default function FormulasSection({ content }: FormulasSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!content || content.trim() === "None" || content.trim() === "") return null;

  return (
    <motion.div className="card" variants={fadeIn} initial="hidden" animate="visible">
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <motion.div
        className="prose prose-sm dark:prose-invert max-w-none"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </motion.div>
    </motion.div>
  );
}
