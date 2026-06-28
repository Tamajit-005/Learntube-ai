"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { GraduationCap, Mail, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function LoginForm() {
  const { user, isLoading, login, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login",
  );
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Login fields
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register fields
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password
  const [forgotMode, setForgotMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSending, setResetSending] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Password strength checks
  const passwordChecks = {
    length: regPassword.length >= 8,
    lower: /[a-z]/.test(regPassword),
    upper: /[A-Z]/.test(regPassword),
    number: /[0-9]/.test(regPassword),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(regPassword),
  };
  const allPass = Object.values(passwordChecks).every(Boolean);

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(identifier, loginPassword);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/");
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await register(regEmail, regPassword, regUsername);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      const loginResult = await login(regEmail, regPassword);
      if (loginResult.error) {
        setError("Account created! Please sign in.");
        setTab("login");
      } else {
        router.push("/");
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setResetSending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send reset email");
      } else {
        setResetSent(true);
      }
    } catch {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setResetSending(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="card p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-violet-500" />
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-tight">
              LearnTube AI
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your AI-powered YouTube learning assistant
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => {
                setTab("login");
                setError("");
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                tab === "login"
                  ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setTab("register");
                setError("");
              }}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                tab === "register"
                  ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-2.5 rounded-lg text-left">
              {error}
            </div>
          )}

          {/* Login Form */}
          {tab === "login" && (
            <AnimatePresence mode="wait">
              {forgotMode ? (
                <motion.form
                  key="forgot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleForgotPassword}
                  className="space-y-4"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(false);
                      setError("");
                      setResetSent(false);
                    }}
                    className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to sign in
                  </button>

                  <div className="text-left space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                  </div>

                  {resetSent ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-3 rounded-lg text-left">
                      Password reset email sent! Check your inbox.
                    </div>
                  ) : (
                    <button
                      type="submit"
                      disabled={resetSending}
                      className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                    >
                      {resetSending ? "Sending..." : "Send Reset Email"}
                    </button>
                  )}
                </motion.form>
              ) : (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLogin}
                  className="space-y-4"
                >
                  <div className="text-left space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Email or Username
                    </label>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    />
                  </div>
                  <div className="text-left space-y-1.5">
                    <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full px-3 py-2.5 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode(true);
                        setResetEmail(identifier);
                        setError("");
                      }}
                      className="text-xs text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                  >
                    {submitting ? "Signing in..." : "Sign In"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="text-left space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Username
                </label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="Choose a username"
                  required
                  minLength={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
              <div className="text-left space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Email
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
              <div className="text-left space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create a password (8+ characters)"
                    required
                    minLength={8}
                    className="w-full px-3 py-2.5 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showRegPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                {regPassword.length > 0 && (
                  <div className="space-y-1 mt-2">
                    <PasswordCheck
                      pass={passwordChecks.length}
                      label="At least 8 characters"
                    />
                    <PasswordCheck
                      pass={passwordChecks.lower}
                      label="Lower case letters (a-z)"
                    />
                    <PasswordCheck
                      pass={passwordChecks.upper}
                      label="Upper case letters (A-Z)"
                    />
                    <PasswordCheck
                      pass={passwordChecks.number}
                      label="Numbers (0-9)"
                    />
                    <PasswordCheck
                      pass={passwordChecks.special}
                      label="Special characters (e.g. !@#$%^&*)"
                    />
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={submitting || (regPassword.length > 0 && !allPass)}
                className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {submitting ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          <p className="text-xs text-gray-400">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function PasswordCheck({
  pass,
  label,
  bold,
}: {
  pass: boolean;
  label: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 ${bold ? "font-semibold" : ""} text-xs`}
    >
      <span className={pass ? "text-emerald-500" : "text-red-400"}>
        {pass ? "✓" : "✗"}
      </span>
      <span
        className={
          pass
            ? "text-gray-500 dark:text-gray-400"
            : "text-red-400 dark:text-red-400"
        }
      >
        {label}
        {!pass && ": Fail"}
      </span>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
