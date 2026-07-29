"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, ListTree, BookOpen } from "lucide-react";
import { staggerContainer, staggerItem } from "@/components/AnimatedPage";

interface NotesSectionProps {
  content: string;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

interface Section {
  id: string;
  heading: string;
  body: string;
}

function parseSections(text: string): Section[] {
  const sections: Section[] = [];
  // Split by **Heading** on its own line (captures heading text)
  const parts = text.split(/\n?\*{2}(.+?)\*{2}\s*(?:\n|$)/);
  const seen = new Map<string, number>();

  if (!parts || parts.length === 0) return [];

  // parts[0] = content before first heading
  if (parts[0]?.trim()) {
    sections.push({ id: "intro", heading: "", body: parts[0].trim() });
  }

  for (let i = 1; i < parts.length - 1; i += 2) {
    const heading = parts[i]?.trim();
    const body = parts[i + 1]?.trim() || "";
    if (heading) {
      const base = slugify(heading);
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      const id = count > 0 ? `${base}-${count}` : base;
      sections.push({ id, heading, body });
    }
  }

  return sections;
}

export default function NotesSection({ content }: NotesSectionProps) {
  const [copied, setCopied] = useState(false);
  const [showToc, setShowToc] = useState(false);

  const sections = useMemo(() => parseSections(content), [content]);
  const wordCount = useMemo(() => content.split(/\s+/).length, [content]);
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      {/* Header controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {wordCount} words &middot; {readingTime} min read
          </span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          {sections.filter((s) => s.heading).length > 0 && (
            <button
              onClick={() => setShowToc(!showToc)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                showToc
                  ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            >
              <ListTree className="w-3.5 h-3.5" />
              Sections
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Mobile word count */}
      <div className="sm:hidden flex items-center gap-1.5 text-xs text-gray-400 mb-3">
        <BookOpen className="w-3 h-3" />
        {wordCount} words &middot; {readingTime} min read
      </div>

      {/* Table of Contents */}
      {showToc && (
        <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Sections</p>
          <nav className="space-y-0.5">
            {sections.filter((s) => s.heading).map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setShowToc(false);
                  document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                }}
                className="block text-sm py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                {s.heading}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Sections */}
      <motion.div
        className="space-y-5"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {sections.map((s) => (
          <motion.div key={s.id} variants={staggerItem}>
            {s.heading && (
              <h2
                id={s.id}
                className="scroll-mt-20 text-base font-semibold border-b border-gray-200 dark:border-gray-700 pb-2 mb-3 mt-1 flex items-center gap-2 group"
              >
                {s.heading}
                <a
                  href={`#${s.id}`}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-violet-500 transition-opacity no-underline text-sm"
                >
                  #
                </a>
              </h2>
            )}
            <div className="prose prose-sm dark:prose-invert max-w-none overflow-x-hidden
              prose-strong:text-violet-700 dark:prose-strong:text-violet-400
              prose-code:text-xs prose-code:bg-gray-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-gray-100 dark:prose-pre:bg-slate-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700 prose-pre:overflow-x-auto prose-pre:whitespace-pre-wrap prose-pre:break-words
              prose-li:marker:text-gray-400
              prose-hr:border-gray-200 dark:prose-hr:border-gray-700
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{s.body}</ReactMarkdown>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
