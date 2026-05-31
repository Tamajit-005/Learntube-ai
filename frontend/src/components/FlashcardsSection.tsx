"use client";

import { useState } from "react";
import { Layers, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface FlashCardsSectionProps {
  content: string;
}

function parseFlashcards(text: string): { question: string; answer: string }[] {
  const cards: { question: string; answer: string }[] = [];
  const qaRegex = /Q\d*[\.:\)]\s*(.*?)(?=\nA\d*[\.:\)])/g;
  const aRegex = /A\d*[\.:\)]\s*(.*?)(?=\nQ\d*[\.:\)]|$)/g;

  const questions = [...text.matchAll(qaRegex)].map((m) => m[1].trim());
  const answers = [...text.matchAll(aRegex)].map((m) => m[1].trim());

  const count = Math.min(questions.length, answers.length);
  for (let i = 0; i < count; i++) {
    cards.push({ question: questions[i], answer: answers[i] });
  }

  if (cards.length === 0) {
    const lines = text.split("\n").filter((l) => l.trim());
    for (let i = 0; i < lines.length - 1; i += 2) {
      cards.push({ question: lines[i].replace(/^Q\d*[\.:\)]\s*/, ""), answer: lines[i + 1].replace(/^A\d*[\.:\)]\s*/, "") });
    }
  }

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-violet-500" />
          <h2 className="text-lg font-semibold">Flashcards</h2>
          <span className="text-xs text-gray-400 ml-1">
            {current + 1} / {cards.length}
          </span>
        </div>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="relative w-full h-48 cursor-pointer [perspective:1000px]"
      >
        <div className={`flashcard-inner w-full h-full ${flipped ? "flipped" : ""}`}>
          <div className="flashcard-front bg-violet-50 dark:bg-slate-700/50">
            <p className="text-center font-medium text-base">{cards[current].question}</p>
          </div>
          <div className="flashcard-back bg-emerald-50 dark:bg-slate-700/50">
            <p className="text-center text-sm">{cards[current].answer}</p>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-gray-400 mt-2 mb-3">Click card to flip</p>

      <div className="flex justify-center gap-4">
        <button
          onClick={prev}
          disabled={current === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <button
          onClick={() => {
            setFlipped(false);
            setCurrent(0);
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        <button
          onClick={next}
          disabled={current === cards.length - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-40 transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
