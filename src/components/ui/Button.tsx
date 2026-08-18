import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-xl";

    const variantStyles = {
      primary:
        "bg-brand-500 hover:bg-brand-600 text-surface-950 font-semibold shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 border border-brand-400/30",
      secondary:
        "bg-surface-800 hover:bg-surface-700 text-surface-100 border border-surface-700/60 shadow-sm",
      outline:
        "border border-surface-700/80 hover:border-brand-400/60 text-surface-200 hover:text-white bg-surface-900/40 hover:bg-surface-800/60 backdrop-blur-sm",
      ghost:
        "text-surface-300 hover:text-white hover:bg-surface-800/60",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-6 py-3.5 gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
