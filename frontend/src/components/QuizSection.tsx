"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { staggerContainer, staggerItem } from "@/components/AnimatedPage";
import type { QuizQuestion } from "@/types";

interface QuizSectionProps {
  content: string | { questions: QuizQuestion[] };
}

function parseMCQs(text: string): QuizQuestion[] {
  const mcqs: QuizQuestion[] = [];
  const blocks = text.split(/\*\*\d+\./).slice(1);

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;

    const question = lines[0].replace(/^\*{0,2}/, "").replace(/\*{0,2}$/, "").trim();
    const options: string[] = [];
    let correctIndex = -1;

    // Pass 1: collect options (skip lines with "correct answer" to avoid false matches)
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      if (/correct\s*answer/i.test(line)) continue;

      // Single-line: "A. text" or "A) text"
      const optMatch = line.match(/^([A-Da-d])\.\s*(.*)/) || line.match(/^([A-Da-d])\)\s*(.*)/);
      if (optMatch && optMatch[2]) {
        options.push(optMatch[2]);
        continue;
      }

      // Multi-line: letter on its own line, text on the next
      if (optMatch && !optMatch[2] && li + 1 < lines.length) {
        const next = lines[li + 1];
        if (!/^[A-Da-d][\.\)]?\s/.test(next) && !/correct\s*answer/i.test(next)) {
          options.push(next);
          li++; // skip the text line we just consumed
          continue;
        }
      }

      // Single letter alone on line: "A" followed by text on next line
      const letterOnly = line.match(/^([A-Da-d])$/);
      if (letterOnly && li + 1 < lines.length) {
        const next = lines[li + 1];
        if (!/^[A-Da-d][\.\)]?\s/.test(next) && !/correct\s*answer/i.test(next)) {
          options.push(next);
          li++;
        }
      }
    }

    // Pass 2: find correct answer from dedicated answer lines only
    if (options.length > 0) {
      const answerLine = lines.find((l) => /^\*{0,2}\s*(?:correct\s*)?answer/i.test(l));
      if (answerLine) {
        const letterMatch = answerLine.match(/\(?([A-Da-d])\)?/);
        if (letterMatch) {
          correctIndex = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
        } else {
          // Fallback: match answer text against option texts
          const answerText = answerLine.replace(/correct\s*answer.*?:\s*/i, "").trim().toLowerCase();
          correctIndex = options.findIndex((opt) => {
            const clean = opt.replace(/^([A-D])\.\s*/, "").replace(/^([A-D])\)\s*/, "").trim().toLowerCase();
            return answerText.includes(clean) || clean.includes(answerText);
          });
        }
      }
    }

    if (question && options.length > 0) {
      mcqs.push({ question, options, correctIndex });
    }
  }

  return mcqs;
}

export default function QuizSection({ content }: QuizSectionProps) {
  const [revealed, setRevealed] = useState<Record<number, number | null>>({});
  const mcqs = typeof content === "string" ? parseMCQs(content) : content.questions;

  if (mcqs.length === 0) return null;

  const handleOptionClick = (qIdx: number, oIdx: number) => {
    if (revealed[qIdx] !== undefined && revealed[qIdx] !== null) return;
    setRevealed((r) => ({ ...r, [qIdx]: oIdx }));
  };

  return (
    <div className="card">
      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {mcqs.map((mcq, qIdx) => {
          const qRevealed = revealed[qIdx] !== undefined && revealed[qIdx] !== null;
          return (
          <motion.div key={qIdx} variants={staggerItem}>
            <p className="font-medium text-sm mb-3">
              {qIdx + 1}. {mcq.question}
            </p>
            <div className="space-y-2">
              {mcq.options.map((option, oIdx) => {
                const isSelected = revealed[qIdx] === oIdx;
                const isCorrect = oIdx === mcq.correctIndex;

                let style = "border-gray-200 dark:border-gray-700 hover:border-violet-300 dark:hover:border-violet-600";
                if (qRevealed) {
                  if (isSelected && isCorrect) style = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
                  else if (isSelected && !isCorrect) style = "border-red-500 bg-red-50 dark:bg-red-900/20";
                  else if (isCorrect) style = "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10";
                }

                return (
                  <button
                    key={oIdx}
                    onClick={() => handleOptionClick(qIdx, oIdx)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all ${style} ${
                      qRevealed ? "cursor-default" : "cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-mono text-xs">
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span>{option.replace(/^([A-D])\.\s*/, "").replace(/^([A-D])\)\s*/, "")}</span>
                      {qRevealed && isSelected && isCorrect && (
                        <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto shrink-0" />
                      )}
                      {qRevealed && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-red-500 ml-auto shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            {qRevealed && mcq.correctIndex >= 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                Correct answer: {String.fromCharCode(65 + mcq.correctIndex)}) {mcq.options[mcq.correctIndex]}
              </p>
            )}
          </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
