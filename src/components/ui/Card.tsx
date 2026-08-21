import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  children: React.ReactNode;
}

export function Card({ className, glow = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-[#E2E8F0] p-6 shadow-card-light transition-all duration-200",
        glow && "hover:border-[#0EA5A4] hover:shadow-card-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col space-y-1.5 pb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-bold tracking-tight text-[#111827] font-sans", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-[#64748B] leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("pt-0", className)} {...props}>
      {children}
    </div>
  );
}
