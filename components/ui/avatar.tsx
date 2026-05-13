import { UserCircle } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export interface AvatarProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

const sizePx = { sm: 36, md: 44, lg: 56 } as const;

export function Avatar({
  src,
  alt = "",
  fallback,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const px = sizePx[size];
  const dimensionClass =
    size === "sm" ? "h-9 w-9 min-h-9 min-w-9" : size === "lg" ? "h-14 w-14 min-h-14 min-w-14" : "h-11 w-11 min-h-11 min-w-11";

  const initials =
    fallback?.trim().slice(0, 2).toUpperCase() ||
    alt
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("") ||
    null;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 select-none overflow-hidden rounded-full align-middle",
        "ring-2 ring-[rgba(59,42,26,0.22)] ring-offset-2 ring-offset-[var(--background)]",
        "[box-shadow:inset_0_2px_6px_rgba(59,42,26,0.12)]",
        dimensionClass,
        className,
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary avatar URLs (e.g. OAuth) without domain allowlisting
        <img
          src={src}
          alt={alt || "Avatar"}
          width={px}
          height={px}
          className={cn(
            "h-full w-full object-cover [filter:sepia(0.32)_contrast(1.06)_saturate(0.88)_brightness(0.98)]",
          )}
        />
      ) : (
        <span
          className={cn(
            "flex h-full w-full items-center justify-center",
            "bg-gradient-to-br from-[rgba(241,220,190,0.95)] to-[rgba(210,180,145,0.85)]",
            "font-display text-foreground/75",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
          )}
          aria-hidden={!initials}
        >
          {initials ? (
            <span className="tracking-tight">{initials}</span>
          ) : (
            <UserCircle className="text-foreground/45" size={px * 0.62} weight="duotone" aria-hidden />
          )}
        </span>
      )}
    </span>
  );
}
