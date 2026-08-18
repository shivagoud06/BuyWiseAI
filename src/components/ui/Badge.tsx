import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "outline" | "verdict-buy" | "verdict-wait" | "verdict-skip";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function Badge({ className, variant = "default", size = "md", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-surface-800 text-surface-300 border-surface-700/60",
    brand: "bg-brand-500/15 text-brand-300 border-brand-500/30",
    outline: "bg-transparent text-surface-300 border-surface-700 hover:border-surface-600",
    "verdict-buy": "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    "verdict-wait": "bg-amber-500/15 text-amber-300 border-amber-500/30",
    "verdict-skip": "bg-rose-500/15 text-rose-300 border-rose-500/30",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium",
    md: "text-xs px-2.5 py-1 font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
