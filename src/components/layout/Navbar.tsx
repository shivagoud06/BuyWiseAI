"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Laptop, Sparkles, Menu, X, ArrowRight, Scale, BrainCircuit, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCompare } from "@/context/CompareContext";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { count } = useCompare();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-800/80 bg-surface-950/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2 sm:gap-2.5 transition-transform">
          <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 shadow-md shadow-brand-500/20 group-hover:scale-105 transition-all">
            <Laptop className="h-4 w-4 sm:h-5 sm:w-5 text-surface-950 stroke-[2.2]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">BuyWise</span>
              <span className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
            </div>
            <span className="hidden xs:block text-[9px] sm:text-[10px] text-surface-400 font-medium tracking-wide uppercase">Laptop Buying Copilot</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-7">
          <Link
            href="/"
            className="text-sm font-medium text-surface-300 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/laptops"
            className="text-sm font-medium text-surface-300 hover:text-white transition-colors"
          >
            Laptops
          </Link>
          <Link
            href="/compare"
            className="text-sm font-medium text-surface-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Scale className="h-3.5 w-3.5 text-brand-400" />
            <span>Compare</span>
            {count > 0 && (
              <span className="rounded-full bg-brand-500 text-surface-950 text-[11px] font-bold px-1.5 py-0.2">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/advisor"
            className="text-sm font-medium text-surface-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <BrainCircuit className="h-3.5 w-3.5 text-cyan-400" />
            <span>AI Advisor</span>
          </Link>
        </nav>

        {/* Right CTA / Search & Action */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/laptops"
            className="rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-white transition-colors"
            title="Search laptops"
            aria-label="Search laptops"
          >
            <Search className="h-4 w-4" />
          </Link>

          <Link href="/advisor">
            <Button size="sm" variant="primary" className="font-semibold text-xs">
              Find My Laptop
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          {count > 0 && (
            <Link
              href="/compare"
              className="flex items-center gap-1 rounded-lg bg-surface-800 px-2.5 py-1.5 text-xs text-brand-300 font-semibold border border-surface-700"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>{count}</span>
            </Link>
          )}
          <Link
            href="/laptops"
            className="rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-white transition-colors"
            aria-label="Search laptops"
          >
            <Search className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-surface-400 hover:bg-surface-800 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-surface-800 bg-surface-950/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-surface-200 hover:text-brand-400 py-1"
            >
              Home
            </Link>
            <Link
              href="/laptops"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-surface-200 hover:text-brand-400 py-1"
            >
              Laptops
            </Link>
            <Link
              href="/compare"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-surface-200 hover:text-brand-400 py-1 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-brand-400" />
                <span>Compare</span>
              </div>
              {count > 0 && (
                <span className="rounded-full bg-brand-500 text-surface-950 text-xs font-bold px-2 py-0.5">
                  {count}
                </span>
              )}
            </Link>
            <Link
              href="/advisor"
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium text-surface-200 hover:text-brand-400 py-1 flex items-center gap-2"
            >
              <BrainCircuit className="h-4 w-4 text-cyan-400" />
              <span>AI Advisor</span>
            </Link>
          </nav>
          <div className="pt-2 border-t border-surface-800 flex flex-col gap-2.5">
            <Link href="/advisor" onClick={() => setMobileMenuOpen(false)}>
              <Button size="md" variant="primary" className="w-full justify-center font-semibold text-xs">
                Find My Laptop
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
