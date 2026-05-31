"use client";

import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export default function PageHeader({ icon: Icon, title, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 transition-colors mb-4"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Home
      </Link>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
          <Icon className="w-5 h-5 text-violet-500" />
        </div>
        <div>
          <h1 className="text-xl font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
