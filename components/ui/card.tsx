import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[8px_10px_9px_11px] border-2 border-[rgba(59,42,26,0.28)]",
        "bg-gradient-to-br from-[rgba(255,252,242,0.72)] via-[rgba(241,228,198,0.9)] to-[rgba(232,218,188,0.97)]",
        "shadow-[0_12px_28px_rgba(59,42,26,0.10),0_4px_10px_rgba(59,42,26,0.07),inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-2px_12px_rgba(59,42,26,0.05)]",
        "backdrop-blur-[1px]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-[rgba(59,42,26,0.12)] px-5 pb-3 pt-5 font-display text-sm font-semibold uppercase tracking-[0.18em] text-foreground/90",
        className,
      )}
      {...props}
    />
  );
}

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn("px-5 py-4", className)} {...props} />;
}

export type CardFooterProps = HTMLAttributes<HTMLDivElement>;

export function CardFooter({ className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        "border-t border-[rgba(59,42,26,0.1)] bg-[rgba(59,42,26,0.03)] px-5 py-3",
        className,
      )}
      {...props}
    />
  );
}
