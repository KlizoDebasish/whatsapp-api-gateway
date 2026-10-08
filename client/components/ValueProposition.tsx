"use client";

import React from "react";
import { 
  Check, 
  X, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Bot, 
  Smartphone, 
  ArrowRight
} from "lucide-react";

interface ValueProps {
  onOpenWizard: () => void;
}

export default function ValueProposition({ onOpenWizard }: ValueProps) {
  return (
    <section id="features" className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <Zap className="w-3.5 h-3.5" />
            <span>The Reality & Core Value</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Why Modern Businesses Are Switching to MessageAPI
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Traditional WhatsApp Business APIs charge exorbitant fees per conversation and lock you in rigid template approvals. MessageAPI gives you complete freedom, zero bills, and true AI intelligence.
          </p>
        </div>

        {/* Comparison Table / Cards: Official Cloud API vs MessageAPI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left: Traditional Official Cloud API (The Pain) */}
          <div className="bg-rose-50/50 rounded-3xl border border-rose-200 p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-rose-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Official Meta Cloud API</h3>
                  <p className="text-xs text-rose-700 font-semibold">Expensive & Bureaucratic</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-rose-200 text-rose-900 text-xs font-extrabold">
                  $$$ Expensive
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span><strong>$0.04 to $0.08 per conversation:</strong> A medicine shop or gym with 5,000 monthly chats pays $250–$400/month just for messages.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Strict Template Rejections:</strong> Every marketing message, offer, or catalog alert must be pre-approved by Meta bots.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Weeks of Business Verification:</strong> Requires company registration documents, utility bills, and Facebook Business Manager audits.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <span><strong>No Built-in ERP or Voice AI:</strong> You must write complex backend servers to connect stock databases or transcribe voice notes.</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-rose-200 text-xs text-rose-900">
              <p className="font-bold">❌ Result:</p>
              <p className="text-slate-600 mt-0.5">High operational bills, complex setup, and rigid restrictions on what you can say to your customers.</p>
            </div>
          </div>

          {/* Right: MessageAPI Gateway (The Solution) */}
          <div className="bg-gradient-to-b from-emerald-50/70 to-teal-50/40 rounded-3xl border-2 border-emerald-500 p-8 space-y-6 shadow-xl shadow-emerald-500/10 flex flex-col justify-between relative">
            <div className="absolute -top-3.5 right-8 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black shadow-md uppercase tracking-wider">
              Recommended Choice
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-emerald-200">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">MessageAPI Enterprise Gateway</h3>
                  <p className="text-xs text-emerald-700 font-semibold">Open • Autonomous AI</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 text-xs font-extrabold">
                  Zero Per-Message Fees
                </span>
              </div>

              <ul className="space-y-3.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>$0.00 Per-Message Fees:</strong> Run unlimited 1-on-1 customer chats, product inquiries, and automated orders with zero billing.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Anti-Ban 1–30s Human Typing Pacing:</strong> Simulates realistic human typing cadences and pauses to protect your WhatsApp number from bans.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Instant 1-Click QR Pairing:</strong> Pair your WhatsApp number in 10 seconds just like WhatsApp Web. No Facebook audits required.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Multimodal Voice & Vision ERP:</strong> Customers can send voice notes or prescription/product photos and receive instant inventory answers!</span>
                </li>
              </ul>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-emerald-200 text-xs text-emerald-900 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-emerald-800">✅ Complete Independence:</p>
                  <p className="text-slate-600 mt-0.5">Full control of your customer data, custom business catalog, and real-time webhooks.</p>
                </div>
                <button
                  onClick={onOpenWizard}
                  className="px-5 py-3 rounded-[5px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>Start Free</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Anti-Ban Pacing Engine</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Safe randomized 1s to 30s delays with automatic typing indicators mimic natural human behavior.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">AI Voice & Image Catalog</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transcribes audio notes and scans prescription or product images to find real-time stock and prices.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Chat-Level API Scopes</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate isolated API keys restricted to specific numbers or groups so sub-agents cannot access other chats.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Multi-Account Gateway</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Run multiple WhatsApp business numbers concurrently from a single dashboard with persistent cloud sessions.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
