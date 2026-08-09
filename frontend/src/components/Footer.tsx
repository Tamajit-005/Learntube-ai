import Link from "next/link";
import Logo from "./Logo";

const footerLinks = [
  {
    label: "Study Tools",
    links: [
      { href: "/notes", label: "Notes" },
      { href: "/quiz", label: "Quiz" },
      { href: "/flashcards", label: "Flashcards" },
      { href: "/interview", label: "Interview" },
      { href: "/formulas", label: "Formulas" },
    ],
  },
  {
    label: "More",
    links: [
      { href: "/", label: "Home" },
      { href: "/about", label: "About" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-3">
              <Logo className="h-8 w-8" />
              <span className="font-extrabold text-base tracking-tight text-gray-950 dark:text-white">
                LearnTube AI
              </span>
            </Link>
            <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Turn YouTube videos into structured study materials — notes, quizzes, flashcards, and more.
            </p>
          </div>

          {/* Link columns */}
          {footerLinks.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {group.label}
              </p>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 py-5 dark:border-gray-800">
          <p className="text-xs text-center text-gray-400 dark:text-gray-500">
            &copy; {new Date().getFullYear()} LearnTube AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
