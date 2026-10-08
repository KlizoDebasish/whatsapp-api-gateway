"use client";

import React, { useState } from "react";
import { 
  Pill, 
  Dumbbell, 
  ShoppingCart, 
  Tv, 
  Utensils, 
  Scissors, 
  Briefcase,
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Store, 
  CheckCircle2,
  X,
  LucideIcon
} from "lucide-react";
import { BusinessCategory, BUSINESS_TEMPLATES, BusinessAccount } from "@/lib/types";
import { createBusinessAccount, loginAccount } from "@/lib/storage";
import { MessageApiClient } from "@/lib/api";

interface WizardProps {
  initialCategory?: BusinessCategory;
  isOpen: boolean;
  onClose: () => void;
  onAccountCreated: (account: BusinessAccount) => void;
}

function getDefaultBusinessName(cat: BusinessCategory): string {
  if (cat === "medicine") return "City Care Pharmacy & Meds";
  if (cat === "gym") return "PowerFit Gym & Studio";
  if (cat === "grocery") return "DailyFresh Supermarket";
  if (cat === "electronics") return "TechHub Electronics";
  if (cat === "restaurant") return "Spice Bistro & Kitchen";
  if (cat === "salon") return "Glamour Beauty & Spa";
  return "Apex Business Solutions";
}

function toDefaultDomain(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${clean || "mybusiness"}.com`;
}

export default function BusinessSetupWizard({
  initialCategory = "medicine",
  isOpen,
  onClose,
  onAccountCreated,
}: WizardProps) {
  const [step, setStep] = useState<number>(1);
  const [category, setCategory] = useState<BusinessCategory>(initialCategory);

  // Form Fields
  const [businessName, setBusinessName] = useState(() => getDefaultBusinessName(initialCategory));
  const [domain, setDomain] = useState(() => toDefaultDomain(getDefaultBusinessName(initialCategory)));
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [currency, setCurrency] = useState("₹");
  const [workingHours, setWorkingHours] = useState("08:00 AM - 10:00 PM");

  // AI & Safety Settings
  const [greetingMessage, setGreetingMessage] = useState(() => {
    const t = BUSINESS_TEMPLATES[initialCategory] || BUSINESS_TEMPLATES.custom;
    return t.defaultGreeting.replace("{BusinessName}", getDefaultBusinessName(initialCategory));
  });
  const [aiPrompt, setAiPrompt] = useState(() => {
    const t = BUSINESS_TEMPLATES[initialCategory] || BUSINESS_TEMPLATES.custom;
    return t.defaultPrompt.replace("{BusinessName}", getDefaultBusinessName(initialCategory));
  });
  const enableStockQueries = true;

  // Loading / Finished state
  const [createdAccount, setCreatedAccount] = useState<BusinessAccount | null>(null);

  if (!isOpen) return null;

  const categories: { id: BusinessCategory; label: string; icon: LucideIcon; desc: string; color: string }[] = [
    { id: "medicine", label: "Medicine & Pharmacy Shop", icon: Pill, desc: "Prescriptions, medicine availability, dosage & health refills", color: "text-emerald-600 bg-emerald-50 border-emerald-300" },
    { id: "gym", label: "Gym & Fitness Club", icon: Dumbbell, desc: "Membership plans, trainer bookings, supplements & batch schedules", color: "text-blue-600 bg-blue-50 border-blue-300" },
    { id: "grocery", label: "Grocery & Supermarket", icon: ShoppingCart, desc: "Daily groceries, vegetable stock, instant cart total & delivery", color: "text-amber-600 bg-amber-50 border-amber-300" },
    { id: "electronics", label: "Electronics & Gadgets Shop", icon: Tv, desc: "Device specs, live stock, warranty checks & invoices", color: "text-indigo-600 bg-indigo-50 border-indigo-300" },
    { id: "restaurant", label: "Restaurant / Cafe", icon: Utensils, desc: "Digital menu, table reservation & food orders", color: "text-rose-600 bg-rose-50 border-rose-300" },
    { id: "salon", label: "Salon & Spa Care", icon: Scissors, desc: "Service rate cards, stylist appointment booking", color: "text-purple-600 bg-purple-50 border-purple-300" },
    { id: "custom", label: "Custom Business / Agency", icon: Briefcase, desc: "Universal AI bot for any shop, clinic, or consulting firm", color: "text-slate-600 bg-slate-100 border-slate-300" },
  ];

  const handleSelectCategory = (catId: BusinessCategory) => {
    setCategory(catId);
    const t = BUSINESS_TEMPLATES[catId] || BUSINESS_TEMPLATES.custom;
    const defaultName = getDefaultBusinessName(catId);
    setBusinessName(defaultName);
    setDomain(toDefaultDomain(defaultName));
    setGreetingMessage(t.defaultGreeting.replace("{BusinessName}", defaultName));
    setAiPrompt(t.defaultPrompt.replace("{BusinessName}", defaultName));
  };

  const handleCompleteSetup = async () => {
    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!cleanDomain) {
      setSubmitError("Company domain name is required (e.g. apollopharmacy.com)");
      setStep(2);
      return;
    }
    if (!password || password.length < 6) {
      setSubmitError("Password must be at least 6 characters long");
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    const template = BUSINESS_TEMPLATES[category] || BUSINESS_TEMPLATES.custom;

    try {
      const res = await MessageApiClient.register({
        domain: cleanDomain,
        password,
        businessName: businessName || template.title,
        category,
        categoryLabel: template.title,
        ownerName: ownerName || "Store Owner",
        phone: phone || "+91 98765 43210",
        email,
        address,
        currency,
        workingHours,
        greetingMessage: greetingMessage || template.defaultGreeting,
        aiPersonaPrompt: aiPrompt || template.defaultPrompt
      });

      const newAcc: BusinessAccount = {
        ...res.account,
        domain: cleanDomain,
        catalog: res.account?.catalog && res.account.catalog.length > 0 ? res.account.catalog : [...template.sampleCatalog]
      };

      loginAccount(newAcc, res.token, cleanDomain);
      setCreatedAccount(newAcc);
      setStep(4);
    } catch (err: any) {
      console.warn("Backend register error, fallback to local creation:", err.message);
      const newAcc = createBusinessAccount({
        businessName: businessName || `${template.title}`,
        category,
        ownerName: ownerName || "Store Owner",
        phone: phone || "+91 98765 43210",
        email,
        address,
        currency,
        workingHours,
        greetingMessage: greetingMessage || template.defaultGreeting,
        aiPersonaPrompt: aiPrompt || template.defaultPrompt,
        antiBanDelay: { min: 8, max: 18, typingSimulation: true, typingSpeedWpm: 60 },
        enableAi: true,
        enableStockQueries,
        catalog: [...template.sampleCatalog]
      });
      newAcc.domain = cleanDomain;
      loginAccount(newAcc, undefined, cleanDomain);
      setCreatedAccount(newAcc);
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Wizard Top Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Create Your Business WhatsApp Account</h3>
              <p className="text-xs text-slate-400">Step {step} of 4 • Instant Setup</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-[5px] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Progress Bar */}
        <div className="bg-slate-100 h-1.5 w-full">
          <div
            className="bg-emerald-600 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Wizard Body Content */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {/* STEP 1: Select Business Category */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <h4 className="text-xl font-black text-slate-900">What type of business do you own?</h4>
                <p className="text-xs text-slate-600">
                  Select your industry to automatically load tailored inventory items, greetings, and AI rules.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => handleSelectCategory(cat.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                        isSelected
                          ? "border-emerald-600 bg-emerald-50/50 shadow-md scale-[1.02]"
                          : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${cat.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                            <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      <div>
                        <h5 className="text-xs font-black text-slate-900">{cat.label}</h5>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{cat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Business Profile Information */}
          {step === 2 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h4 className="text-xl font-black text-slate-900">Store Profile & Login Credentials</h4>
                <p className="text-xs text-slate-600">
                  Provide your business credentials to uniquely isolate your account data, sessions, and documents.
                </p>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{submitError}</span>
                </div>
              )}

              {/* Login Credentials & Domain Section */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/50 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-800 font-black text-xs flex items-center gap-1.5">
                    <span>🔐</span> Account Authentication &amp; Domain Isolation
                  </span>
                  <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">Required for Login</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-bold text-slate-800">
                      Company Domain Name * <span className="text-[10px] text-slate-500 font-normal">(Login ID)</span>
                    </label>
                    <input
                      type="text"
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="e.g. apollopharmacy.com"
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Unique primary key used to retrieve only your account sessions and chats.</p>
                  </div>

                  <div>
                    <label className="block mb-1 font-bold text-slate-800">
                      Account Password * <span className="text-[10px] text-slate-500 font-normal">(Min 6 chars)</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Used to log into your dashboard and authenticate settings updates.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 font-bold text-slate-800">Business / Store Name *</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        setDomain(toDefaultDomain(e.target.value));
                      }}
                      placeholder="e.g. Lifeline Pharmacy & Meds"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 font-bold text-slate-800">Owner / Manager Name</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Dr. Rajesh Sharma"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 font-bold text-slate-800">WhatsApp Phone Number *</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 font-bold text-slate-800">Support Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. orders@mybusiness.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 font-bold text-slate-800">Store Address / Location</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Shop 12, City Center Mall, Main Road"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1.5 font-bold text-slate-800">Working / Operating Hours</label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      placeholder="e.g. 08:00 AM - 10:00 PM"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 font-bold text-slate-800">Store Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="₹">₹ (INR - Indian Rupee)</option>
                      <option value="$">$ (USD - US Dollar)</option>
                      <option value="৳">৳ (BDT - Bangladeshi Taka)</option>
                      <option value="€">€ (EUR - Euro)</option>
                      <option value="£">£ (GBP - British Pound)</option>
                      <option value="AED">AED (UAE Dirham)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AI Assistant Persona */}
          {step === 3 && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h4 className="text-xl font-black text-slate-900">AI Assistant Persona</h4>
                <p className="text-xs text-slate-600">
                  Customize how your automated WhatsApp assistant talks to customers.
                </p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1.5 font-bold text-slate-800">Automatic Welcome / Greeting Message</label>
                  <textarea
                    rows={3}
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">This message is sent when a customer greets or contacts your store.</p>
                </div>

                <div>
                  <label className="block mb-1.5 font-bold text-slate-800">AI System Persona Prompt</label>
                  <textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Account Created & QR Connect */}
          {step === 4 && createdAccount && (
            <div className="space-y-6 text-center max-w-xl mx-auto py-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <h4 className="text-2xl font-black text-slate-900">🎉 Business Account Created!</h4>
                <p className="text-xs text-slate-600">
                  Your business workspace <strong>{createdAccount.businessName}</strong> is ready with zero per-message charges.
                </p>
              </div>

              {/* Account Credentials & Token Details Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Company Login Domain:</span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                    {createdAccount.domain || domain}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                  <span className="font-bold text-slate-700">Your Master API Token:</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Active</span>
                </div>
                <div className="p-2.5 bg-slate-900 text-emerald-400 font-mono rounded-xl text-xs overflow-x-auto select-all">
                  {createdAccount.apiKey}
                </div>
                <p className="text-[11px] text-slate-500">
                  You can now log into your dashboard anytime using your company domain <strong>{createdAccount.domain || domain}</strong> and account password.
                </p>
              </div>

              {/* Completion button */}
              <button
                onClick={() => {
                  onAccountCreated(createdAccount);
                  onClose();
                }}
                className="w-full py-3 rounded-[5px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all transform hover:scale-[1.02]"
              >
                <span>Done &amp; Go to {createdAccount.businessName} Dashboard →</span>
              </button>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        {step < 4 && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[5px] text-xs font-bold text-slate-600 hover:bg-slate-200 disabled:opacity-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (step === 3) {
                  handleCompleteSetup();
                } else {
                  setStep(step + 1);
                }
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-[5px] bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <span>{isSubmitting ? "Creating Account..." : (step === 3 ? "Finish & Create Account" : "Continue")}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
