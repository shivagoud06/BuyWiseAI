"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log safe error in development
    if (process.env.NODE_ENV === "development") {
      console.error("Application Error Boundary caught error:", error);
    }
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-400 shadow-xl shadow-amber-500/10">
          <AlertTriangle className="h-8 w-8 stroke-[1.8]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Something Went Wrong</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Unable to Load Content
          </h1>
          <p className="text-sm text-surface-400 leading-relaxed">
            We encountered a temporary issue while loading this page. Please try refreshing or return to the homepage.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            variant="primary"
            className="w-full sm:w-auto justify-center text-xs"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Try Again
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full justify-center text-xs">
              <Home className="h-4 w-4 mr-1.5" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
