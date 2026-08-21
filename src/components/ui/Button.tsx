import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0EA5A4] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:bg-slate-100 disabled:text-[#94A3B8] active:scale-[0.98] select-none rounded-xl";

    const variantStyles = {
      primary:
        "bg-[#0EA5A4] hover:bg-[#087F7E] text-white font-bold shadow-xs border border-transparent",
      secondary:
        "bg-white hover:bg-slate-50 text-[#111827] font-semibold border border-[#E2E8F0] hover:border-[#0EA5A4] hover:text-[#0EA5A4] shadow-xs",
      outline:
        "border border-[#CBD5E1] hover:border-[#0EA5A4] text-[#111827] hover:text-[#0EA5A4] bg-white hover:bg-[#E6FFFE] shadow-xs",
      ghost:
        "text-[#0EA5A4] hover:text-[#087F7E] hover:bg-[#E6FFFE]",
      danger:
        "bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold shadow-xs border border-transparent",
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
