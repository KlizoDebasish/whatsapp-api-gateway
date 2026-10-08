"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  RefreshCw, 
  Globe,
  Store, 
  Dumbbell, 
  ShoppingCart, 
  Tv, 
  Utensils, 
  Scissors, 
  ShieldCheck,
  CheckCheck,
  Mic,
  ArrowRight,
  LucideIcon
} from "lucide-react";
import { BusinessCategory, BUSINESS_TEMPLATES, BusinessAccount, ChatMessage } from "@/lib/types";
import { generateSimulatedReply } from "@/lib/storage";

interface LiveDemoProps {
  onOpenWizard: (category?: BusinessCategory) => void;
}

let messageCounter = 1000;
function createMessageId(prefix: string): string {
  messageCounter += 1;
  return `${prefix}_${messageCounter}`;
}

export default function InteractiveLiveDemo({ onOpenWizard }: LiveDemoProps) {
  const [activeCategory, setActiveCategory] = useState<BusinessCategory>("custom");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initTpl = BUSINESS_TEMPLATES.custom;
    return [
      {
        id: "greet_init",
        sender: "business",
        text: initTpl.defaultGreeting.replace("{BusinessName}", initTpl.title),
        timestamp: "Just now",
        isAiGenerated: true,
        status: "read"
      }
    ];
  });
  const [inputPrompt, setInputPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimerSeconds, setTypingTimerSeconds] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentTemplate = BUSINESS_TEMPLATES[activeCategory] || BUSINESS_TEMPLATES.custom;

  // Simulated account object representing current selected template
  const simulatedAccount: BusinessAccount = {
    id: `demo_${activeCategory}`,
    businessName: currentTemplate.title,
    category: activeCategory,
    categoryLabel: currentTemplate.badge,
    ownerName: "Manager",
    phone: "+91 98765 43210",
    currency: "₹",
    workingHours: "08:00 AM - 10:00 PM",
    greetingMessage: currentTemplate.defaultGreeting.replace("{BusinessName}", currentTemplate.title),
    aiPersonaPrompt: currentTemplate.defaultPrompt.replace("{BusinessName}", currentTemplate.title),
    antiBanDelay: { min: 4, max: 8, typingSimulation: true, typingSpeedWpm: 60 },
    enableAi: true,
    enableStockQueries: true,
    allowedChats: "*",
    apiKey: "msgapi_demo_key",
    status: "connected",
    catalog: [...currentTemplate.sampleCatalog],
    createdAt: "2026-01-01T00:00:00.000Z",
    stats: { totalMessages: 120, inboundQueries: 85, ordersPlaced: 34, stockInquiries: 70 }
  };

  const handleSelectCategory = (cat: BusinessCategory) => {
    setActiveCategory(cat);
    const tpl = BUSINESS_TEMPLATES[cat] || BUSINESS_TEMPLATES.custom;
    setMessages([
      {
        id: createMessageId("greet"),
        sender: "business",
        text: tpl.defaultGreeting.replace("{BusinessName}", tpl.title),
        timestamp: "Just now",
        isAiGenerated: true,
        status: "read"
      }
    ]);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isTyping) return;

    const userMsgId = createMessageId("user");
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMsgId,
        sender: "customer",
        text,
        timestamp: "11:15 AM",
        status: "delivered"
      }
    ];

    setMessages(newMessages);
    setInputPrompt("");
    setIsTyping(true);
    setTypingTimerSeconds(1.5);

    // Simulate natural Anti-Ban typing delay (1.5 seconds)
    setTimeout(() => {
      const replyText = generateSimulatedReply(simulatedAccount, text);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId("bot"),
          sender: "business",
          text: replyText,
          timestamp: "11:15 AM",
          isAiGenerated: true,
          status: "read"
        }
      ]);
    }, 1500);
  };

  const handleSendVoiceQuery = () => {
    if (isTyping) return;
    const sampleVoiceQueries: Record<BusinessCategory, string> = {
      custom: "🎙️ [Voice Note: 0:04s] 'Hi! What products or services do you offer and what is the pricing?'",
      medicine: "🎙️ [Voice Note: 0:04s] 'Do you have Paracetamol 650mg and Amoxicillin in stock?'",
      gym: "🎙️ [Voice Note: 0:05s] 'Hi, how much is the 3 month gym membership fee?'",
      grocery: "🎙️ [Voice Note: 0:06s] 'I need 5kg Basmati Rice, 2L Milk and Butter. What is the total bill?'",
      electronics: "🎙️ [Voice Note: 0:04s] 'Is the RGB Mechanical Keyboard available right now?'",
      restaurant: "🎙️ [Voice Note: 0:05s] 'Can I book a table for 4 people tonight at 8 PM?'",
      salon: "🎙️ [Voice Note: 0:04s] 'What are the charges for Haircut and Hair Spa?'"
    };

    const voiceText = sampleVoiceQueries[activeCategory] || sampleVoiceQueries.custom;
    handleSendMessage(voiceText);
  };

  const categories: { id: BusinessCategory; label: string; icon: LucideIcon }[] = [
    { id: "custom", label: "🌟 Any Business / Product / Company", icon: Globe },
    { id: "medicine", label: "Medicine & Pharmacy", icon: Store },
    { id: "gym", label: "Gym & Fitness Studio", icon: Dumbbell },
    { id: "grocery", label: "Grocery & Retail", icon: ShoppingCart },
    { id: "electronics", label: "Electronics & Tech", icon: Tv },
    { id: "restaurant", label: "Restaurant & Cafe", icon: Utensils },
    { id: "salon", label: "Salon & Beauty Spa", icon: Scissors },
  ];

  return (
    <section id="demo-simulator" className="py-20 bg-gradient-to-b from-white via-slate-50 to-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>Interactive Live Simulator</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Test The Universal AI WhatsApp Assistant Live
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            Experience how smoothly MessageAPI engages customers for <strong>ANY business owner, product creator, agency, or company</strong>. Type any question, check live inventory, or test simulated audio voice notes in real-time!
          </p>
        </div>

        {/* Universal Industry Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[5px] text-xs font-bold transition-all border ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-md scale-105"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-400" : "text-emerald-600"}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Simulator Workspace Grid */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Instant Questions & Store Information */}
          <div className="lg:col-span-5 space-y-5">
            <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-black text-slate-900">{currentTemplate.title}</h4>
                  <p className="text-[11px] text-slate-500">{currentTemplate.badge}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live AI Active
                </span>
              </div>

              {/* Sample Quick Questions to click */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Click to Ask Instant Questions:
                </p>
                <div className="space-y-1.5">
                  {currentTemplate.quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      disabled={isTyping}
                      className="w-full text-left p-2.5 rounded-[5px] bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-all flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">&ldquo;{q}&rdquo;</span>
                      <Send className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Note Tester Button */}
              <div className="pt-2">
                <button
                  onClick={handleSendVoiceQuery}
                  disabled={isTyping}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[5px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all"
                >
                  <Mic className="w-3.5 h-3.5 animate-pulse" />
                  <span>Test Voice Note Audio Transcription</span>
                </button>
              </div>

              {/* Anti-Ban Status Info */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Anti-Ban Engine Protected</span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-tight">
                  Simulating natural 1.5s typing delay and human cadence before dispatching.
                </p>
              </div>
            </div>

            {/* Launch this business button */}
            <button
              onClick={() => onOpenWizard(activeCategory)}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-[5px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Account for {currentTemplate.title}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Right Column: MessageAPI Interactive Console View */}
          <div className="lg:col-span-7 bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[560px] relative">
            {/* MessageAPI Console Header Bar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 text-white flex items-center justify-between shadow-md flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[5px] bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
                  {currentTemplate.title.charAt(0)}
                </div>
                <div>
                  <h5 className="text-xs font-bold leading-tight truncate max-w-[220px]">
                    {currentTemplate.title}
                  </h5>
                  <p className="text-[10px] text-emerald-400">
                    {isTyping ? "MessageAPI composing reply..." : "MessageAPI Autonomous Engine • Online"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMessages([
                    {
                      id: createMessageId("greet"),
                      sender: "business",
                      text: currentTemplate.defaultGreeting.replace("{BusinessName}", currentTemplate.title),
                      timestamp: "Just now",
                      isAiGenerated: true,
                      status: "read"
                    }
                  ])}
                  className="p-1.5 rounded-[5px] hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Reset conversation"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chat Conversation Stream */}
            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-900/50">
              {messages.map((msg) => {
                const isUser = msg.sender === "customer";
                return (
                  <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-md relative ${
                        isUser
                          ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs"
                          : "bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700"
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed font-sans">{msg.text}</p>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 mt-1">
                        <span className={isUser ? "text-emerald-100" : "text-slate-400"}>{msg.timestamp}</span>
                        {isUser && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing Presence Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 rounded-2xl rounded-tl-xs p-3 border border-slate-700 shadow-md flex items-center gap-2 text-xs text-slate-300">
                    <span className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                    </span>
                    <span className="text-[11px] font-medium text-emerald-400">
                      Simulating typing presence ({typingTimerSeconds}s)...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleSendVoiceQuery}
                className="p-2 rounded-[5px] text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                title="Send Voice Note"
              >
                <Mic className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={`Ask ${currentTemplate.title} about prices, stock, services...`}
                disabled={isTyping}
                className="flex-1 bg-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || isTyping}
                className={`p-2.5 rounded-[5px] text-white transition-all ${
                  inputPrompt.trim() && !isTyping
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md"
                    : "bg-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
