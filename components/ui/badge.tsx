import { Hash } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  showIcon?: boolean;
}

export function Badge({ className, children, showIcon = true, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-accent/30 bg-accent/15 px-2 py-0.5",
        "font-display text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent",
        "shadow-[inset_0_1px_0_rgba(255,248,230,0.35)]",
        className,
      )}
      {...props}
    >
      {showIcon ? <Hash size={12} weight="bold" className="shrink-0 opacity-80" aria-hidden /> : null}
      {children}
    </span>
  );
}
