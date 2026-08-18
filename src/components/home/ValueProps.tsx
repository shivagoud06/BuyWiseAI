import React from "react";
import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, Scale, Cpu } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function ValueProps() {
  return (
    <section id="verdict-system" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="brand" size="sm" className="mb-3">
            Decision Framework
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            The BuyWise Verdict System
          </h2>
          <p className="mt-2 text-sm text-surface-400">
            Never second-guess a laptop purchase with clear, color-coded guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Verdict: BUY */}
          <Card className="border-emerald-500/20 bg-emerald-950/10 hover:border-emerald-500/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="verdict-buy" size="md">
                <CheckCircle2 className="h-3.5 w-3.5" />
                BUY
              </Badge>
              <span className="text-xs text-emerald-400 font-medium">Recommended Value</span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Great Price-to-Performance</h3>
            <p className="text-xs text-surface-300 leading-relaxed">
              Specs exceed average class benchmarks, thermal stability is tested, and the current price represents strong value for your workload.
            </p>
          </Card>

          {/* Verdict: WAIT */}
          <Card className="border-amber-500/20 bg-amber-950/10 hover:border-amber-500/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="verdict-wait" size="md">
                <Clock className="h-3.5 w-3.5" />
                WAIT
              </Badge>
              <span className="text-xs text-amber-400 font-medium">Upcoming Refresh / Sales</span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Next-Gen Architecture Imminent</h3>
            <p className="text-xs text-surface-300 leading-relaxed">
              A newer CPU/GPU generation or seasonal discount cycle is expected within 30–60 days, making waiting likely worth the patience.
            </p>
          </Card>

          {/* Verdict: SKIP */}
          <Card className="border-rose-500/20 bg-rose-950/10 hover:border-rose-500/40 p-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="verdict-skip" size="md">
                <AlertTriangle className="h-3.5 w-3.5" />
                SKIP
              </Badge>
              <span className="text-xs text-rose-400 font-medium">Overpriced / Flawed</span>
            </div>
            <h3 className="text-base font-bold text-white mb-2">Poor Spec Value or Known Issues</h3>
            <p className="text-xs text-surface-300 leading-relaxed">
              Suffers from thermal throttling, subpar display gamut (e.g. 45% NTSC), soldered low RAM, or overpriced compared to immediate competitors.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
