import { cn } from "@/lib/utils";

const Logo = ({ className, inverted = true }: { className?: string; inverted?: boolean }) => {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", inverted ? "bg-[var(--accent)]" : "bg-[var(--ink)]")}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      </div>
      <div>
        <div className={cn("text-[17px] font-bold tracking-tight leading-none", inverted ? "text-white" : "text-[var(--ink)]")}>FitSync Pro</div>
        <div className={cn("text-[11px] mt-0.5", inverted ? "text-[var(--muted2)]" : "text-[var(--muted)]")}>Powered by AI</div>
      </div>
    </div>
  );
};

export default Logo;