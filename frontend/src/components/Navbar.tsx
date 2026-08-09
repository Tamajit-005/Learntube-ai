"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  LogOut,
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
  BadgeInfo,
  ChevronDown,
  KeyRound,
} from "lucide-react";
import { useAnalysis } from "@/context/AnalysisContext";
import { useAuth } from "@/context/AuthContext";
import Logo from "./Logo";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/notes", label: "Notes", icon: FileText },
  { href: "/quiz", label: "Quiz", icon: HelpCircle },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/interview", label: "Interview", icon: Briefcase },
  { href: "/formulas", label: "Formulas", icon: FunctionSquare },
  { href: "/about", label: "About", icon: BadgeInfo },
];

interface HistoryItem {
  _id: string;
  url: string;
  title?: string;
  analyzed_at: string;
}

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
  const router = useRouter();
  const {
    result,
    loading,
    hasPrevious,
    viewingPrevious,
    toggleHistory,
    clearSession,
    loadSavedAnalysis,
  } = useAnalysis();
  const { user, isLoading, changePassword } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const historyMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }

      if (
        historyMenuRef.current &&
        !historyMenuRef.current.contains(e.target as Node)
      ) {
        setHistoryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const response = await fetch("/api/content-history", {
          cache: "no-store",
        });

        if (!response.ok) {
          setHistoryItems([]);
          return;
        }

        const data = await response.json();
        setHistoryItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch content history:", error);
        setHistoryItems([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const handleHistorySelect = async (id: string) => {
    setHistoryOpen(false);
    setMobileOpen(false);

    try {
      const response = await fetch(`/api/content-history/${id}`);
      if (!response.ok) return;

      const item = await response.json();
      if (item?.result) {
        loadSavedAnalysis(item.url, item.analyzed_at, item.result);
        router.push("/notes");
      }
    } catch (error) {
      console.error("Failed to load content history item:", error);
    }
  };

  const userName =
    user?.username || user?.nickname || user?.name || user?.email || "";
  const userInitial = (userName || "?")[0].toUpperCase();

  const hasResult = !!result;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          {/* Logo — left side */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3 group"
          >
            <Logo className="h-11 w-11 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-[1.03]" />
            <span className="font-extrabold text-base sm:text-lg tracking-tight text-gray-950 dark:text-white">
              LearnTube AI
            </span>
          </Link>

          {/* Desktop Nav / Dropdown */}
          <div className="hidden lg:flex flex-1 items-center justify-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const disabled = !hasResult && item.href !== "/" && item.href !== "/about";

              return (
                <Link
                  key={item.href}
                  href={disabled ? "#" : item.href}
                  onClick={(e) => {
                    if (disabled) e.preventDefault();
                  }}
                  className={`group relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold tracking-tight transition-all duration-200
                    ${
                      isActive
                        ? "text-violet-700 dark:text-violet-300"
                        : disabled
                          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/90 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100 hover:-translate-y-0.5"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  <span
                    className={`absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500 transition-opacity duration-200 ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  />
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 -z-10 rounded-full bg-violet-500/10 dark:bg-violet-500/15"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right section */}
          <div className="ml-auto flex items-center gap-2 relative" ref={userMenuRef}>
            {/* User avatar — desktop */}
            {!isLoading && user && (
              <div className="hidden xl:flex items-center">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/15 bg-violet-500/10 text-violet-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/25"
                >
                  <span className="text-sm font-bold">
                    {userInitial}
                  </span>
                </button>
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
                  className="absolute right-4 top-full z-50 mt-2 w-44 overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-gray-700 dark:bg-slate-900/95"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="border-b border-gray-100 px-3 py-2.5 dark:border-gray-800">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-600 dark:text-violet-300">
                      Profile
                    </p>
                    <p className="mt-1 truncate text-xs font-medium text-gray-700 dark:text-gray-300">
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
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-gray-400 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Log out
                  </a>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History toggle + clear — desktop only (mobile has them in the dropdown) */}
            <div className="hidden lg:flex items-center gap-2">
                {user ? (
                  <div className="relative" ref={historyMenuRef}>
                    <button
                      onClick={() => setHistoryOpen(!historyOpen)}
                      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:text-gray-950 dark:border-gray-700 dark:bg-slate-900/70 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <History className="w-3.5 h-3.5" />
                      History
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${historyOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {historyOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-gray-700 dark:bg-slate-900/95"
                        >
                          <div className="max-h-60 overflow-y-auto">
                            {historyLoading ? (
                              <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                                Loading history...
                              </div>
                            ) : historyItems.length > 0 ? (
                              historyItems.map((item) => (
                                <button
                                  key={item._id}
                                  onClick={() => handleHistorySelect(item._id)}
                                  className="block w-full px-3 py-2.5 text-left text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white"
                                >
                                  <span className="block truncate">{item.title || item.url}</span>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                                No saved history yet
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : hasResult ? (
                  <div className="flex items-center overflow-hidden rounded-full border border-gray-200 bg-white/80 shadow-sm dark:border-gray-700 dark:bg-slate-900/70">
                    <button
                      onClick={() => {
                        if (viewingPrevious) toggleHistory();
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-all duration-200
                    ${
                      !viewingPrevious
                        ? "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-950 dark:hover:text-white"
                    }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      Latest
                    </button>
                    <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />
                    <button
                      onClick={() => {
                        if (!viewingPrevious && hasPrevious) toggleHistory();
                      }}
                      disabled={!hasPrevious}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-all duration-200
                    ${
                      viewingPrevious
                        ? "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                        : !hasPrevious
                          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-950 dark:hover:text-white"
                    }`}
                    >
                      <History className="w-3.5 h-3.5" />
                      Previous
                    </button>
                  </div>
                ) : null}

                {/* Clear session */}
                {hasResult && (
                  <button
                    onClick={clearSession}
                    className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 dark:text-gray-500 dark:hover:bg-red-900/20"
                    title="Clear all stored data"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                )}
            </div>

            {/* Loading indicator */}
            {loading && (
              <div className="hidden xl:flex items-center gap-2 text-xs text-violet-500 mr-1">
                <div className="w-3 h-3 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                Analyzing...
              </div>
            )}

            {/* Mobile avatar */}
            {!isLoading && user && (
              <div className="relative xl:hidden">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/15 bg-violet-500/10 text-violet-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-violet-500/20 dark:bg-violet-500/15 dark:text-violet-300 dark:hover:bg-violet-500/25"
                >
                  <span className="text-sm font-bold">
                    {userInitial}
                  </span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden rounded-xl p-2.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white"
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

        {/* Mobile tab strip — always visible on small screens, no hamburger step */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto -mx-4 px-4 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            const disabled = !hasResult && item.href !== "/" && item.href !== "/about";

            return (
              <Link
                key={item.href}
                href={disabled ? "#" : item.href}
                onClick={(e) => {
                  if (disabled) e.preventDefault();
                }}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold tracking-tight transition-all duration-200 ${
                  isActive
                    ? "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                    : disabled
                      ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100/90 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </Link>
            );
          })}
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
            className="lg:hidden absolute top-full left-0 right-0 overflow-hidden border-t border-gray-200 bg-white/95 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-gray-800 dark:bg-slate-900/95"
          >
            <div className="px-4 py-3 space-y-1">
              {user && (
                <>
                  <hr className="border-gray-200 dark:border-gray-700 my-2" />

                  <div className="relative mx-3">
                    <button
                      onClick={() => setHistoryOpen(!historyOpen)}
                      className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/80 px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 hover:text-gray-950 dark:border-gray-700 dark:bg-slate-900/70 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      <History className="w-3.5 h-3.5" />
                      History
                      <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${historyOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {historyOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -4, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.4)] backdrop-blur-xl dark:border-gray-700 dark:bg-slate-900/95"
                        >
                          <div className="max-h-60 overflow-y-auto">
                            {historyLoading ? (
                              <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                                Loading history...
                              </div>
                            ) : historyItems.length > 0 ? (
                              historyItems.map((item) => (
                                <button
                                  key={item._id}
                                  onClick={() => handleHistorySelect(item._id)}
                                  className="block w-full px-3 py-2.5 text-left text-sm text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white"
                                >
                                  <span className="block truncate">{item.title || item.url}</span>
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-3 text-xs text-gray-500 dark:text-gray-400">
                                No saved history yet
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}

              {!user && hasResult && (
                <div className="flex items-center overflow-hidden rounded-full border border-gray-200 bg-white/80 shadow-sm w-fit mx-3 dark:border-gray-700 dark:bg-slate-900/70">
                  <button
                    onClick={() => {
                      if (viewingPrevious) {
                        toggleHistory();
                        setMobileOpen(false);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                      !viewingPrevious
                        ? "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-950 dark:hover:text-white"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    Latest
                  </button>
                  <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />
                  <button
                    onClick={() => {
                      if (!viewingPrevious && hasPrevious) {
                        toggleHistory();
                        setMobileOpen(false);
                      }
                    }}
                    disabled={!hasPrevious}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium transition-all duration-200 ${
                      viewingPrevious
                        ? "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                        : !hasPrevious
                          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                          : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-950 dark:hover:text-white"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    Previous
                  </button>
                </div>
              )}

                  <button
                    onClick={() => {
                      clearSession();
                      setMobileOpen(false);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-2xl px-3 py-3 text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear all data
                  </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
