import React from "react";
import Link from "next/link";
import { Laptop, ArrowLeft, Search, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-900 border border-surface-800 text-brand-400 shadow-xl shadow-brand-500/10">
          <Laptop className="h-8 w-8 stroke-[1.8]" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">404 — Page Not Found</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            Looking for a Laptop?
          </h1>
          <p className="text-sm text-surface-400 leading-relaxed">
            The page you are looking for doesn't exist or may have been moved. Let's get you back on track to finding the right laptop.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/laptops" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full justify-center text-xs">
              <Search className="h-4 w-4 mr-1.5" />
              Browse Catalog
            </Button>
          </Link>
          <Link href="/advisor" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full justify-center text-xs">
              <BrainCircuit className="h-4 w-4 mr-1.5" />
              Ask AI Advisor
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-surface-800/80">
          <Link
            href="/"
            className="inline-flex items-center text-xs text-surface-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
