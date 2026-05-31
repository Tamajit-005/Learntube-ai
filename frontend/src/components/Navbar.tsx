"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  Home,
  FileText,
  HelpCircle,
  Layers,
  Briefcase,
  Clock,
  FunctionSquare,
  Menu,
  X,
} from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/quiz", label: "Quiz", icon: HelpCircle },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/interview", label: "Interview", icon: Briefcase },
  { href: "/timestamps", label: "Timestamps", icon: Clock },
  { href: "/formulas", label: "Formulas", icon: FunctionSquare },
];

export default function Navbar() {
  const pathname = usePathname();
  const { result, loading } = useAnalysis();
  const [mobileOpen, setMobileOpen] = useState(false);

  const hasResult = !!result;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <GraduationCap className="w-6 h-6 text-violet-500" />
            <span className="text-sm font-bold hidden sm:block">LearnTube AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const disabled = !hasResult && item.href !== "/";

              return (
                <Link
                  key={item.href}
                  href={disabled ? "#" : item.href}
                  onClick={(e) => {
                    if (disabled) e.preventDefault();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${
                      isActive
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400"
                        : disabled
                          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="hidden md:flex items-center gap-2 text-xs text-violet-500">
              <div className="w-3 h-3 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
              Analyzing...
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900">
          <div className="px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const disabled = !hasResult && item.href !== "/";

              return (
                <Link
                  key={item.href}
                  href={disabled ? "#" : item.href}
                  onClick={(e) => {
                    if (disabled) {
                      e.preventDefault();
                    } else {
                      setMobileOpen(false);
                    }
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${
                      isActive
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400"
                        : disabled
                          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
