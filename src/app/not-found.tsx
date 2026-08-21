import React from "react";
import Link from "next/link";
import { ArrowLeft, Search, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <Logo variant="mark" size="lg" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-700">404 — Page Not Found</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight font-sans">
            Looking for a Laptop?
          </h1>
          <p className="text-sm text-[#64748B] leading-relaxed">
            The page you are looking for doesn&apos;t exist or may have been moved. Let&apos;s get you back on track to finding the right laptop.
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

        <div className="pt-4 border-t border-[#E2E8F0]">
          <Link
            href="/"
            className="inline-flex items-center text-xs text-[#64748B] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
