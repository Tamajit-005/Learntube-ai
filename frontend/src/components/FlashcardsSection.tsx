"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface FlashCardsSectionProps {
  content: string;
}

function parseFlashcards(text: string): { question: string; answer: string }[] {
  const cards: { question: string; answer: string }[] = [];
  const clean = text.replace(/\*\*/g, "").trim();
  const lines = clean.split("\n").map((l) => l.trim()).filter(Boolean);

  let current: { question: string; answer: string } | null = null;

  for (const line of lines) {
    const qMatch = line.match(/^Q\d*[:\.\)]\s*(.*)/);
    const aMatch = line.match(/^A\d*[:\.\)]\s*(.*)/);

    if (qMatch) {
      if (current) cards.push(current);
      current = { question: qMatch[1].trim(), answer: "" };
    } else if (aMatch && current) {
      current.answer = aMatch[1].trim();
    } else if (current && current.answer) {
      current.answer += " " + line;
    } else if (current) {
      current.question += " " + line;
    }
  }

  if (current) cards.push(current);
  return cards;
}

export default function FlashCardsSection({ content }: FlashCardsSectionProps) {
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const cards = parseFlashcards(content);

  if (cards.length === 0) return null;

  const next = () => {
    setFlipped(false);
    setCurrent((c) => Math.min(c + 1, cards.length - 1));
  };

  const prev = () => {
    setFlipped(false);
    setCurrent((c) => Math.max(c - 1, 0));
  };

  return (
    <div className="card">
      <div className="flex items-center justify-end mb-4">
        <span className="text-xs text-gray-400">
          {current + 1} / {cards.length}
        </span>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="relative w-full h-48 cursor-pointer perspective-[1000px]"
      >
        <motion.div
          className="relative w-full h-full"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-violet-50 dark:bg-slate-700/50"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-center font-medium text-base">{cards[current].question}</p>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-emerald-50 dark:bg-slate-700/50"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-center text-sm">{cards[current].answer}</p>
          </div>
        </motion.div>
      </div>

      <p className="text-xs text-center text-gray-400 mt-2 mb-3">Click card to flip</p>

      <div className="flex justify-center gap-4">
        <motion.button
          onClick={prev}
          disabled={current === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
          whileHover={{ scale: current === 0 ? 1 : 1.03 }}
          whileTap={{ scale: current === 0 ? 1 : 0.97 }}
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </motion.button>
        <motion.button
          onClick={() => {
            setFlipped(false);
            setCurrent(0);
          }}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </motion.button>
        <motion.button
          onClick={next}
          disabled={current === cards.length - 1}
          className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
          whileHover={{ scale: current === cards.length - 1 ? 1 : 1.03 }}
          whileTap={{ scale: current === cards.length - 1 ? 1 : 0.97 }}
        >
          Next <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
