"use client";

import React from "react";
import { MessageSquare, ShieldCheck, Sparkles } from "lucide-react";

interface FooterProps {
  onOpenWizard: () => void;
}

export default function Footer({ onOpenWizard }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white font-black text-base">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span>MessageAPI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise-grade, multi-account WhatsApp Gateway & Voice/Text ERP Query Engine for modern businesses.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" />
              <span>Anti-Ban Protected (1–30s Pacing)</span>
            </div>
          </div>

          {/* Col 2: Business Niches */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Business Solutions</h5>
            <ul className="space-y-2">
              <li><a href="#businesses" className="hover:text-emerald-400 transition-colors">Medicine & Pharmacy Shop</a></li>
              <li><a href="#businesses" className="hover:text-emerald-400 transition-colors">Gym & Fitness Club</a></li>
              <li><a href="#businesses" className="hover:text-emerald-400 transition-colors">Grocery & Supermarket</a></li>
              <li><a href="#businesses" className="hover:text-emerald-400 transition-colors">Electronics & Gadgets</a></li>
              <li><a href="#businesses" className="hover:text-emerald-400 transition-colors">Restaurant & Cafe</a></li>
              <li><a href="#businesses" className="hover:text-emerald-400 transition-colors">Salon & Beauty Care</a></li>
            </ul>
          </div>

          {/* Col 3: Developer API */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Developer & Gateway</h5>
            <ul className="space-y-2">
              <li><span className="text-slate-300 font-mono">POST /api/v1/messages/send</span></li>
              <li><span className="text-slate-300 font-mono">POST /api/v1/erp/query</span></li>
              <li><span className="text-slate-300 font-mono">GET /api/v1/sessions/qr</span></li>
              <li><span className="text-slate-300 font-mono">GET /api/v1/events (SSE)</span></li>
              <li><span className="text-slate-300">HMAC-SHA256 Webhooks</span></li>
            </ul>
          </div>

          {/* Col 4: Quick Launch */}
          <div className="space-y-3">
            <h5 className="font-bold text-white text-xs uppercase tracking-wider">Get Started</h5>
            <p className="text-xs text-slate-400">
              Create your business account in 60 seconds with zero credit card or Meta verification fees.
            </p>
            <button
              onClick={onOpenWizard}
              className="w-full py-3 rounded-[5px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Free Account</span>
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p suppressHydrationWarning>© {new Date().getFullYear()} MessageAPI • Free WhatsApp Business Gateway & ERP Assistant.</p>
          <div className="flex items-center gap-4">
            <span>Anti-Ban 1–30s Human Pacing</span>
            <span>•</span>
            <span>Multimodal Vision & Voice</span>
            <span>•</span>
            <span>SQLite & MongoDB Atlas</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
