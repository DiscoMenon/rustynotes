"use client";

import { forwardRef } from "react";
import type { IconProps } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ComponentType<IconProps>;
  rightIcon?: React.ComponentType<IconProps>;
}

const iconSizes = { sm: 16, md: 18, lg: 20 } as const;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      children,
      type = "button",
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled;
    const iconSize = iconSizes[size];

    const iconProps: IconProps = {
      size: iconSize,
      weight: "bold",
      className: "shrink-0 opacity-95",
      "aria-hidden": true,
    };

    if (variant === "primary") {
      return (
        <button
          ref={ref}
          type={type}
          disabled={isDisabled}
          className={cn(
            "wax-stamp-button outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
            size === "sm" && "wax-stamp-button-sm",
            size === "md" && "wax-stamp-button-md",
            size === "lg" && "wax-stamp-button-lg",
            className,
          )}
          {...props}
        >
          {LeftIcon ? <LeftIcon {...iconProps} /> : null}
          {children}
          {RightIcon ? <RightIcon {...iconProps} /> : null}
        </button>
      );
    }

    const ghostSize =
      size === "sm"
        ? "gap-1.5 px-3 py-1.5 text-xs"
        : size === "lg"
          ? "gap-2 px-5 py-3 text-sm"
          : "gap-2 px-4 py-2 text-sm";

    const dangerSize = ghostSize;

    if (variant === "ghost") {
      return (
        <button
          ref={ref}
          type={type}
          disabled={isDisabled}
          className={cn(
            "inline-flex items-center justify-center font-display font-semibold uppercase tracking-widest text-foreground/85 outline-none transition-colors",
            "rounded-lg border-2 border-transparent bg-transparent",
            "hover:border-[rgba(59,42,26,0.18)] hover:bg-[rgba(59,42,26,0.06)]",
            "focus-visible:border-[rgba(139,58,42,0.45)] focus-visible:ring-2 focus-visible:ring-accent/25",
            "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-55",
            ghostSize,
            className,
          )}
          {...props}
        >
          {LeftIcon ? <LeftIcon {...iconProps} weight="regular" /> : null}
          {children}
          {RightIcon ? <RightIcon {...iconProps} weight="regular" /> : null}
        </button>
      );
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          "relative inline-flex items-center justify-center font-display font-semibold uppercase tracking-widest outline-none transition-[transform,box-shadow,filter]",
          "rounded-full text-[#f8ecd8]",
          "shadow-[0_5px_12px_rgba(59,42,26,0.32),0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,200,185,0.28),inset_0_-5px_12px_rgba(30,10,6,0.35)]",
          "bg-[linear-gradient(165deg,#a53c32_0%,#7a2820_42%,#4e1814_100%)]",
          "before:pointer-events-none before:absolute before:inset-[4px] before:rounded-full before:border before:border-[rgba(20,8,6,0.4)] before:shadow-[inset_0_0_10px_rgba(0,0,0,0.22)]",
          "hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:ring-2 focus-visible:ring-[#7a2820]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
          dangerSize,
          className,
        )}
        {...props}
      >
        <span className="relative z-[1] inline-flex items-center justify-center gap-2">
          {LeftIcon ? <LeftIcon {...iconProps} /> : null}
          {children}
          {RightIcon ? <RightIcon {...iconProps} /> : null}
        </span>
      </button>
    );
  },
);

Button.displayName = "Button";
