import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "outline" | "verdict-buy" | "verdict-wait" | "verdict-skip";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function Badge({ className, variant = "default", size = "md", children, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-slate-100 text-[#475569] border-[#E2E8F0]",
    brand: "bg-[#E6FFFE] text-[#0EA5A4] border-[#99F6F3] font-bold",
    outline: "bg-white text-[#475569] border-[#CBD5E1] hover:border-[#0EA5A4]",
    "verdict-buy": "bg-[#DCFCE7] text-[#16A34A] border-[#BBF7D0] font-bold",
    "verdict-wait": "bg-[#FEF3C7] text-[#D97706] border-[#FDE68A] font-bold",
    "verdict-skip": "bg-[#FEE2E2] text-[#DC2626] border-[#FECACA] font-bold",
  };

  const sizeStyles = {
    sm: "text-[11px] px-2 py-0.5 font-medium",
    md: "text-xs px-2.5 py-1 font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border transition-colors shadow-xs",
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
