import { cn } from "@/lib/cn";

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional short label centered on the stroke */
  label?: string;
}

export function Divider({ className, label, ...props }: DividerProps) {
  return (
    <div
      role="separator"
      className={cn("relative flex w-full flex-col items-stretch py-3", className)}
      {...props}
    >
      <div className="relative h-4 w-full">
        <svg
          className="absolute inset-0 h-full w-full text-foreground/55"
          viewBox="0 0 480 18"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M0 10.2 C38 5.2 72 14.5 112 8.8 C152 3.1 176 12.4 216 9.1 C256 5.8 292 13.2 332 7.5 C372 1.8 404 11 432 8.5 C452 6.8 468 10.5 480 7.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.88"
          />
          <path
            d="M2 12.6 C44 7.8 78 15.8 118 10.4 C158 5 188 14 226 11 C264 8 300 14.2 340 9.2 C380 4.2 410 12.5 438 10.2 C456 8.8 470 12.8 478 10.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            opacity="0.42"
          />
        </svg>
      </div>
      {label ? (
        <span className="pointer-events-none absolute left-1/2 top-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 px-2 font-display text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-foreground/55">
          <span className="rounded-sm bg-[var(--background)]/90 px-1.5 py-0.5 shadow-sm backdrop-blur-[2px]">
            {label}
          </span>
        </span>
      ) : null}
    </div>
  );
}
