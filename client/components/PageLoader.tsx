"use client";

import React from "react";
import { 
  Pill, 
  Dumbbell, 
  ShoppingCart, 
  Tv, 
  Utensils, 
  Scissors, 
  Briefcase, 
  Sparkles,
  Globe,
  LucideIcon
} from "lucide-react";
import { BusinessCategory } from "@/lib/types";

interface PageLoaderProps {
  category?: BusinessCategory;
  businessName?: string;
  domain?: string;
  message?: string;
  durationMs?: number;
}

const CATEGORY_ICONS: Record<BusinessCategory, { icon: LucideIcon; label: string; gradient: string }> = {
  gym: {
    icon: Dumbbell,
    label: "Gym & Fitness Club",
    gradient: "from-cyan-500 via-teal-500 to-blue-600"
  },
  medicine: {
    icon: Pill,
    label: "Medicine & Pharmacy Shop",
    gradient: "from-teal-500 via-teal-600 to-blue-600"
  },
  grocery: {
    icon: ShoppingCart,
    label: "Grocery & Supermarket",
    gradient: "from-emerald-500 via-teal-500 to-blue-600"
  },
  electronics: {
    icon: Tv,
    label: "Electronics & Tech Outlet",
    gradient: "from-teal-500 via-blue-600 to-indigo-600"
  },
  restaurant: {
    icon: Utensils,
    label: "Restaurant & Cloud Kitchen",
    gradient: "from-teal-600 via-teal-500 to-blue-600"
  },
  salon: {
    icon: Scissors,
    label: "Salon & Spa Care",
    gradient: "from-teal-500 via-teal-600 to-blue-600"
  },
  custom: {
    icon: Briefcase,
    label: "Enterprise Business Gateway",
    gradient: "from-teal-500 via-teal-600 to-blue-600"
  }
};

export default function PageLoader({
  category = "custom",
  businessName,
  domain,
  message = "Opening workspace...",
  durationMs = 3000
}: PageLoaderProps) {
  const [mounted, setMounted] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [storedInfo, setStoredInfo] = React.useState<{ category?: BusinessCategory; name?: string; domain?: string }>({});

  React.useEffect(() => {
    setMounted(true);

    // Read stored account from localStorage as fallback for immediate brand recognition
    try {
      const activeId = localStorage.getItem("messageapi_active_account_id_v2");
      const rawAccounts = localStorage.getItem("messageapi_business_accounts_v2");
      if (rawAccounts && activeId) {
        const parsed = JSON.parse(rawAccounts);
        const acc = parsed.find((a: any) => a.id === activeId);
        if (acc) {
          setStoredInfo({
            category: acc.category,
            name: acc.businessName,
            domain: acc.domain
          });
        }
      }
    } catch (e) {}

    // Smoothly increment progress to reach 100% across durationMs (3 seconds)
    const stepMs = 30;
    const increment = 100 / (durationMs / stepMs);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + increment);
      });
    }, stepMs);

    return () => clearInterval(interval);
  }, [durationMs]);

  // During SSR and the initial client frame, use default category to guarantee 100% deterministic hydration
  const resolvedCategory = (category && category !== "custom") ? category : (storedInfo.category || category || "custom");
  const effectiveCategory = mounted ? resolvedCategory : "custom";
  const config = CATEGORY_ICONS[effectiveCategory] || CATEGORY_ICONS.custom;
  const CategoryIcon = config.icon;
  const displayName = mounted ? (businessName || storedInfo.name) : undefined;
  const displayDomain = mounted ? (domain || storedInfo.domain) : undefined;

  return (
    <div 
      suppressHydrationWarning 
      className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-teal-500 selection:text-white"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 w-96 h-96 bg-teal-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center space-y-5 max-w-sm">
        {/* Animated Badge Container matching QR section */}
        <div className="relative">
          {/* Ambient Glow */}
          <div 
            className={`absolute -inset-4 rounded-3xl bg-gradient-to-tr ${config.gradient} opacity-40 blur-xl animate-pulse`} 
          />

          {/* Subtle Outer Spinner Ring */}
          <div 
            className="absolute -inset-3 rounded-2xl border-2 border-dashed border-teal-500/30 animate-spin" 
            style={{ animationDuration: "14s" }} 
          />

          {/* The Exact Category Badge from QR Section */}
          <div 
            className={`relative w-20 h-20 rounded-2xl bg-gradient-to-tr ${config.gradient} flex items-center justify-center text-white shadow-2xl border-2 border-white/20 shadow-teal-500/30 transform transition-transform`}
          >
            <CategoryIcon className="w-10 h-10 text-white animate-pulse" />
          </div>
        </div>

        {/* Business and Category Details */}
        <div className="space-y-1.5 pt-2">
          {displayName && (
            <h3 className="text-lg font-black text-white tracking-tight">
              {displayName}
            </h3>
          )}

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/10 border border-teal-500/30 text-teal-300">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-ping" />
              <span>{config.label}</span>
            </span>

            {displayDomain && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono text-slate-400 bg-slate-900 border border-slate-800">
                <Globe className="w-3 h-3 text-slate-500" />
                <span>{displayDomain}</span>
              </span>
            )}
          </div>
        </div>

        {/* Loading Indicator & Progress Bar */}
        <div className="space-y-2.5 pt-1 w-full flex flex-col items-center">
          <p className="text-xs font-semibold text-slate-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-spin" style={{ animationDuration: "3s" }} />
            <span>{message}</span>
            <span className="text-[10px] font-mono text-teal-400 font-bold">
              {Math.min(100, Math.round(progress))}%
            </span>
          </p>

          {/* Glowing Animated Loading Bar */}
          <div className="w-56 h-1.5 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div 
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-teal-400 via-emerald-400 to-blue-500 rounded-full transition-all duration-75 ease-out shadow-sm shadow-teal-400/50" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
