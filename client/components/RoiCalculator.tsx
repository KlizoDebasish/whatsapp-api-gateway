"use client";

import React, { useState } from "react";
import { DollarSign, ArrowRight, ShieldCheck } from "lucide-react";
import { formatInteger, formatINR } from "@/lib/utils";

interface RoiProps {
  onOpenWizard: () => void;
}

export default function RoiCalculator({ onOpenWizard }: RoiProps) {
  const [monthlyConversations, setMonthlyConversations] = useState<number>(3500);

  // Meta official rates: approx $0.05 per conversation
  const metaCostPerConversation = 0.05;
  const metaMonthlyCostUSD = monthlyConversations * metaCostPerConversation;
  const metaAnnualCostUSD = metaMonthlyCostUSD * 12;

  const inrConversion = 85;
  const metaMonthlyCostINR = metaMonthlyCostUSD * inrConversion;
  const metaAnnualCostINR = metaAnnualCostUSD * inrConversion;

  return (
    <section id="roi-calculator" className="py-20 bg-slate-900 text-white border-b border-slate-800 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Interactive Cost Calculator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Calculate Your Savings vs Official Meta API
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Slide to your estimated monthly customer chats to see how much money MessageAPI saves your business every year.
          </p>
        </div>

        {/* Interactive Calculator Box */}
        <div className="max-w-4xl mx-auto bg-slate-800/90 rounded-3xl border border-slate-700 p-6 sm:p-10 shadow-2xl backdrop-blur-sm space-y-8">
          {/* Slider Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Monthly Customer WhatsApp Conversations:
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
                {formatInteger(monthlyConversations)} chats/mo
              </span>
            </div>

            <input
              type="range"
              min="500"
              max="30000"
              step="500"
              value={monthlyConversations}
              onChange={(e) => setMonthlyConversations(parseInt(e.target.value, 10))}
              className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />

            <div className="flex justify-between text-[11px] font-mono text-slate-500">
              <span>500 chats</span>
              <span>10,000 chats</span>
              <span>20,000 chats</span>
              <span>30,000+ chats</span>
            </div>
          </div>

          {/* Side-by-Side Savings Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            {/* Meta Official API Cost */}
            <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-2">
              <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Meta Official Cloud API Bill
              </p>
              <div className="text-3xl font-black text-white">
                ${formatInteger(metaMonthlyCostUSD)}{" "}
                <span className="text-xs text-rose-400 font-normal">/ month</span>
              </div>
              <p className="text-xs text-slate-400">
                ₹{formatINR(metaMonthlyCostINR)} /mo (₹{formatINR(metaAnnualCostINR)}/year)
              </p>
              <p className="text-[11px] text-rose-300/80 pt-1">
                ⚠️ Charged per conversation window + Facebook verification overhead.
              </p>
            </div>

            {/* MessageAPI Cost */}
            <div className="p-6 rounded-2xl bg-emerald-950/50 border-2 border-emerald-500 space-y-2 shadow-lg shadow-emerald-500/10">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                MessageAPI Enterprise Gateway
              </p>
              <div className="text-3xl font-black text-emerald-400">
                $0.00{" "}
                <span className="text-xs text-emerald-300 font-normal">/ month forever</span>
              </div>
              <p className="text-xs text-slate-300">
                You save <strong className="text-emerald-400">${formatInteger(metaAnnualCostUSD)} (₹{formatINR(metaAnnualCostINR)})</strong> every single year!
              </p>
              <p className="text-[11px] text-emerald-300/80 pt-1">
                ✅ 100% Free Open WhatsApp Connection with Safe Anti-Ban Pacing.
              </p>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="pt-4 border-t border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Zero hidden fees • Run on your own servers or free cloud</span>
            </div>

            <button
              onClick={onOpenWizard}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-[5px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-lg transition-all"
            >
              <span>Create Free Business Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
