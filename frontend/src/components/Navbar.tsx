"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  LogOut,
  GraduationCap,
  Home,
  FileText,
  HelpCircle,
  Layers,
  Briefcase,
  FunctionSquare,
  History,
  Trash2,
  Menu,
  X,
  KeyRound,
} from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/quiz", label: "Quiz", icon: HelpCircle },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/interview", label: "Interview", icon: Briefcase },
  { href: "/formulas", label: "Formulas", icon: FunctionSquare },
];

const mobileMenuVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.25, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2, ease: "easeIn" as const },
  },
};

export default function Navbar() {
  const pathname = usePathname();
  const {
    result,
    loading,
    hasPrevious,
    viewingPrevious,
    toggleHistory,
    clearSession,
  } = useAnalysis();
  const { user, isLoading, changePassword } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userName =
    user?.username || user?.nickname || user?.name || user?.email || "";
  const userInitial = (userName || "?")[0].toUpperCase();

  const hasResult = !!result;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo — left side */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center transition-transform group-hover:scale-105">
              <GraduationCap className="w-5 h-5 text-violet-500" />
            </div>
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-gray-900 dark:text-white">
              LearnTube AI
            </span>
          </Link>

          {/* Desktop Nav / Dropdown */}
          <div className="hidden xl:flex items-center gap-1.5">
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold tracking-tight transition-all
                    ${
                      isActive
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400"
                        : disabled
                          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1.5 relative" ref={userMenuRef}>
            {/* User / Auth — desktop */}
            {!isLoading && (
              <div className="hidden xl:flex items-center">
                {user ? (
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="w-8 h-8 rounded-full bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center hover:bg-violet-500/20 dark:hover:bg-violet-500/30 transition-all"
                  >
                    <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                      {userInitial}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1 mr-1">
                    <a
                      href="/login"
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                    >
                      Sign in
                    </a>
                    <a
                      href="/login?tab=register"
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
                    >
                      Register
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* User dropdown */}
            <AnimatePresence>
              {userMenuOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-4 top-full mt-1.5 w-40 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 shadow-lg overflow-hidden z-50"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                      {userName}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      setUserMenuOpen(false);
                      const result = await changePassword();
                      if (result.error) {
                        toast.error(result.error);
                      } else {
                        toast.success("Password reset email sent!");
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-500 transition-colors w-full text-left"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Change Password
                  </button>
                  <a
                    href="/api/auth/logout"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log out
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History toggle + clear — desktop only (mobile has them in the dropdown) */}
            {hasResult && !user && (
              <div className="hidden xl:flex items-center gap-2">
                <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => {
                      if (viewingPrevious) toggleHistory();
                    }}
                    className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-all
                    ${
                      !viewingPrevious
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400 shadow-sm"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    Latest
                  </button>
                  <div className="w-px h-3.5 bg-gray-200 dark:bg-gray-700" />
                  <button
                    onClick={() => {
                      if (!viewingPrevious && hasPrevious) toggleHistory();
                    }}
                    disabled={!hasPrevious}
                    className={`flex items-center gap-1 px-2 py-1.5 text-xs font-medium transition-all
                    ${
                      viewingPrevious
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400 shadow-sm"
                        : !hasPrevious
                          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    Previous
                  </button>
                </div>

                {/* Clear session */}
                <button
                  onClick={clearSession}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                  title="Clear all stored data"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="hidden xl:flex items-center gap-2 text-xs text-violet-500 mr-1">
                <div className="w-3 h-3 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                Analyzing...
              </div>
            )}

            {/* Mobile avatar */}
            {!isLoading && (
              <>
                {user ? (
                  <div className="relative xl:hidden">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="w-8 h-8 rounded-full bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center hover:bg-violet-500/20 dark:hover:bg-violet-500/30 transition-all"
                    >
                      <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                        {userInitial}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 xl:hidden">
                    <a
                      href="/login"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                    >
                      Sign in
                    </a>
                    <a
                      href="/login?tab=register"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
                    >
                      Register
                    </a>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="xl:hidden p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (animated dropdown) */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="xl:hidden absolute top-full left-0 right-0 overflow-hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-lg"
          >
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
                    className={`flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm font-medium transition-all
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
              {hasResult && !user && (
                <>
                  <hr className="border-gray-200 dark:border-gray-700 my-2" />

                  {/* Mobile history toggle */}
                  <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden w-fit mx-3">
                    <button
                      onClick={() => {
                        if (viewingPrevious) {
                          toggleHistory();
                          setMobileOpen(false);
                        }
                      }}
                      className={`flex items-center gap-1 px-3 py-2 text-xs font-medium transition-all ${
                        !viewingPrevious
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      Latest
                    </button>
                    <div className="w-px h-4 bg-gray-200 dark:bg-gray-700" />
                    <button
                      onClick={() => {
                        if (!viewingPrevious && hasPrevious) {
                          toggleHistory();
                          setMobileOpen(false);
                        }
                      }}
                      disabled={!hasPrevious}
                      className={`flex items-center gap-1 px-3 py-2 text-xs font-medium transition-all ${
                        viewingPrevious
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400"
                          : !hasPrevious
                            ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      Previous
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      clearSession();
                      setMobileOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all w-full"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear all data
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
