import { Play, Sparkles } from "lucide-react";

type LogoProps = {
  className?: string;
};

export default function Logo({ className = "" }: LogoProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/40 bg-[linear-gradient(135deg,rgba(168,85,247,0.95),rgba(124,58,237,0.92),rgba(99,102,241,0.95))] shadow-[0_18px_40px_-18px_rgba(124,58,237,0.75)] backdrop-blur-xl ${className}`}
    >
      <span className="absolute inset-0 rounded-2xl bg-white/10" />
      <span className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/16 ring-1 ring-white/25">
        <Play className="ml-0.5 h-4 w-4 fill-white text-white drop-shadow-sm" />
      </span>
      <Sparkles className="absolute -right-1 -top-1 h-3.5 w-3.5 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]" />
    </span>
  );
}
