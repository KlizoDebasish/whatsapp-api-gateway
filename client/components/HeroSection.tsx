"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Bot, 
  Zap, 
  Pill, 
  Dumbbell, 
  ShoppingCart, 
  Tv, 
  Utensils, 
  Scissors, 
  Briefcase, 
  CheckCircle2, 
  Play,
  LucideIcon
} from "lucide-react";
import { BusinessCategory, BUSINESS_TEMPLATES } from "@/lib/types";

interface HeroSectionProps {
  onOpenWizard: (category?: BusinessCategory) => void;
  onScrollToDemo: () => void;
}

export default function HeroSection({ onOpenWizard, onScrollToDemo }: HeroSectionProps) {
  const [selectedNiche, setSelectedNiche] = useState<BusinessCategory>("custom");

  const handleSelectNiche = (nicheId: BusinessCategory) => {
    setSelectedNiche(nicheId);
    setTimeout(() => {
      const previewEl = document.getElementById("hero-live-preview");
      if (previewEl) {
        previewEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 50);
  };

  const niches: { id: BusinessCategory; label: string; icon: LucideIcon; color: string }[] = [
    { id: "custom", label: "🌟 Any Business / Product / Company", icon: Briefcase, color: "text-slate-900 bg-slate-100 border-slate-300" },
    { id: "medicine", label: "Medicine & Pharmacy", icon: Pill, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { id: "gym", label: "Gym & Fitness Club", icon: Dumbbell, color: "text-blue-600 bg-blue-50 border-blue-200" },
    { id: "grocery", label: "Grocery & Retail", icon: ShoppingCart, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { id: "electronics", label: "Electronics & Gadgets", icon: Tv, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    { id: "restaurant", label: "Restaurant & Cafe", icon: Utensils, color: "text-rose-600 bg-rose-50 border-rose-200" },
    { id: "salon", label: "Salon & Beauty Spa", icon: Scissors, color: "text-purple-600 bg-purple-50 border-purple-200" },
  ];

  const currentTemplate = BUSINESS_TEMPLATES[selectedNiche] || BUSINESS_TEMPLATES.custom;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 pt-10 pb-20 border-b border-slate-200">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-emerald-200/30 via-teal-100/20 to-blue-200/20 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Feature Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold shadow-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-ping" />
            <span>Universal WhatsApp Automation • Zero Meta Fees • Built for Any Business</span>
          </div>
        </div>

        {/* Main Headline & Description */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-tight">
            Turn Any Business Or Product Into A{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              24/7 AI WhatsApp Machine
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Whether you own a <strong>Medicine Shop</strong>, <strong>Gym</strong>, <strong>Grocery Supermarket</strong>, <strong>Electronics Outlet</strong>, <strong>Online Brand</strong>, or <strong>Custom Company</strong> — empower your customers to check live inventory, query prices, receive quotes, and place instant orders directly on WhatsApp with zero per-message charges and safe Anti-Ban pacing.
          </p>

          {/* Quick Business Niche Selector with Universal Option */}
          <div className="pt-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Works for ALL types of businesses & products — Select to see live preview:</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {niches.map((niche) => {
                const Icon = niche.icon;
                const isSelected = selectedNiche === niche.id;
                return (
                  <button
                    key={niche.id}
                    onClick={() => handleSelectNiche(niche.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-[5px] text-xs font-bold transition-all border ${
                      isSelected
                        ? "bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/20 scale-105"
                        : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                    <span>{niche.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => onOpenWizard(selectedNiche)}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3 rounded-[5px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-extrabold shadow-xl shadow-emerald-600/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Setup Account for {currentTemplate.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onScrollToDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-[5px] bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold border border-slate-300 shadow-sm transition-all"
            >
              <Play className="w-4 h-4 text-emerald-600 fill-emerald-600" />
              <span>Try Interactive Live Simulator</span>
            </button>
          </div>

          {/* Trust Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 max-w-8xl mx-auto">
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Anti-Ban 1–30s Pacing</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-bold text-slate-700">
              <Zap className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Zero Meta Charges</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-bold text-slate-700">
              <Bot className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span>Multimodal AI Voice & Vision</span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs text-xs font-bold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Instant 1-Click QR Setup</span>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Hero Showcase Box */}
        <div id="hero-live-preview" className="mt-12 max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden scroll-mt-24">
          {/* Mock Window Header */}
          <div className="bg-slate-900 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="ml-2 text-xs font-bold text-slate-300">
                Live Preview: {currentTemplate.title}
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Anti-Ban Active (8s–18s)
            </span>
          </div>

          {/* Chat Preview Window */}
          <div className="p-6 sm:p-8 bg-slate-50/70 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: MessageAPI Live Preview Simulation */}
            <div className="space-y-4 bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-[5px] bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {currentTemplate.title.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{currentTemplate.title}</p>
                    <p className="text-[10px] text-emerald-400 font-medium">MessageAPI Autonomous Assistant</p>
                  </div>
                </div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-[5px] border border-slate-700 text-emerald-400 font-mono font-bold">
                  MessageAPI Live
                </span>
              </div>

              {/* Sample Messages */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3 rounded-2xl rounded-tr-xs max-w-[85%] shadow-md">
                    <p>{currentTemplate.sampleInteractions[0]?.user || "Hi, what are your services and prices?"}</p>
                    <span className="text-[9px] text-emerald-100 block text-right mt-1">10:42 AM ✓✓</span>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-100 p-3 rounded-2xl rounded-tl-xs max-w-[90%] border border-slate-700 shadow-md">
                    <p className="whitespace-pre-line leading-relaxed text-slate-200">
                      {currentTemplate.sampleInteractions[0]?.bot}
                    </p>
                    <span className="text-[9px] text-slate-400 block text-right mt-1">10:42 AM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Business Superpowers for this Niche */}
            <div className="space-y-4">
              <div className="inline-block px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                {currentTemplate.badge}
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {currentTemplate.tagline}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {currentTemplate.shortDesc}
              </p>

              <div className="space-y-2 pt-1">
                {currentTemplate.quickQuestions.slice(0, 3).map((q, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white p-2 rounded-xl border border-slate-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">&ldquo;{q}&rdquo;</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => onOpenWizard(selectedNiche)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-[5px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all"
              >
                <span>Launch {currentTemplate.title} Onboarding</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
