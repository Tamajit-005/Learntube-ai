"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lightbulb, Target, Star } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { staggerContainer, staggerItem } from "@/components/AnimatedPage";
import type { InterviewSection as InterviewSectionType } from "@/types";

interface InterviewSectionProps {
  content: string | { sections: InterviewSectionType[] };
}

const LEVEL_ICONS: Record<string, React.ReactNode> = {
  Beginner: <Lightbulb className="w-4 h-4" />,
  Intermediate: <Target className="w-4 h-4" />,
  Advanced: <Star className="w-4 h-4" />,
};

const LEVEL_BADGE: Record<string, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  Intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  Advanced: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800",
};

const LEVEL_TAB: Record<string, string> = {
  Beginner: "data-[active=true]:bg-emerald-100 data-[active=true]:text-emerald-700 data-[active=true]:dark:bg-emerald-900/40 data-[active=true]:dark:text-emerald-400 data-[active=true]:border-emerald-300 data-[active=true]:dark:border-emerald-700",
  Intermediate: "data-[active=true]:bg-amber-100 data-[active=true]:text-amber-700 data-[active=true]:dark:bg-amber-900/40 data-[active=true]:dark:text-amber-400 data-[active=true]:border-amber-300 data-[active=true]:dark:border-amber-700",
  Advanced: "data-[active=true]:bg-rose-100 data-[active=true]:text-rose-700 data-[active=true]:dark:bg-rose-900/40 data-[active=true]:dark:text-rose-400 data-[active=true]:border-rose-300 data-[active=true]:dark:border-rose-700",
};

function normalizeLevel(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

interface ParsedQuestion {
  question: string;
  description: string;
}

interface ParsedSection {
  level: string;
  intro: string;
  questions: ParsedQuestion[];
}

function parseInterviewContent(text: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = text.split("\n");

  let currentLevel = "";
  let currentIntro = "";
  const currentQuestions: ParsedQuestion[] = [];
  let buffer: string[] = [];
  let inAnswersSection = false;

  function flushSection() {
    if (!currentLevel) return;
    if (buffer.length > 0 && currentQuestions.length > 0) {
      currentQuestions[currentQuestions.length - 1].description = buffer.join(" ").trim();
    }
    buffer = [];
    sections.push({ level: currentLevel, intro: currentIntro.trim(), questions: [...currentQuestions] });
    currentQuestions.length = 0;
    currentIntro = "";
  }

  function flushDescription() {
    if (buffer.length > 0 && currentQuestions.length > 0) {
      currentQuestions[currentQuestions.length - 1].description = buffer.join(" ").trim();
    }
    buffer = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Detect level heading: "**Beginner:**", "### Advanced", "Beginner-Level", etc.
    const levelMatch = trimmed.match(/^\*{0,3}\s*(Beginner|Intermediate|Advanced)/i);
    if (levelMatch) {
      const normalized = normalizeLevel(levelMatch[1]);
      // Only start new section if it's a different level or we're already in one
      if (normalized !== currentLevel) {
        flushSection();
        currentLevel = normalized;
        inAnswersSection = false;
        continue;
      }
    }

    // Skip answer section headings ("Example Answers", "Answers", "Sample Solutions", etc.)
    if (/^\*{0,2}\s*(example\s+)?answers?|sample\s+(answers?|solutions?)/i.test(trimmed) && currentQuestions.length > 0) {
      inAnswersSection = true;
      continue;
    }

    // In answer section, map numbered items to previous questions by index
    if (inAnswersSection) {
      const numMatch = trimmed.match(/^(\d+)[\.\)]\s+(.*)/);
      if (numMatch) {
        const idx = parseInt(numMatch[1]) - 1;
        if (idx >= 0 && idx < currentQuestions.length && !currentQuestions[idx].description) {
          currentQuestions[idx].description = numMatch[2];
        }
        continue;
      }
    }

    // Bold text = question
    if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
      flushDescription();
      currentQuestions.push({ question: trimmed.replace(/^\*{1,2}\s*|\s*\*{1,2}$/g, ""), description: "" });
    } else if (/^\d+[\.\)]\s+/.test(trimmed)) {
      // Numbered line = question
      flushDescription();
      currentQuestions.push({ question: trimmed.replace(/^\d+[\.\)]\s+/, "").trim(), description: "" });
    } else if (currentQuestions.length > 0) {
      buffer.push(trimmed);
    } else {
      currentIntro += (currentIntro ? " " : "") + trimmed;
    }
  }

  flushSection();

  // Merge sections with the same level (AI sometimes repeats level headings)
  const merged = new Map<string, ParsedSection>();
  for (const s of sections) {
    const existing = merged.get(s.level);
    if (existing) {
      existing.questions.push(...s.questions);
      if (!existing.intro && s.intro) existing.intro = s.intro;
    } else {
      merged.set(s.level, { ...s, questions: [...s.questions] });
    }
  }
  return Array.from(merged.values());
}

export default function InterviewSection({ content }: InterviewSectionProps) {
  const [activeLevel, setActiveLevel] = useState<string>("Beginner");
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const isStructured = typeof content !== "string";
  const sections = useMemo(
    () => (isStructured ? content.sections : parseInterviewContent(content)),
    [content, isStructured],
  );

  const rawText = isStructured ? "" : content;

  if (sections.length === 0 && rawText.trim()) {
    // Format raw content into proper markdown
    const formatted = rawText
      .split("\n")
      .map((line: string) => {
        const t = line.trim();
        if (!t) return "";
        // Level headings (with or without ** markers)
        if (/^(\*{0,3}\s*)?(beginner|intermediate|advanced)/i.test(t) && !t.startsWith("**") && t.length < 60)
          return `**${t.replace(/^\*{0,3}\s*/, "")}**`;
        // Already has bold markers — pass through
        if (t.startsWith("**") && t.endsWith("**")) return t;
        // Numbered question -> bullet
        if (/^\d+[\.\)]\s+/.test(t)) return `- ${t.replace(/^\d+[\.\)]\s+/, "").trim()}`;
        // Lines with ":" describing what a question assesses -> italic hint
        if (/^(this question|expected answer|common problems)/i.test(t)) return `*${t}*`;
        // Scenario/technical prefixes
        if (/^(some possible|imagine|suppose|given|scenario)/i.test(t)) return `> ${t}`;
        return t;
      })
      .filter(Boolean)
      .join("\n\n");

    return (
      <div className="card">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{formatted}</ReactMarkdown>
        </div>
      </div>
    );
  }

  const activeSection = sections.find((s) => s.level === activeLevel) || sections[0];

  const toggleQuestion = (idx: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const allExpanded = expandedQuestions.size === activeSection.questions.length;
  const toggleAll = () => {
    if (allExpanded) setExpandedQuestions(new Set());
    else setExpandedQuestions(new Set(activeSection.questions.map((_, i) => i)));
  };

  return (
    <div className="card">
      {/* Level Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {sections.map((section) => (
          <button
            key={section.level}
            data-active={activeLevel === section.level}
            onClick={() => {
              setActiveLevel(section.level);
              setExpandedQuestions(new Set());
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all
              border-gray-200 dark:border-gray-700
              text-gray-600 dark:text-gray-400
              hover:bg-gray-50 dark:hover:bg-slate-800
              ${LEVEL_TAB[section.level] || ""}
              ${activeLevel === section.level ? "shadow-sm" : ""}`}
          >
            {LEVEL_ICONS[section.level]}
            {section.level}
            <span className="text-xs opacity-60 ml-0.5">({section.questions.length})</span>
          </button>
        ))}
      </div>

      {/* Section Intro */}
      {activeSection.intro && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 italic leading-relaxed">
          {activeSection.intro}
        </p>
      )}

      {/* Expand/Collapse All */}
      {activeSection.questions.length > 1 && activeSection.questions.some((q) => q.description) && (
        <button
          onClick={toggleAll}
          className="text-xs text-violet-500 hover:text-violet-700 dark:hover:text-violet-400 mb-3 transition-colors"
        >
          {allExpanded ? "Collapse all" : "Expand all"}
        </button>
      )}

      {/* Questions */}
      <motion.div
        className="space-y-3"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {activeSection.questions.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            No interview questions available for this level.
          </p>
        )}
        {activeSection.questions.map((q, i) => {
          // No answer — render as plain item without expand/collapse
          if (!q.description) {
            return (
              <motion.div
                key={i}
                variants={staggerItem}
                className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5"
              >
                <div className="flex items-start gap-3">
                  <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border ${LEVEL_BADGE[activeLevel]}`}>
                    {i + 1}
                  </span>
                  <p className="text-sm font-medium leading-snug flex-1 min-w-0">{q.question}</p>
                </div>
              </motion.div>
            );
          }

          // Has answer — show expand/collapse
          const isExpanded = expandedQuestions.has(i);
          return (
            <motion.div
              key={i}
              variants={staggerItem}
              className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden transition-all hover:border-gray-300 dark:hover:border-gray-600"
            >
              <button
                onClick={() => toggleQuestion(i)}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-slate-800/50"
              >
                <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold border ${LEVEL_BADGE[activeLevel]}`}>
                  {isExpanded ? "−" : "+"}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-snug">{q.question}</p>
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.p
                        className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed overflow-hidden"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        {q.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <motion.span
                  className="shrink-0 mt-0.5 text-gray-400"
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.span>
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
