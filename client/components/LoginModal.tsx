"use client";

import React, { useState } from "react";
import { 
  Lock, 
  Globe, 
  ArrowRight, 
  X, 
  Building2, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { BusinessAccount } from "@/lib/types";
import { MessageApiClient } from "@/lib/api";
import { loginAccount } from "@/lib/storage";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (account: BusinessAccount) => void;
  onSwitchToRegister?: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
}: LoginModalProps) {
  const [domain, setDomain] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!cleanDomain) {
      setError("Please enter your company domain name (e.g. apollopharmacy.com)");
      return;
    }
    if (!password) {
      setError("Please enter your account password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await MessageApiClient.login({
        domain: cleanDomain,
        password
      });

      if (res.account) {
        const fullAccount: BusinessAccount = {
          ...res.account,
          domain: cleanDomain
        };
        loginAccount(fullAccount, res.token, cleanDomain);
        onLoginSuccess(fullAccount);
        onClose();
      } else {
        throw new Error("Unable to retrieve account details");
      }
    } catch (err: any) {
      setError(err.message || "Invalid company domain or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Modal Top Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Business Account Login</h3>
              <p className="text-xs text-slate-400">Isolated workspace by company domain</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[5px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Company Domain Name *
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. apollo-care.com or mygym.in"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono transition-all"
                autoFocus
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Every business has a unique domain name used as its primary workspace identifier.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Account Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono transition-all"
              />
            </div>
            <p className="text-[10px] text-slate-500">
              Your confidential password protects your WhatsApp sessions and RAG vectors.
            </p>
          </div>



          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[5px] bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Logging in...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {onSwitchToRegister && (
              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">Don&apos;t have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToRegister();
                  }}
                  className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  Create New Account
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
