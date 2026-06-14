"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { staggerContainer, staggerItem } from "@/components/AnimatedPage";

interface NoDataPromptProps {
  section: string;
}

export default function NoDataPrompt({ section }: NoDataPromptProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 px-4"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-6"
        variants={staggerItem}
      >
        <Play className="w-8 h-8 text-gray-400" />
      </motion.div>
      <motion.h2 className="text-xl font-semibold mb-2" variants={staggerItem}>
        No {section} yet
      </motion.h2>
      <motion.p
        className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-md mb-6"
        variants={staggerItem}
      >
        Analyze a YouTube video first to generate {section.toLowerCase()}.
      </motion.p>
      <motion.div variants={staggerItem} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to Home
        </Link>
      </motion.div>
    </motion.div>
  );
}
