"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { staggerContainer, staggerItem } from "@/components/AnimatedPage";

export default function EmptyState() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 px-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-6"
        variants={staggerItem}
      >
        <Play className="w-8 h-8 text-violet-500" />
      </motion.div>
      <motion.h2 className="text-xl font-semibold mb-2" variants={staggerItem}>
        Analyze any YouTube video
      </motion.h2>
      <motion.p
        className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md"
        variants={staggerItem}
      >
        Paste a YouTube URL above to get AI-generated notes, flashcards, quizzes,
        interview questions, and key formulas from any educational video.
      </motion.p>
    </motion.div>
  );
}
