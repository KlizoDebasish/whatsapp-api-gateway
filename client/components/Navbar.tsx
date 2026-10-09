"use client";

import React, { useState } from "react";
import { 
  MessageSquare, 
  Sparkles, 
  Plus, 
  Menu, 
  X,
  LayoutDashboard,
  Home,
  LogIn
} from "lucide-react";
import { BusinessAccount, BusinessCategory } from "@/lib/types";

interface NavbarProps {
  onOpenWizard: (cat?: BusinessCategory) => void;
  onOpenLogin?: () => void;
  activeAccount?: BusinessAccount | null;
  currentView?: "landing" | "workspace";
  onGoToDashboard?: () => void;
  onBackToLanding?: () => void;
}

export default function Navbar({ 
  onOpenWizard,
  onOpenLogin,
  activeAccount,
  currentView = "landing",
  onGoToDashboard,
  onBackToLanding
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => {
              if (onBackToLanding) {
                onBackToLanding();
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-blue-600 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 tracking-tight text-xl leading-none">MsgNexa</span>
              <span className="text-[10px] font-semibold tracking-wider text-slate-500 leading-tight mt-0.5">
                Connect. Automate. Scale.
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {currentView === "landing" ? (
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => {
                  const el = document.getElementById("features");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors rounded-[5px]"
              >
                How It Works
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("businesses");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors rounded-[5px]"
              >
                Use Cases &amp; Niches
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("demo-simulator");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5 rounded-[5px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Live Simulator</span>
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("roi-calculator");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors rounded-[5px]"
              >
                Zero-Cost ROI
              </button>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-4">
              <button
                onClick={onBackToLanding}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                <Home className="w-4 h-4" />
                <span>Home Landing</span>
              </button>
            </nav>
          )}

          {/* Right Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            {activeAccount ? (
              /* Authenticated User: ONLY Dashboard button (No Sign In, No Get Started) */
              onGoToDashboard && (
                <button
                  onClick={onGoToDashboard}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[5px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer group"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span>Dashboard ({activeAccount.businessName})</span>
                </button>
              )
            ) : (
              /* Unauthenticated: Show Sign In + Get Started (No Dashboard) */
              <>
                {onOpenLogin && (
                  <button
                    onClick={onOpenLogin}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-[5px] border border-slate-300 hover:border-emerald-500 hover:bg-slate-50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sign In</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenWizard()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[5px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            {activeAccount ? (
              /* Authenticated Mobile: ONLY Dashboard button */
              onGoToDashboard && (
                <button
                  onClick={onGoToDashboard}
                  className="px-3 py-1.5 rounded-[5px] bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3 h-3 text-emerald-400" />
                  <span>Dashboard</span>
                </button>
              )
            ) : (
              /* Unauthenticated Mobile: Sign In + Get Started */
              <>
                {onOpenLogin && (
                  <button
                    onClick={onOpenLogin}
                    className="px-2.5 py-1.5 rounded-[5px] border border-slate-300 text-slate-700 text-[11px] font-bold"
                  >
                    Sign In
                  </button>
                )}
                <button
                  onClick={() => onOpenWizard()}
                  className="px-3 py-1.5 rounded-[5px] bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-[5px] text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-2 bg-white px-2">
            {!activeAccount && onOpenLogin && (
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-[5px] flex items-center gap-2"
              >
                <LogIn className="w-4 h-4 text-emerald-600" />
                <span>Sign In (Company Domain)</span>
              </button>
            )}
            {currentView === "workspace" ? (
              <button
                onClick={() => {
                  if (onBackToLanding) onBackToLanding();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-[5px] flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home Landing</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    const el = document.getElementById("features");
                    el?.scrollIntoView({ behavior: "smooth" });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-[5px]"
                >
                  How It Works
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("businesses");
                    el?.scrollIntoView({ behavior: "smooth" });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-[5px]"
                >
                  Use Cases &amp; Niches
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("demo-simulator");
                    el?.scrollIntoView({ behavior: "smooth" });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-[5px]"
                >
                  Live Simulator
                </button>
              </>
            )}

            {activeAccount ? (
              onGoToDashboard && (
                <button
                  onClick={() => {
                    onGoToDashboard();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-[5px] flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                  <span>Go to {activeAccount.businessName} Dashboard</span>
                </button>
              )
            ) : (
              <button
                onClick={() => {
                  onOpenWizard();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-[5px] flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Business Account</span>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
