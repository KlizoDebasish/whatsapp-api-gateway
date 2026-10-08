"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Bot, 
  Store, 
  Dumbbell,
  Building2, 
  ShoppingBag, 
  GraduationCap, 
  Layers,
  Globe,
  Smile,
  Cpu
} from "lucide-react";
import { BusinessCategory } from "@/lib/types";

interface WhyCreatedProps {
  onOpenWizard: (category?: BusinessCategory) => void;
}

export default function WhyWeCreatedSection({ onOpenWizard }: WhyCreatedProps) {
  const [activeSegment, setActiveSegment] = useState<string>("universal");

  const businessSegments = [
    {
      id: "universal",
      title: "✨ Any Business, Product or Company",
      icon: Globe,
      badge: "100% Universal Compatibility",
      color: "from-emerald-600 to-teal-600",
      description: "No matter what you sell, build, or offer — MessageAPI connects your product catalog, booking schedule, or customer support directly to WhatsApp.",
      benefits: [
        "Works seamlessly for ANY product owner, local shop, startup, service agency, or enterprise",
        "Automates repetitive price checks, stock lookups, FAQs, and quote calculations instantly",
        "Engages customers in their favorite everyday app with 98% open rates and zero friction",
        "Supports custom product catalogs, services menus, voice notes, and image attachments"
      ],
      sampleQuery: "Hi! Can you tell me about your products, pricing options, and how to get started?",
      sampleReply: "👋 Welcome to our store! We provide customized solutions and live product assistance. Browse our featured catalog or reply with your specific requirement to receive instant details!"
    },
    {
      id: "retail",
      title: "🏪 Retail Shops & Local Stores",
      icon: Store,
      badge: "Pharmacies, Groceries, Electronics & Retail",
      color: "from-emerald-500 to-teal-600",
      description: "Medicine shops, grocery supermarkets, electronics outlets, apparel boutiques, and hardware stores.",
      benefits: [
        "Instant medicine, grocery, and gadget stock lookups from your live catalog",
        "Customers can snap a photo of a prescription or grocery list for instant billing",
        "Home delivery address collection & dispatch notifications",
        "Digital invoices and receipt dispatch directly to WhatsApp"
      ],
      sampleQuery: "Do you have Paracetamol 650mg and 5kg Basmati Rice in stock right now?",
      sampleReply: "✅ Both items are in stock! Paracetamol (₹32.00) & 5kg Rice (₹495.00). Total: ₹527.00. Reply with your delivery address to dispatch within 45 mins!"
    },
    {
      id: "services",
      title: "💼 Service Providers & Wellness",
      icon: Dumbbell,
      badge: "Gyms, Salons, Clinics & Professionals",
      color: "from-blue-500 to-indigo-600",
      description: "Gyms, fitness clubs, beauty salons, dental clinics, repair shops, and automotive services.",
      benefits: [
        "Automate membership plan inquiries, seasonal discounts, and renewals",
        "Self-service appointment booking & personal trainer time slots",
        "Automated class schedules, grooming rate cards, and service menus",
        "Supplements, protein powders, or beauty products inventory orders"
      ],
      sampleQuery: "What are your 3-month gym membership fees and evening batch timings?",
      sampleReply: "💪 Our 3-Month Transformation Pass is ₹3,899 (includes diet consultation). Evening batches run 05:00 PM to 09:30 PM. Would you like a Free Trial Pass?"
    },
    {
      id: "d2c",
      title: "🛍️ E-Commerce, D2C & Online Brands",
      icon: ShoppingBag,
      badge: "Online Sellers, Creators & D2C",
      color: "from-purple-500 to-pink-600",
      description: "Shopify stores, Instagram brands, direct-to-consumer merchants, and digital product creators.",
      benefits: [
        "98% WhatsApp open rate vs 15% email open rate for product announcements",
        "Instant answer to 'What is the price, sizes available, and delivery time?'",
        "Abandoned cart recovery and payment link sharing via WhatsApp",
        "Real-time courier tracking and return request handling"
      ],
      sampleQuery: "Is the Wireless Gaming Keyboard in Black color available for delivery to Delhi?",
      sampleReply: "📦 Yes! In stock (14 pcs). Delivery to Delhi takes 2 business days. Price is ₹2,499 with 1-Year Warranty. Tap here to confirm order!"
    },
    {
      id: "b2b",
      title: "🏢 B2B Companies, Startups & SaaS",
      icon: Building2,
      badge: "Corporate, Agencies & Tech Startups",
      color: "from-slate-700 to-slate-900",
      description: "Marketing agencies, software companies, consulting firms, real estate, and B2B distributors.",
      benefits: [
        "Instant lead qualification and automated demo scheduling with sales reps",
        "Webhook triggers into your existing CRM, database, or Slack channels",
        "High-security chat-level permissions and tokenized access scopes",
        "24/7 client support ticket logging without keeping human reps on night shift"
      ],
      sampleQuery: "We need an enterprise custom integration. What are your pricing tiers?",
      sampleReply: "🏢 Welcome! We offer flexible plans tailored to your team volume. Our technical lead can host a 15-min discovery call today at 3 PM or 5 PM."
    },
    {
      id: "education",
      title: "🎓 Education, Coaching & Institutes",
      icon: GraduationCap,
      badge: "Coaching Classes, Tutors & Schools",
      color: "from-amber-500 to-orange-600",
      description: "Coaching classes, edtech creators, private tutors, music schools, and vocational institutes.",
      benefits: [
        "Instant course syllabus, fee structure, and batch schedule sharing",
        "New student registration & demo class appointment booking",
        "Exam date alerts, attendance notices, and fee payment receipts",
        "Zero manual staff overhead answering repetitive admission questions"
      ],
      sampleQuery: "Can you send the complete syllabus and fees for the Python & AI Bootcamp?",
      sampleReply: "🎓 Bootcamp starts next Monday! Total 12 weeks with live projects. Fee: ₹6,500. Reply 'DEMO' to attend tomorrow's free orientation session."
    }
  ];

  const currentSegment = businessSegments.find((s) => s.id === activeSegment) || businessSegments[0];

  return (
    <section className="py-20 bg-gradient-to-b from-white via-slate-50 to-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header: The Vision & Universal Purpose */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Universal Business Engagement For All</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Why MessageAPI Was Created:{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Built For Every Business Owner, Product & Company
            </span>
          </h2>

          <p className="text-base text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
            Whether you are an established enterprise, a local shopkeeper, a software creator, a health clinic, a gym trainer, or an online brand — your customers are already on WhatsApp. We created MessageAPI to make customer communication <strong>smoother</strong>, <strong>frictionless</strong>, <strong>user-friendly</strong>, and <strong>100% automated</strong> without technical headaches or expensive per-message fees.
          </p>
        </div>

        {/* 4 Core Pillars: How MessageAPI Elevates Your Business */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Smile className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900">User-Friendly & Zero Friction</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Customers do not want to install separate apps or fill complicated forms. On WhatsApp, they can ask questions in natural language, send voice notes, or share photos for instant answers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Smooth 24/7 Operations</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Never miss a late-night lead or weekend order. Your automated WhatsApp assistant checks live stock, prices, and booking slots around the clock with zero human fatigue.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Anti-Ban Pacing Protection</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Unlike spam bots that get numbers banned, our intelligent pacing engine simulates human reading, composing states, and typing delays (1–30s) to keep your account 100% safe.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-slate-900">Multimodal Intelligence</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Supports voice note transcription, product photo analysis, prescription scanning, digital invoices, and REST webhook integration into your custom software or CRM.
            </p>
          </div>
        </div>

        {/* Universal Industry Showcase Box */}
        <div className="space-y-6 pt-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Explore How MessageAPI Adapts To Any Product, Company, Or Workflow:</span>
            </div>
          </div>

          {/* Segment Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {businessSegments.map((seg) => {
              const Icon = seg.icon;
              const isSelected = activeSegment === seg.id;
              return (
                <button
                  key={seg.id}
                  onClick={() => setActiveSegment(seg.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-[5px] text-xs font-bold transition-all border ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-md scale-105"
                      : "bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                  <span>{seg.title}</span>
                </button>
              );
            })}
          </div>

          {/* Segment Detail Showcase Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Business Benefits */}
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
                    {currentSegment.badge}
                  </span>
                  <h3 className="text-2xl font-black text-slate-900">
                    {currentSegment.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {currentSegment.description}
                  </p>
                </div>

                {/* Key Benefits List */}
                <div className="space-y-2.5">
                  {currentSegment.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onOpenWizard()}
                    className="flex items-center gap-2 px-6 py-3 rounded-[5px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all transform hover:scale-[1.02]"
                  >
                    <span>Create Your Business Account Today</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Live Conversation Simulation in MessageAPI Theme */}
              <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-2xl space-y-4">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 rounded-[5px] text-white flex items-center justify-between text-xs font-bold shadow-sm">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>MessageAPI Live Interaction</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-[5px] text-white font-medium">
                    24/7 AI Engine
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Customer Question */}
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-3.5 rounded-2xl rounded-tr-xs max-w-[85%] shadow-md">
                      <p className="font-sans">{currentSegment.sampleQuery}</p>
                      <span className="text-[9px] text-emerald-200 block text-right mt-1">11:15 AM ✓✓</span>
                    </div>
                  </div>

                  {/* Automated AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-100 p-3.5 rounded-2xl rounded-tl-xs max-w-[90%] shadow-md border border-slate-700 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold">
                        <Bot className="w-3.5 h-3.5" />
                        <span>MessageAPI Assistant</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed font-sans text-slate-200">{currentSegment.sampleReply}</p>
                      <span className="text-[9px] text-slate-400 block text-right mt-1">11:15 AM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
