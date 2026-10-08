"use client";

import React, { useState } from "react";
import { 
  Globe, 
  Store, 
  Dumbbell, 
  ShoppingBag, 
  Building2, 
  GraduationCap, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Bot, 
  Send,
  LucideIcon
} from "lucide-react";
import { BusinessCategory } from "@/lib/types";

interface NicheShowcaseProps {
  onOpenWizard: (category?: BusinessCategory) => void;
}

export default function BusinessNicheShowcase({ onOpenWizard }: NicheShowcaseProps) {
  const [activeNiche, setActiveNiche] = useState<string>("universal");

  const categories: {
    id: string;
    categoryKey: BusinessCategory;
    label: string;
    icon: LucideIcon;
    badge: string;
    title: string;
    tagline: string;
    shortDesc: string;
    benefits: string[];
    quickQuestions: string[];
    sampleUser: string;
    sampleBot: string;
  }[] = [
    {
      id: "universal",
      categoryKey: "custom",
      label: "✨ Any Business / Product / Company",
      icon: Globe,
      badge: "Universal Compatibility",
      title: "Universal Business & Product Engine",
      tagline: "Engage customers, provide instant quotes & answer inquiries 24/7 on WhatsApp",
      shortDesc: "Built for any company, product owner, agency, or store to automate customer support, product catalogs, and order management effortlessly.",
      benefits: [
        "Plug in any product catalog, price list, service rate card, or custom FAQs in 60 seconds",
        "Engage customers in natural language, voice audio notes, or image attachments",
        "Safe Anti-Ban pacing (1–30s typing delay) keeps your number protected and authentic",
        "Webhook triggers into your existing website, database, or CRM seamlessly"
      ],
      quickQuestions: [
        "What services or products do you offer?",
        "How can I check pricing and get a quote?",
        "What are your business operating hours?",
        "Can I speak with a human support agent?"
      ],
      sampleUser: "Hi! Can you share your product catalog, prices, and how to order?",
      sampleBot: "👋 Welcome! Here is our current catalog and pricing overview. Let us know which item or service you need, and we will share full details and delivery options instantly! 🚀"
    },
    {
      id: "retail",
      categoryKey: "medicine",
      label: "🏪 Physical Stores & Outlets",
      icon: Store,
      badge: "Pharmacies, Groceries, Electronics & Retail",
      title: "Local Retailers & Storefronts",
      tagline: "Instant stock availability, prescription scanning & home delivery orders",
      shortDesc: "Whether you run a medicine shop, grocery supermarket, or electronics outlet — let customers check live stock and place orders in seconds.",
      benefits: [
        "Real-time SQLite & MongoDB stock inventory checks (prices, units, availability)",
        "Customers can snap a photo of a prescription or grocery list for instant billing",
        "Automated pickup or home delivery confirmation with customer address collection",
        "Digital invoices and receipt dispatch directly inside the WhatsApp chat"
      ],
      quickQuestions: [
        "Is Paracetamol 650mg in stock right now?",
        "What is the price of 5kg Basmati Rice?",
        "Do you have Wireless Mechanical Keyboards?",
        "Can I send a photo of my prescription?"
      ],
      sampleUser: "Do you have Paracetamol 650 and 5kg Rice in stock?",
      sampleBot: "✅ Both items are in stock! *Paracetamol 650* (₹32.00/strip) & *Fortune Basmati Rice 5kg* (₹495.00). Total: *₹527.00*. Reply with your delivery address to dispatch within 45 mins! 🚚"
    },
    {
      id: "services",
      categoryKey: "gym",
      label: "💼 Services, Fitness & Clinics",
      icon: Dumbbell,
      badge: "Gyms, Salons, Clinics & Service Centers",
      title: "Service Providers & Wellness Centers",
      tagline: "Automate membership plans, slot bookings, trainer schedules & service menus",
      shortDesc: "Empower gyms, salons, healthcare clinics, and repair centers to handle appointment bookings and service inquiries automatically.",
      benefits: [
        "Instant membership plan rate cards (Monthly, Quarterly, Annual VIP)",
        "Self-service trial appointment booking & personal trainer time slots",
        "Grooming service menus, beauty packages, and doctor availability alerts",
        "Supplement, protein powder, or product inventory queries"
      ],
      quickQuestions: [
        "What are your 3-month gym membership fees?",
        "Can I book a salon appointment for tomorrow?",
        "What are your evening fitness batch timings?",
        "Do you have Whey Protein Isolate in stock?"
      ],
      sampleUser: "What are your membership fees and timings?",
      sampleBot: "💪 *Membership Plans at Our Studio:*\n• *Monthly Pass:* ₹1,499/mo\n• *Quarterly (3 Mo):* ₹3,899 (Save 15%)\n• *Annual VIP:* ₹12,999\n\nTimings: 06:00 AM - 10:00 PM. Would you like a *Free 1-Day Trial Pass* today?"
    },
    {
      id: "ecommerce",
      categoryKey: "custom",
      label: "🛍️ E-Commerce & Online Brands",
      icon: ShoppingBag,
      badge: "Shopify, D2C & Marketplace Sellers",
      title: "E-Commerce & Digital Products",
      tagline: "98% open rates for product alerts, cart recovery & order updates",
      shortDesc: "Direct-to-consumer brands and online merchants turn WhatsApp into an automated sales and tracking channel with zero per-message fees.",
      benefits: [
        "Instant answer to 'What is the price, sizes available, and shipping time?'",
        "Recover abandoned checkouts and share direct payment links",
        "Real-time courier tracking and delivery dispatch alerts",
        "Instant exchange and return request handling"
      ],
      quickQuestions: [
        "Is this item available for delivery to my pincode?",
        "What is the return and replacement policy?",
        "Can I pay Cash on Delivery (COD)?",
        "Where is my order #ORD-9002 right now?"
      ],
      sampleUser: "Is the Wireless Keyboard in stock and when can it be delivered?",
      sampleBot: "📦 In stock (*14 units left*)! Price: *₹2,499.00* with 1-Year Warranty. Estimated delivery to your location is *2 business days*. Reply with your delivery address to confirm! ⚡"
    },
    {
      id: "b2b",
      categoryKey: "custom",
      label: "🏢 B2B Startups & Agencies",
      icon: Building2,
      badge: "Agencies, SaaS & Enterprise B2B",
      title: "B2B Companies, Agencies & SaaS",
      tagline: "Automated lead qualification, meeting scheduling & 24/7 client support",
      shortDesc: "Marketing agencies, software companies, and consulting firms automate lead capture, client onboarding, and CRM updates on WhatsApp.",
      benefits: [
        "Instant lead qualification and automated demo scheduling with sales reps",
        "Webhook triggers into your existing CRM, database, or Slack channels",
        "High-security chat-level permissions and tokenized API access scopes",
        "24/7 client support ticket logging without human rep burnout"
      ],
      quickQuestions: [
        "What are your agency services and pricing tiers?",
        "Can we schedule a 15-minute discovery demo?",
        "How do you integrate with our existing CRM?",
        "What is the average turnaround time for projects?"
      ],
      sampleUser: "We need custom API integration for our app. Can we schedule a demo?",
      sampleBot: "🏢 Welcome! We provide full enterprise integration. Our technical team is available today at *3:00 PM* or *5:30 PM* for a 15-min discovery call. Which time suits you best?"
    },
    {
      id: "education",
      categoryKey: "custom",
      label: "🎓 Education, Coaching & Creators",
      icon: GraduationCap,
      badge: "Coaching Classes, Tutors & Creators",
      title: "Educational Institutes & Tutors",
      tagline: "Course syllabus sharing, batch registrations & instant fee alerts",
      shortDesc: "Coaching institutes, private tutors, and course creators handle admission queries and timetable schedules without manual typing.",
      benefits: [
        "Instant course syllabus, fee structure, and batch schedule sharing",
        "New student registration & demo class appointment booking",
        "Exam date alerts, attendance notices, and fee payment receipts",
        "Zero manual staff overhead answering repetitive admission questions"
      ],
      quickQuestions: [
        "Can you send the complete syllabus and fees?",
        "What are the upcoming batch timings?",
        "Can I book a free demo trial class?",
        "Are online live sessions recorded?"
      ],
      sampleUser: "Can you send the syllabus and fee structure for the new batch?",
      sampleBot: "🎓 New batch starts this Monday! Total 12 weeks with live projects & certification. Fee: *₹6,500*. Reply *'DEMO'* to reserve your seat in tomorrow's free orientation session!"
    }
  ];

  const currentCategory = categories.find((c) => c.id === activeNiche) || categories[0];

  return (
    <section id="businesses" className="py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Universal Business Engagement</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Seamless WhatsApp Workflows For Any Business, Brand Or Product
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            MessageAPI is engineered to work universally. Whether you sell physical goods, offer professional services, run a local shop, manage an e-commerce store, or build software — our platform makes your customer engagement smooth, automated, and user-friendly.
          </p>
        </div>

        {/* Navigation Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeNiche === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveNiche(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[5px] text-xs font-bold transition-all border ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 scale-105"
                    : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 shadow-xs"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Deep-Dive Feature Card for Selected Category */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Capabilities & Benefits */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
                  {currentCategory.badge}
                </span>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {currentCategory.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {currentCategory.shortDesc}
                </p>
              </div>

              {/* Core Workflows */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  How MessageAPI Powers This Workflow:
                </p>

                <div className="space-y-2 text-xs">
                  {currentCategory.benefits.map((b, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-semibold text-slate-800"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Launch CTA */}
              <button
                onClick={() => onOpenWizard(currentCategory.categoryKey)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-[5px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02]"
              >
                <span>Setup Your {currentCategory.title} Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Live MessageAPI Console Simulation Frame */}
            <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-800 space-y-4">
              {/* MessageAPI Console Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[5px] bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {currentCategory.title.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white truncate max-w-[200px]">{currentCategory.title}</h4>
                    <p className="text-[10px] text-emerald-400 font-medium">MessageAPI Autonomous Engine • Online</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-[5px] bg-slate-800 text-emerald-400 border border-slate-700 font-bold">
                  MessageAPI Verified
                </span>
              </div>

              {/* Chat Thread */}
              <div className="space-y-4 py-2 min-h-[260px] flex flex-col justify-center text-xs">
                {/* Outbound Customer Message */}
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3.5 rounded-2xl rounded-tr-xs max-w-[85%] shadow-md">
                    <p>{currentCategory.sampleUser}</p>
                    <span className="text-[9px] text-emerald-200 block text-right mt-1">11:05 AM ✓✓</span>
                  </div>
                </div>

                {/* Inbound AI Response */}
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-100 p-4 rounded-2xl rounded-tl-xs max-w-[90%] border border-slate-700 shadow-md space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                      <Bot className="w-3.5 h-3.5" />
                      <span>MessageAPI Assistant</span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed text-slate-200">
                      {currentCategory.sampleBot}
                    </p>
                    <span className="text-[9px] text-slate-400 block text-right mt-1">11:05 AM</span>
                  </div>
                </div>
              </div>

              {/* Mock Chat Input Footer */}
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <div className="flex-1 bg-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 border border-slate-700">
                  Ask about stock, price, or booking...
                </div>
                <div className="w-9 h-9 rounded-[5px] bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-sm">
                  <Send className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
