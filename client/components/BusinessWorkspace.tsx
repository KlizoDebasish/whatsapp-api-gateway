"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, 
  Settings, 
  QrCode, 
  MessageSquare, 
  Key, 
  Plus, 
  Trash2, 
  Send, 
  Check, 
  Code, 
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Bot,
  RefreshCw,
  CheckCircle2,
  Package,
  Clock,
  Sparkles,
  Search,
  User,
  Pill,
  Dumbbell,
  ShoppingCart,
  Tv,
  Utensils,
  Scissors,
  Briefcase,
  LucideIcon,
  Mic,
  Activity,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  FileText,
  ImageIcon,
  Play,
  Pause,
  Lock,
  CheckCheck,
  Filter,
  UserPlus,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Upload,
  BookOpen,
  Zap,
  AlertCircle,
  LogOut,
  Globe,
  Pin,
  PinOff,
  Download,
  ExternalLink
} from "lucide-react";
import { BusinessAccount, BusinessCategory, CatalogItem, ChatMessage } from "@/lib/types";
import { updateBusinessAccount, generateSimulatedReply } from "@/lib/storage";
import { MessageApiClient, BACKEND_URL } from "@/lib/api";
import { WhatsAppText } from "./WhatsAppText";
import { McpDocInfoTab } from "./McpDocInfoTab";
import { generateQrSvgDataUrl } from "@/lib/qr";
import { ChatImageAttachment } from "./ChatImageAttachment";

interface WorkspaceProps {
  account: BusinessAccount;
  onUpdateAccount: (updated: BusinessAccount) => void;
  onBackToLanding: () => void;
  onOpenWizard?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

let wsMessageCounter = 5000;
function createWsMessageId(prefix: string): string {
  wsMessageCounter += 1;
  return `${prefix}_${wsMessageCounter}`;
}

type DashboardTab = "dashboard" | "settings" | "webqr" | "chat" | "session" | "rag" | "mcp";

interface IndustryConfig {
  icon: LucideIcon;
  badge: string;
  roleTitle: string;
  themeColor: string;
  accentBg: string;
  kpis: { title: string; value: string; change: string; subtext: string }[];
  operationalHighlights: { title: string; desc: string; icon: LucideIcon }[];
}

const INDUSTRY_CONFIGS: Record<BusinessCategory, IndustryConfig> = {
  medicine: {
    icon: Pill,
    badge: "Licensed Pharmacy & Health ERP",
    roleTitle: "Pharmacy & Medicine Dispensing Hub",
    themeColor: "from-teal-500 via-teal-600 to-blue-600",
    accentBg: "bg-teal-50 text-teal-800 border-teal-300",
    kpis: [
      { title: "Prescriptions Scanned", value: "142", change: "+18% today", subtext: "OCR photo auto-matched" },
      { title: "Live Medicine SKUs", value: "850+", change: "98% in-stock", subtext: "Real-time drug catalog" },
      { title: "Emergency Refills", value: "28", change: "Active alerts", subtext: "Automated dose reminders" },
      { title: "Today's WhatsApp Rx Billing", value: "₹28,450", change: "+12.4%", subtext: "Zero Meta fees ($0.00)" }
    ],
    operationalHighlights: [
      { title: "Prescription Photo OCR", desc: "Customers send doctor prescriptions via WhatsApp and get instant medicine pricing & cart confirmation.", icon: Pill },
      { title: "Dosage Precautions & Substitutes", desc: "AI assistant advises dosage schedules and offers generic alternatives when brand stocks are low.", icon: ShieldCheck },
      { title: "Doorstep Medicine Dispatch", desc: "Collects customer delivery address & sends live order dispatch tracking in 30 mins.", icon: CheckCircle2 }
    ]
  },
  gym: {
    icon: Dumbbell,
    badge: "Fitness Club & Crossfit Studio",
    roleTitle: "Gym Management & Membership Desk",
    themeColor: "from-cyan-500 via-teal-500 to-blue-600",
    accentBg: "bg-teal-50 text-teal-800 border-teal-300",
    kpis: [
      { title: "Active Member Inquiries", value: "89", change: "+24% this week", subtext: "Monthly, 3-Mo, Annual VIP" },
      { title: "Trainer Trial Slots", value: "24", change: "100% booked", subtext: "Personal training leads" },
      { title: "Supplements In Stock", value: "45 tubs", change: "Whey & Creatine", subtext: "Instant WhatsApp orders" },
      { title: "WhatsApp Membership Revenue", value: "₹42,300", change: "+19.8%", subtext: "Direct renewals" }
    ],
    operationalHighlights: [
      { title: "Automated Plan Inquiries", desc: "Instantly shares Monthly, Quarterly, and Annual VIP transformation rates with diet consultations.", icon: Dumbbell },
      { title: "Trainer Slot Scheduling", desc: "Allows members to book free 1-day trial passes and personal training slots on WhatsApp.", icon: Clock },
      { title: "Supplement Orders", desc: "Instant stock and pricing lookup for Gold Standard Whey, Creatine, and Pre-workout tubs.", icon: Package }
    ]
  },
  grocery: {
    icon: ShoppingCart,
    badge: "Supermarket & Express Retail",
    roleTitle: "Grocery & Fast Delivery Command",
    themeColor: "from-emerald-500 via-teal-500 to-blue-600",
    accentBg: "bg-emerald-50 text-emerald-800 border-emerald-300",
    kpis: [
      { title: "Grocery Lists Received", value: "210", change: "+35% daily", subtext: "Parsed from text & photos" },
      { title: "Express Dispatches", value: "45", change: "Avg 38 mins", subtext: "Doorstep delivery confirmed" },
      { title: "Stock Items Live", value: "1,240", change: "Fresh stock", subtext: "Grains, dairy, veggies" },
      { title: "Today's Cart Sales", value: "₹38,900", change: "+15.2%", subtext: "Direct customer billing" }
    ],
    operationalHighlights: [
      { title: "Handwritten List Parser", desc: "Customers send handwritten grocery lists and get instant itemized cart bills.", icon: ShoppingCart },
      { title: "45-Min Express Delivery", desc: "Automated delivery address collection and dispatch alerts sent via WhatsApp.", icon: CheckCircle2 },
      { title: "Live Vegetable & Dairy Stock", desc: "Instant stock queries for Fortune Basmati, Fresh Milk, Amul Butter, and Organic Eggs.", icon: Package }
    ]
  },
  electronics: {
    icon: Tv,
    badge: "Consumer Electronics & Tech Outlet",
    roleTitle: "Tech Sales & Warranty Command Desk",
    themeColor: "from-teal-500 via-blue-600 to-indigo-600",
    accentBg: "bg-teal-50 text-teal-800 border-teal-300",
    kpis: [
      { title: "Gadget Spec Comparisons", value: "96", change: "+22% tech leads", subtext: "Laptops, Mobiles, Displays" },
      { title: "Warranty Checks", value: "32", change: "Instant lookup", subtext: "Manufacturer warranty" },
      { title: "Digital Invoices Dispatched", value: "14", change: "PDF receipts", subtext: "Instant WhatsApp invoices" },
      { title: "Inquired Order Pipeline", value: "₹1,18,000", change: "+31.5%", subtext: "High-ticket inquiries" }
    ],
    operationalHighlights: [
      { title: "Specs & Comparison Bot", desc: "Answers deep technical specifications, refresh rates, DPI, and processor comparisons.", icon: Tv },
      { title: "Live Availability & Discounts", desc: "Checks stock across peripherals, gaming monitors, and fast chargers with discount offers.", icon: Package },
      { title: "Digital Invoice Dispatch", desc: "Sends GST invoices and serial number warranty cards directly to buyer chats.", icon: ShieldCheck }
    ]
  },
  restaurant: {
    icon: Utensils,
    badge: "Restaurant & Cloud Kitchen",
    roleTitle: "Hospitality, Menu & Takeaway Desk",
    themeColor: "from-teal-600 via-teal-500 to-blue-600",
    accentBg: "bg-teal-50 text-teal-800 border-teal-300",
    kpis: [
      { title: "Digital Menus Shared", value: "64", change: "Interactive cards", subtext: "Chef's signature specials" },
      { title: "Table Reservations", value: "18", change: "Tonight's slots", subtext: "Confirmed on WhatsApp" },
      { title: "Takeaway Orders", value: "37", change: "Kitchen queue", subtext: "Biryani & Starter specials" },
      { title: "Kitchen Sales Total", value: "₹22,400", change: "+14.1%", subtext: "Direct customer orders" }
    ],
    operationalHighlights: [
      { title: "Digital Menu & Daily Specials", desc: "Shares today's special menu with live pricing and vegetarian/non-veg tags.", icon: Utensils },
      { title: "Table Booking System", desc: "Manages seating capacities, party sizes, and reservation times automatically.", icon: Clock },
      { title: "Takeaway Billing", desc: "Accepts takeaway orders and confirms preparation time directly on WhatsApp.", icon: CheckCircle2 }
    ]
  },
  salon: {
    icon: Scissors,
    badge: "Salon, Spa & Beauty Lounge",
    roleTitle: "Salon Stylist & Appointment Hub",
    themeColor: "from-teal-500 via-teal-600 to-blue-600",
    accentBg: "bg-teal-50 text-teal-800 border-teal-300",
    kpis: [
      { title: "Stylist Slots Booked", value: "52", change: "Weekend full", subtext: "Haircut, Spa & Facials" },
      { title: "Bridal / Spa Packages", value: "14", change: "Inquiries", subtext: "High-margin bookings" },
      { title: "Rate Cards Shared", value: "39", change: "Service lists", subtext: "Instant price menus" },
      { title: "Booking Pipeline", value: "₹19,800", change: "+16.7%", subtext: "Automated confirmations" }
    ],
    operationalHighlights: [
      { title: "Grooming Rate Cards", desc: "Provides transparent pricing for Keratin treatments, hair spas, and glow facials.", icon: Scissors },
      { title: "Automated Slot Confirmation", desc: "Books appointment timings and sends automated reminder alerts to clients.", icon: Clock },
      { title: "Bridal & Package Inquiries", desc: "Collects event dates and custom bridal grooming requirements automatically.", icon: Sparkles }
    ]
  },
  custom: {
    icon: Briefcase,
    badge: "Enterprise Business Gateway",
    roleTitle: "Universal Operations & Client Hub",
    themeColor: "from-teal-500 via-teal-600 to-blue-600",
    accentBg: "bg-slate-100 text-slate-800 border-slate-300",
    kpis: [
      { title: "Customer Inquiries", value: "128", change: "+20% this week", subtext: "100% automated resolution" },
      { title: "Quotations Shared", value: "42", change: "Custom rate card", subtext: "Instant service quotes" },
      { title: "Catalog Items Active", value: "15", change: "Live in ERP", subtext: "Service & Product tiers" },
      { title: "WhatsApp Pipeline", value: "₹54,000", change: "+18.3%", subtext: "Zero Meta conversation fees" }
    ],
    operationalHighlights: [
      { title: "Custom Service Catalog", desc: "Instantly quotes pricing and deliverables based on your custom services catalog.", icon: Briefcase },
      { title: "Lead Capture & Qualification", desc: "Collects prospective client contact info and requirements 24/7 without delays.", icon: CheckCircle2 },
      { title: "API Webhook Integration", desc: "Transfers inbound inquiries directly to your backend database, CRM, or Slack.", icon: Code }
    ]
  }
};

export const INDUSTRY_CATALOG_CATEGORIES: Record<string, string[]> = {
  gym: [
    "Memberships",
    "Personal Training",
    "Supplements & Protein",
    "Gym Gear & Essentials",
    "Day Pass & Classes",
    "Diet & Nutrition"
  ],
  medicine: [
    "Prescription Medicines",
    "OTC & Pain Relief",
    "Vitamins & Supplements",
    "First Aid & Surgical",
    "Personal Care & Hygiene",
    "Medical Equipment"
  ],
  grocery: [
    "Fresh Produce & Vegetables",
    "Dairy & Bakery",
    "Packaged Foods & Snacks",
    "Beverages & Drinks",
    "Household Essentials",
    "Grains & Pulses"
  ],
  electronics: [
    "Smartphones & Tablets",
    "Audio & Headphones",
    "Laptops & Computers",
    "Cables & Chargers",
    "Smart Home Devices",
    "Accessories"
  ],
  restaurant: [
    "Starters & Appetizers",
    "Main Course",
    "Beverages & Shakes",
    "Desserts",
    "Combos & Platters",
    "Chef's Specials"
  ],
  salon: [
    "Hair Styling & Cuts",
    "Facial & Skincare",
    "Manicure & Pedicure",
    "Spa & Massage",
    "Hair Treatments",
    "Beauty Products"
  ],
  custom: [
    "Products",
    "Services",
    "Subscriptions",
    "Consultations",
    "Packages",
    "Accessories"
  ]
};

export default function BusinessWorkspace({
  account,
  onUpdateAccount,
  onBackToLanding,
  onOpenWizard,
  onOpenLogin,
  onLogout,
}: WorkspaceProps) {
  const VALID_DASHBOARD_TABS: DashboardTab[] = ["dashboard", "settings", "chat", "session", "rag", "mcp"];

  const normalizeDashboardTab = (tabStr: string | null): DashboardTab => {
    if (!tabStr) return "dashboard";
    const cleaned = tabStr.replace("#", "").toLowerCase() as DashboardTab;
    if (cleaned === "webqr") return "session";
    if (VALID_DASHBOARD_TABS.includes(cleaned)) return cleaned;
    return "dashboard";
  };

  const [activeTab, setActiveTab] = useState<DashboardTab>(() => {
    if (typeof window === "undefined") return "dashboard";
    const hash = window.location.hash;
    if (hash) {
      return normalizeDashboardTab(hash);
    }
    const saved =
      localStorage.getItem(`messageapi_active_tab_v3_${account.id}`) ||
      localStorage.getItem("messageapi_active_tab_v3");
    return normalizeDashboardTab(saved);
  });

  const handleSelectTab = (tab: DashboardTab) => {
    const target = tab === "webqr" ? "session" : tab;
    setActiveTab(target);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("messageapi_active_tab_v3", target);
        localStorage.setItem(`messageapi_active_tab_v3_${account.id}`, target);
        window.history.replaceState(null, "", `#${target}`);
      } catch (e) {
        window.location.hash = target;
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("messageapi_active_tab_v3", activeTab);
    localStorage.setItem(`messageapi_active_tab_v3_${account.id}`, activeTab);
    try {
      window.history.replaceState(null, "", `#${activeTab}`);
    } catch (e) {}

    const handleHash = () => {
      const norm = normalizeDashboardTab(window.location.hash);
      if (norm !== activeTab) {
        setActiveTab(norm);
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [activeTab, account.id]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [catalogSearch, setCatalogSearch] = useState("");

  const industry = INDUSTRY_CONFIGS[account.category] || INDUSTRY_CONFIGS.custom;
  const IndustryIcon = industry.icon;

  // WhatsApp Multi-Contact State (dynamic per session)
  interface WorkspaceContact {
    id: string;
    name: string;
    phone: string;
    avatarBg: string;
    initials: string;
    lastMessage: string;
    lastTime: string;
    unreadCount: number;
    isOnline: boolean;
    statusText: string;
    tag: string;
    messages: ChatMessage[];
    pinnedMessageId?: string;
  }

  const [contacts, setContacts] = useState<WorkspaceContact[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(`messageapi_contacts_${account.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeContactId, setActiveContactId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      return (
        localStorage.getItem(`messageapi_active_contact_${account.id}`) ||
        localStorage.getItem("messageapi_active_contact_global") ||
        ""
      );
    } catch {
      return "";
    }
  });

  // Always keep activeContactId persistently synced to localStorage
  useEffect(() => {
    if (activeContactId && typeof window !== "undefined") {
      try {
        localStorage.setItem(`messageapi_active_contact_${account.id}`, activeContactId);
        localStorage.setItem("messageapi_active_contact_global", activeContactId);
      } catch (e) {}
    }
  }, [activeContactId, account.id]);
  const [contactSearch, setContactSearch] = useState("");
  const [contactFilter, setContactFilter] = useState<"all" | "unread" | "leads">("all");
  const [inputPrompt, setInputPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [aiAutoPilot, setAiAutoPilot] = useState(true);
  const [attachmentMenuOpen, setAttachmentMenuOpen] = useState(false);
  const [emojiModalOpen, setEmojiModalOpen] = useState(false);
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<string>("all");
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);

  const fallbackSpeech = (textFallback?: string, messageId?: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window && textFallback) {
      window.speechSynthesis.cancel();
      const clean = textFallback
        .replace(/🎙️\s*\[.*?\]\s*/, "")
        .replace(/^\[User sent a voice message\.\s*Transcript:\s*"(.*?)"\]$/s, "$1")
        .replace(/[*_#~]/g, "")
        .trim();
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.onend = () => setPlayingAudioId(null);
      utterance.onerror = () => setPlayingAudioId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setPlayingAudioId(null), 4000);
    }
  };

  const handlePlayAudio = (messageId: string, mediaUrl?: string, textFallback?: string) => {
    if (playingAudioId === messageId) {
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
        activeAudioElementRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingAudioId(null);
    } else {
      if (activeAudioElementRef.current) {
        activeAudioElementRef.current.pause();
        activeAudioElementRef.current = null;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      setPlayingAudioId(messageId);

      const resolvedUrl = mediaUrl
        ? (mediaUrl.startsWith("http") ? mediaUrl : `${BACKEND_URL}${mediaUrl}`)
        : null;

      if (resolvedUrl) {
        try {
          const audio = new Audio(resolvedUrl);
          activeAudioElementRef.current = audio;
          audio.onended = () => {
            setPlayingAudioId(null);
            activeAudioElementRef.current = null;
          };
          audio.onerror = () => {
            fallbackSpeech(textFallback, messageId);
          };
          audio.play().catch(() => {
            fallbackSpeech(textFallback, messageId);
          });
        } catch {
          fallbackSpeech(textFallback, messageId);
        }
      } else {
        fallbackSpeech(textFallback, messageId);
      }
    }
  };

  const [isRecording, setIsRecording] = useState(false);

  // Chat Menu & Modals State
  const [chatMenuOpen, setChatMenuOpen] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [showChangeSessionModal, setShowChangeSessionModal] = useState(false);
  const [showAddChatModal, setShowAddChatModal] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [selectedSessionToSwitch, setSelectedSessionToSwitch] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState<{
    id: string;
    name: string;
    phoneNumber?: string;
  } | null>(null);
  const [isDeletingSession, setIsDeletingSession] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Contact Deletion Modal State
  const [contactToDelete, setContactToDelete] = useState<WorkspaceContact | null>(null);
  const [isDeletingContact, setIsDeletingContact] = useState(false);

  // Inner Message Multi-Select, Bulk Delete & Pin State
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [showDeleteMessagesModal, setShowDeleteMessagesModal] = useState(false);
  const [isDeletingMessages, setIsDeletingMessages] = useState(false);

  const chatMessagesContainerRef = useRef<HTMLDivElement>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === "chat") {
      chatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab, activeContactId, contacts, isTyping]);

  // Handle Delete All Messages from all chats
  const handleDeleteAllChats = () => {
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        messages: [],
        lastMessage: "No messages yet",
        unreadCount: 0
      }))
    );
    setShowDeleteAllModal(false);
    setChatMenuOpen(false);
  };

  // Handle Add New Contact / Chat
  const handleAddNewContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const newId = `c_${Date.now()}`;
    const initials = newContactName
      .trim()
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

    const colors = ["bg-emerald-600", "bg-teal-600", "bg-blue-600", "bg-purple-600", "bg-indigo-600", "bg-amber-600", "bg-rose-600"];
    const randomBg = colors[Math.floor(Math.random() * colors.length)];

    const newContact = {
      id: newId,
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      avatarBg: randomBg,
      initials,
      lastMessage: account.greetingMessage.replace("{BusinessName}", account.businessName),
      lastTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      unreadCount: 0,
      isOnline: true,
      statusText: "online",
      tag: activeSessionId || newContactTag || "Active Inquiry",
      messages: [
        {
          id: createWsMessageId("init"),
          sender: "business" as const,
          text: account.greetingMessage.replace("{BusinessName}", account.businessName),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isAiGenerated: true,
          status: "read" as const
        }
      ]
    };

    setContacts((prev) => [newContact, ...prev.filter((p) => p.phone !== newContactPhone.trim())]);
    setActiveContactId(newId);
    try {
      localStorage.setItem(`messageapi_active_contact_${account.id}`, newId);
    } catch (e) {}
    setNewContactName("");
    setNewContactPhone("");
    setShowAddChatModal(false);
    setChatMenuOpen(false);
  };

  // Handle Switch WhatsApp Session
  const handleSwitchSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setShowChangeSessionModal(false);
    setChatMenuOpen(false);
  };

  // Catalog State & Category Options
  const categoryPresets = INDUSTRY_CATALOG_CATEGORIES[account.category] || INDUSTRY_CATALOG_CATEGORIES.custom;
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdStock, setNewProdStock] = useState("");
  const [newProdCategory, setNewProdCategory] = useState<string>(categoryPresets[0] || "General");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState("");
  const [newProdUnit, setNewProdUnit] = useState("pcs");

  // PDF Catalog File Upload State
  const catalogPdfInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingCatalogPdf, setIsUploadingCatalogPdf] = useState(false);
  const [catalogPdfMessage, setCatalogPdfMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Anti-ban State
  const [minDelay, setMinDelay] = useState(account.antiBanDelay.min || 8);
  const [maxDelay, setMaxDelay] = useState(account.antiBanDelay.max || 18);
  const [typingSim, setTypingSim] = useState(account.antiBanDelay.typingSimulation !== false);

  // AI Persona & Profile State
  const [greeting, setGreeting] = useState(account.greetingMessage);
  const [prompt, setPrompt] = useState(account.aiPersonaPrompt);
  const [businessName, setBusinessName] = useState(account.businessName);
  const [ownerName, setOwnerName] = useState(account.ownerName);
  const [phone, setPhone] = useState(account.phone);
  const [workingHours, setWorkingHours] = useState(account.workingHours);
  const [address, setAddress] = useState(account.address || "");

  // Feedback state
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [qrRefreshed, setQrRefreshed] = useState(false);
  const [backendStatus, setBackendStatus] = useState<"checking" | "connected" | "offline">("checking");
  const [isSyncingRag, setIsSyncingRag] = useState(false);
  const [ragSyncMessage, setRagSyncMessage] = useState<string | null>(null);

  React.useEffect(() => {
    MessageApiClient.checkHealth().then((res) => {
      setBackendStatus(res.online ? "connected" : "offline");
    });
  }, []);

  // Sync Live Database Catalog on Mount
  useEffect(() => {
    MessageApiClient.getCatalog(account.apiKey).then((res) => {
      if (res?.items && Array.isArray(res.items) && res.items.length > 0) {
        const mapped: CatalogItem[] = res.items.map((i: any) => ({
          id: i.id || createWsMessageId("prod"),
          sku: i.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
          name: i.name,
          category: i.category || "General",
          price: Number(i.price) || 0,
          stock: typeof i.stock === "number" ? i.stock : 10,
          unit: i.unit || "pcs",
          description: i.description || "",
          isAvailable: i.isAvailable !== false
        }));
        const updated = updateBusinessAccount(account.id, { catalog: mapped });
        if (updated) onUpdateAccount(updated);
      }
    }).catch(() => null);
  }, [account.apiKey]);

  // Password Security & Update State
  const [currentPasswordInput, setCurrentPasswordInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 6) {
      setPasswordError("New password must be at least 6 characters long");
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError("New password and confirm password do not match");
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    try {
      await MessageApiClient.updatePassword({
        domain: account.domain,
        currentPassword: currentPasswordInput,
        newPassword: newPasswordInput
      }, account.apiKey);

      setPasswordSuccess("Account password updated successfully!");
      setCurrentPasswordInput("");
      setNewPasswordInput("");
      setConfirmPasswordInput("");
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // RAG Knowledge Base State (Isolated to this business account)
  const [ragDocs, setRagDocs] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    chunks: number;
    status: string;
    category?: string;
    uploadedAt?: string;
  }>>([]);
  const [ragStats, setRagStats] = useState({
    totalDocs: 0,
    totalChunks: 0,
    dims: 768
  });
  const [isUploadingRag, setIsUploadingRag] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isReindexingRag, setIsReindexingRag] = useState(false);
  const [ragQueryInput, setRagQueryInput] = useState("");
  const [isQueryingRag, setIsQueryingRag] = useState(false);
  const [ragQueryResult, setRagQueryResult] = useState<{
    answer: string;
    model?: string;
    retrievedChunks: Array<{
      text: string;
      similarity: number;
      docName: string;
    }>;
  } | null>(null);
  const ragFileInputRef = useRef<HTMLInputElement>(null);

  const fetchRagDocs = async () => {
    try {
      const res = await MessageApiClient.getRagDocuments(account.apiKey);
      if (res?.documents) {
        setRagDocs(res.documents);
        if (res.stats) setRagStats(res.stats);
      }
    } catch (e) {
      console.warn("Notice fetching RAG documents:", e);
    }
  };

  useEffect(() => {
    if (activeTab === "rag") {
      fetchRagDocs();
    }
  }, [activeTab]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingRag(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const fileName = file.name;
      const fileExt = fileName.split('.').pop()?.toUpperCase() || 'TXT';
      const fileSizeFormatted = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${(file.size / 1024).toFixed(1)} KB`;

      const reader = new FileReader();
      reader.onload = async () => {
        const base64Content = (reader.result as string)?.split(',')[1] || '';
        try {
          const res = await MessageApiClient.uploadRagDocument({
            name: fileName,
            type: fileExt,
            size: fileSizeFormatted,
            content: base64Content,
            isBase64: true,
            category: account.category || 'General'
          }, account.apiKey);

          setUploadSuccess(`Successfully indexed "${fileName}" with ${res.chunksCount || 1} vector chunks!`);
          await fetchRagDocs();
        } catch (err: any) {
          setUploadError(err.message || 'Failed to index document');
        } finally {
          setIsUploadingRag(false);
          if (ragFileInputRef.current) ragFileInputRef.current.value = '';
        }
      };
      reader.onerror = () => {
        setUploadError('Failed to read document file');
        setIsUploadingRag(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'Error processing document');
      setIsUploadingRag(false);
    }
  };

  const handleDeleteRagDoc = async (id: string) => {
    try {
      await MessageApiClient.deleteRagDocument(id, account.apiKey);
      setRagDocs((prev) => prev.filter((d) => d.id !== id));
      setRagStats((prev) => ({
        ...prev,
        totalDocs: Math.max(0, prev.totalDocs - 1)
      }));
    } catch (err) {
      console.warn('Failed to delete document:', err);
    }
  };

  const handleReindexRag = async () => {
    setIsReindexingRag(true);
    try {
      const res = await MessageApiClient.reindexRagDocuments(account.apiKey);
      if (res?.documents) {
        setRagDocs(res.documents);
        if (res.stats) setRagStats(res.stats);
      }
    } catch (err) {
      console.warn('Failed to reindex docs:', err);
    } finally {
      setIsReindexingRag(false);
    }
  };

  const handleRunRagQuery = async (queryText?: string) => {
    const q = (queryText || ragQueryInput).trim();
    if (!q || isQueryingRag) return;

    setIsQueryingRag(true);
    try {
      const res = await MessageApiClient.queryRagKnowledgeBase(q, account.apiKey);
      setRagQueryResult({
        answer: res.answer || 'No specific answer found in knowledge base.',
        model: res.model || 'openai/gpt-oss-120b',
        retrievedChunks: res.retrievedChunks || res.contextChunks || []
      });
    } catch (err: any) {
      setRagQueryResult({
        answer: `Notice: ${err.message || 'Could not query knowledge base. Ensure backend is running.'}`,
        retrievedChunks: []
      });
    } finally {
      setIsQueryingRag(false);
    }
  };

  // Helper to load complete message history for a contact from database
  const loadMessages = async (contactId: string) => {
    if (!contactId) return;
    setIsLoadingMessages(true);
    try {
      // Find the contact object from state to get potential aliases (id, phone, name)
      const contactObj = contacts.find(
        (c) =>
          c.id === contactId ||
          c.name === contactId ||
          (c.phone && (c.phone === contactId || c.phone.replace(/[^0-9]/g, "") === contactId.replace(/[^0-9]/g, "")))
      );

      let res = await MessageApiClient.getMessages(contactId, account.apiKey);
      if ((!res?.messages || res.messages.length === 0) && contactObj?.phone && contactObj.phone !== contactId) {
        const phoneRes = await MessageApiClient.getMessages(contactObj.phone, account.apiKey).catch(() => null);
        if (phoneRes?.messages && phoneRes.messages.length > 0) {
          res = phoneRes;
        }
      }
      if ((!res?.messages || res.messages.length === 0) && contactObj?.name && contactObj.name !== contactId) {
        const nameRes = await MessageApiClient.getMessages(contactObj.name, account.apiKey).catch(() => null);
        if (nameRes?.messages && nameRes.messages.length > 0) {
          res = nameRes;
        }
      }

      if (res?.messages && Array.isArray(res.messages)) {
        const mappedMsgs: ChatMessage[] = res.messages.map((m: any) => {
          const isAudioFile = m.mediaUrl && /\.(mp3|ogg|wav|m4a)($|\?)/i.test(m.mediaUrl);
          const isPdfFile = m.mediaUrl && /\.pdf($|\?)/i.test(m.mediaUrl);
          const detectedType = m.messageType
            ? (m.messageType.toLowerCase() as any)
            : (isAudioFile ? "audio" : isPdfFile ? "document" : m.mediaUrl ? "image" : "text");

          return {
            id: m.id,
            sender: m.sender === "business" ? "business" : "customer",
            text: (m.text || "").replace(/\*\*(.*?)\*\*/g, "*$1*"),
            messageType: detectedType,
            mediaUrl: m.mediaUrl || undefined,
            timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
            isAiGenerated: m.sender === "business" && (m.isAiGenerated ?? true),
            status: "read",
            isPinned: Boolean(m.isPinned)
          };
        });

        // Determine if any message is pinned in DB
        const pinnedMsgFromDb = mappedMsgs.find((m) => m.isPinned);
        const resolvedPinnedId = pinnedMsgFromDb ? pinnedMsgFromDb.id : undefined;

        setContacts((prev) =>
          prev.map((c) => {
            const isTarget =
              c.id === contactId ||
              c.name === contactId ||
              (contactObj && (c.id === contactObj.id || (c.phone && contactObj.phone && c.phone === contactObj.phone))) ||
              (c.phone && (c.phone === contactId || c.phone.replace(/[^0-9]/g, "") === contactId.replace(/[^0-9]/g, "")));

            if (!isTarget) return c;

            // 1. If backend returned messages, use them and attach pinned ID
            if (mappedMsgs.length > 0) {
              return {
                ...c,
                messages: mappedMsgs,
                pinnedMessageId: resolvedPinnedId
              };
            }

            // 2. If backend returned 0 messages, keep existing messages from memory/localStorage
            if (c.messages && c.messages.length > 0) {
              return c;
            }

            // 3. Fallback: If contact has a lastMessage preview in sidebar, reconstruct it into messages array
            if (c.lastMessage && c.lastMessage !== "Chat opened") {
              const isBiz =
                c.lastMessage.startsWith("💪") ||
                c.lastMessage.startsWith("Here is your image") ||
                c.lastMessage.toLowerCase().includes("welcome to");
              const fallbackMsg: ChatMessage = {
                id: `cached_${c.id}_last`,
                sender: isBiz ? "business" : "customer",
                text: c.lastMessage,
                timestamp: c.lastTime || "Earlier",
                status: "read",
                isAiGenerated: isBiz,
                isPinned: Boolean(c.pinnedMessageId && c.pinnedMessageId === `cached_${c.id}_last`)
              };
              return { ...c, messages: [fallbackMsg] };
            }

            return { ...c, messages: [] };
          })
        );
      }
    } catch (err) {
      console.warn("Notice loading messages:", err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Save contacts to localStorage whenever updated
  useEffect(() => {
    if (contacts.length > 0 && typeof window !== "undefined") {
      try {
        localStorage.setItem(`messageapi_contacts_${account.id}`, JSON.stringify(contacts));
      } catch (e) {}
    }
  }, [contacts, account.id]);

  // Load message history whenever active contact changes
  useEffect(() => {
    if (activeContactId) {
      loadMessages(activeContactId);
    }
  }, [activeContactId]);

  // Fetch contacts whenever activeSessionId or apiKey changes
  useEffect(() => {
    MessageApiClient.getContacts(account.apiKey, activeSessionId || undefined)
      .then((res) => {
        if (res?.contacts && res.contacts.length > 0) {
          const mapped = res.contacts.map((c: any) => {
            const initialLastMsg: ChatMessage[] = c.messages?.[0] ? [{
              id: c.messages[0].id,
              sender: c.messages[0].sender === "business" ? "business" : "customer",
              text: (c.messages[0].text || "").replace(/\*\*(.*?)\*\*/g, "*$1*"),
              messageType: (c.messages[0].messageType?.toLowerCase() as any) || "text",
              mediaUrl: c.messages[0].mediaUrl || undefined,
              timestamp: c.messages[0].timestamp ? new Date(c.messages[0].timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Earlier",
              isAiGenerated: c.messages[0].sender === "business" && (c.messages[0].isAiGenerated ?? true),
              status: "read"
            }] : [];

            return {
              id: c.id,
              name: c.name || `Customer ${c.phone?.slice(-4) || ""}`,
              phone: c.phone || "",
              avatarBg: "bg-emerald-600",
              initials: (c.name || "WA").slice(0, 2).toUpperCase(),
              lastMessage: c.messages?.[0]?.text || "Chat opened",
              lastTime: c.messages?.[0]?.timestamp ? new Date(c.messages[0].timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now",
              unreadCount: 0,
              isOnline: true,
              statusText: "online",
              tag: c.tag || activeSessionId || "WhatsApp",
              messages: initialLastMsg,
              pinnedMessageId: c.pinnedMessageId || undefined
            };
          });

          // Preserve any already loaded messages in state so page refresh doesn't wipe them
          setContacts((prev) => {
            const merged = mapped.map((c: any) => {
              const existing = prev.find(
                (p) =>
                  p.id === c.id ||
                  (p.phone && c.phone && p.phone === c.phone) ||
                  (p.name && c.name && p.name === c.name)
              );
              return {
                ...c,
                pinnedMessageId: c.pinnedMessageId || (existing?.messages?.find((m: any) => m.isPinned)?.id) || undefined,
                messages:
                  existing && existing.messages && existing.messages.length > 0
                    ? existing.messages
                    : (c.messages && c.messages.length > 0 ? c.messages : [])
              };
            });
            // Also retain any local contacts that haven't synced to server yet
            const missingLocal = prev.filter(
              (p) =>
                !mapped.some(
                  (m: any) =>
                    m.id === p.id ||
                    (m.phone && p.phone && m.phone === p.phone) ||
                    (m.name && p.name && m.name === p.name)
                )
            );
            return [...merged, ...missingLocal];
          });

          const savedContactId =
            (typeof window !== "undefined" &&
              (localStorage.getItem(`messageapi_active_contact_${account.id}`) ||
               localStorage.getItem("messageapi_active_contact_global"))) ||
            activeContactId;

          const matchedContact =
            (savedContactId &&
              (res.contacts.find((m: any) =>
                m.id === savedContactId ||
                (m.phone && savedContactId.replace(/[^0-9]/g, "") === m.phone.replace(/[^0-9]/g, "")) ||
                (m.phone && savedContactId.includes(m.phone.replace(/[^0-9]/g, "")))
              ) ||
              contacts.find((c) =>
                c.id === savedContactId ||
                (c.phone && savedContactId.replace(/[^0-9]/g, "") === c.phone.replace(/[^0-9]/g, ""))
              ))) ||
            null;

          const targetId = matchedContact?.id || savedContactId || res.contacts[0]?.id || "";
          if (targetId && targetId !== activeContactId) {
            setActiveContactId(targetId);
          }
          if (targetId) {
            loadMessages(targetId);
          }
        }
      })
      .catch((err) => {
        console.warn("Notice loading contacts from backend:", err);
      });
  }, [activeSessionId, account.apiKey]);

  // Real-time WhatsApp SSE Event Stream
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      const eventsUrl = MessageApiClient.getEventsStreamUrl(undefined, account.apiKey);
      eventSource = new EventSource(eventsUrl);

      const handleIncomingMessage = (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data);
          const { contactId, contact, message, sessionId } = payload;
          if (!message) return;

          setContacts((prev) => {
            const existingIdx = prev.findIndex((c) => c.id === contactId || (c.phone && contact?.phone && c.phone === contact.phone));
            const sanitizedMsgText = (message.text || "").replace(/\*\*(.*?)\*\*/g, "*$1*");
            const isAudioMsg = message.mediaUrl && /\.(mp3|ogg|wav|m4a)($|\?)/i.test(message.mediaUrl);
            const isPdfMsg = message.mediaUrl && /\.pdf($|\?)/i.test(message.mediaUrl);
            const resolvedMsgType = message.messageType
              ? (message.messageType.toLowerCase() as any)
              : (isAudioMsg ? "audio" : isPdfMsg ? "document" : message.mediaUrl ? "image" : "text");

            const newMsg: ChatMessage = {
              id: message.id || createWsMessageId("msg"),
              sender: message.sender === "business" ? "business" : "customer",
              text: sanitizedMsgText,
              messageType: resolvedMsgType,
              mediaUrl: message.mediaUrl || undefined,
              timestamp: message.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isAiGenerated: message.sender === "business" || message.isAiGenerated,
              status: "read"
            };

            if (existingIdx !== -1) {
              const updated = [...prev];
              const target = updated[existingIdx];
              const existingMessages = target.messages || [];

              // Strict deduplication: ignore if this message ID or identical message is already present
              const isDuplicate = existingMessages.some(
                (m) =>
                  (newMsg.id && m.id && m.id === newMsg.id) ||
                  (m.sender === newMsg.sender &&
                    m.text.trim() === newMsg.text.trim() &&
                    (m.timestamp === newMsg.timestamp ||
                      (existingMessages.length > 0 && existingMessages[existingMessages.length - 1].id === m.id)))
              );

              if (isDuplicate) {
                // Update latest message preview without appending duplicate bubble
                updated[existingIdx] = {
                  ...target,
                  lastMessage: sanitizedMsgText,
                  lastTime: newMsg.timestamp,
                };
                return updated;
              }

              updated[existingIdx] = {
                ...target,
                lastMessage: sanitizedMsgText,
                lastTime: newMsg.timestamp,
                messages: [...existingMessages, newMsg]
              };
              return updated;
            } else if (contact) {
              const newC: WorkspaceContact = {
                id: contactId || contact.id,
                name: contact.name || "WhatsApp User",
                phone: contact.phone || "",
                avatarBg: "bg-emerald-600",
                initials: (contact.name || "WA").slice(0, 2).toUpperCase(),
                lastMessage: sanitizedMsgText,
                lastTime: newMsg.timestamp,
                unreadCount: 0,
                isOnline: true,
                statusText: "online",
                tag: sessionId || activeSessionId || "WhatsApp",
                messages: [newMsg]
              };
              return [newC, ...prev];
            }
            return prev;
          });

          // If no active contact is selected, select the incoming contact
          setActiveContactId((prev) => prev || contactId || contact?.id || "");
        } catch (e) {}
      };

      const handlePinMessage = (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data);
          const { contactId, messageId, isPinned } = payload;
          setContacts((prev) =>
            prev.map((c) => {
              const matches =
                c.id === contactId ||
                (c.phone && contactId && c.phone.replace(/[^0-9]/g, "") === contactId.replace(/[^0-9]/g, ""));
              if (!matches) return c;
              return {
                ...c,
                pinnedMessageId: isPinned ? messageId : undefined,
                messages: (c.messages || []).map((m) => ({
                  ...m,
                  isPinned: isPinned && m.id === messageId
                }))
              };
            })
          );
        } catch (e) {}
      };

      const handleSessionStatus = (event: MessageEvent) => {
        try {
          const payload = JSON.parse(event.data);
          const { sessionId, status, phoneNumber } = payload;
          setSessions((prev) =>
            prev.map((s) =>
              s.id === sessionId
                ? {
                    ...s,
                    status: status as any,
                    phoneNumber: status === "DISCONNECTED" ? "Not Linked" : (phoneNumber || s.phoneNumber),
                    lastConnected: status === "CONNECTED"
                      ? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                      : s.lastConnected
                  }
                : s
            )
          );
        } catch (e) {}
      };

      eventSource.addEventListener("message:new", handleIncomingMessage);
      eventSource.addEventListener("message:pin", handlePinMessage);
      eventSource.addEventListener("session:status", handleSessionStatus);
    } catch (e) {}

    return () => {
      eventSource?.close();
    };
  }, [account.apiKey, activeSessionId]);

  // Load chat messages when active contact changes
  useEffect(() => {
    if (activeContactId) {
      loadMessages(activeContactId);
    }
  }, [activeContactId, account.apiKey]);

  // Multi-Session WhatsApp Management State
  const [sessions, setSessions] = useState<{
    id: string;
    name: string;
    status: "CONNECTED" | "CONNECTING" | "DISCONNECTED";
    phoneNumber: string;
    autoReconnect: string;
    lastConnected: string;
    deviceModel: string;
    batteryPercent: number;
    latencyMs: number;
    isPrimary?: boolean;
  }[]>([]);

  const fetchSessions = async () => {
    try {
      const res = await MessageApiClient.getSessions(account.apiKey);
      if (res?.sessions && Array.isArray(res.sessions)) {
        const mapped = res.sessions.map((s: any) => ({
          id: s.id,
          name: s.name || "WhatsApp Instance",
          status: s.status || "DISCONNECTED",
          phoneNumber: s.phoneNumber || "Not Linked",
          autoReconnect: s.autoReconnect !== false ? "Enabled (Safe Pacing)" : "Manual",
          lastConnected: s.lastConnectedAt ? new Date(s.lastConnectedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "Never",
          deviceModel: s.deviceModel || "WhatsApp Multi-Device",
          batteryPercent: s.batteryPercent ?? 100,
          latencyMs: s.latencyMs ?? 35,
          isPrimary: s.isPrimary ?? false
        }));
        setSessions(mapped);
        const connected = mapped.filter((s: any) => s.status === "CONNECTED");
        if (connected.length > 0) {
          setActiveSessionId((prev) => (prev && connected.some((m: any) => m.id === prev) ? prev : connected[0].id));
        } else if (mapped.length > 0) {
          setActiveSessionId((prev) => (prev && mapped.some((m: any) => m.id === prev) ? prev : mapped[0].id));
        }
      } else {
        setSessions([]);
      }
    } catch (e) {
      console.warn("Notice fetching sessions:", e);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 4000);
    return () => clearInterval(interval);
  }, [account.apiKey]);

  const [viewingSessionQr, setViewingSessionQr] = useState<{
    id: string;
    name: string;
    status: "CONNECTED" | "CONNECTING" | "DISCONNECTED";
    phoneNumber: string;
    autoReconnect: string;
    lastConnected: string;
    deviceModel: string;
    batteryPercent: number;
    latencyMs: number;
    isPrimary?: boolean;
  } | null>(null);

  // Dynamic QR Code State
  const [webQrDataUrl, setWebQrDataUrl] = useState<string>(() =>
    generateQrSvgDataUrl(`2@wa_primary_01,${account.businessName},msgapi_gateway`)
  );
  const [modalQrDataUrl, setModalQrDataUrl] = useState<string | null>(null);



  // Listen to live QR Stream when viewing a session in modal
  React.useEffect(() => {
    if (!viewingSessionQr) {
      setModalQrDataUrl(null);
      return;
    }

    setModalQrDataUrl(generateQrSvgDataUrl(`2@${viewingSessionQr.id},${Date.now()},msgapi_pair`));

    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let autoCloseTimer: NodeJS.Timeout | null = null;

    const onSessionConnected = (detectedPhone?: string) => {
      const realPhone = detectedPhone ? (detectedPhone.startsWith("+") ? detectedPhone : `+${detectedPhone}`) : viewingSessionQr.phoneNumber;
      setViewingSessionQr((prev) =>
        prev ? { ...prev, status: "CONNECTED", phoneNumber: realPhone } : null
      );
      setSessions((prev) =>
        prev.map((s) =>
          s.id === viewingSessionQr.id
            ? { ...s, status: "CONNECTED", phoneNumber: realPhone, lastConnected: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) }
            : s
        )
      );
      setActiveSessionId((prev) => prev || viewingSessionQr.id);

      // Auto close after 1.8 seconds upon real device connection
      autoCloseTimer = setTimeout(() => {
        setViewingSessionQr(null);
      }, 1800);
    };

    try {
      const streamUrl = MessageApiClient.getQrStreamUrl(viewingSessionQr.id);
      eventSource = new EventSource(streamUrl);

      eventSource.addEventListener("qr", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.qr) setModalQrDataUrl(data.qr);
        } catch (e) {}
      });

      eventSource.addEventListener("ready", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          onSessionConnected(data.phoneNumber);
        } catch (e) {
          onSessionConnected();
        }
      });
    } catch (e) {}

    // Fallback status check while modal is open
    if (viewingSessionQr.status !== "CONNECTED") {
      pollInterval = setInterval(async () => {
        try {
          const res = await MessageApiClient.getSessionStatus(viewingSessionQr.id, account.apiKey);
          if (res?.session?.status === "CONNECTED") {
            onSessionConnected(res.session.phoneNumber);
          } else if (res?.session?.qrCode && !modalQrDataUrl) {
            setModalQrDataUrl(res.session.qrCode);
          }
        } catch (e) {}
      }, 2500);
    }

    return () => {
      eventSource?.close();
      if (pollInterval) clearInterval(pollInterval);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
    };
  }, [viewingSessionQr?.id, account.apiKey]);

  // Open Delete Confirmation Modal
  const handleRequestDeleteSession = (sess: { id: string; name: string; phoneNumber?: string }) => {
    setSessionToDelete(sess);
  };

  // Disconnect Only (Preserves message history in DB)
  const handleDisconnectOnly = async (sessionId: string) => {
    setIsDeletingSession(true);
    try {
      await MessageApiClient.disconnectSession(sessionId, account.apiKey);
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, status: "DISCONNECTED" as const } : s))
      );
      if (viewingSessionQr?.id === sessionId) {
        setViewingSessionQr((prev) => (prev ? { ...prev, status: "DISCONNECTED" as const } : null));
      }
      if (activeSessionId === sessionId) {
        const remainingConnected = sessions.filter((s) => s.id !== sessionId && s.status === "CONNECTED");
        setActiveSessionId(remainingConnected[0]?.id || "");
        if (remainingConnected.length === 0) {
          setContacts([]);
          setActiveContactId("");
        }
      }
    } catch (e) {
      console.warn("Notice disconnecting session:", e);
    } finally {
      setIsDeletingSession(false);
      setSessionToDelete(null);
    }
  };

  // Confirm Delete Session & Wipe All Associated Messages & Contacts
  const handleConfirmDeleteSession = async (sessionId: string) => {
    setIsDeletingSession(true);
    try {
      await MessageApiClient.deleteSession(sessionId, account.apiKey, false);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (viewingSessionQr?.id === sessionId) {
        setViewingSessionQr(null);
      }
      // Note: Preserve contacts and customer chat history so conversation records remain intact
      if (activeSessionId === sessionId) {
        const remainingConnected = sessions.filter((s) => s.id !== sessionId && s.status === "CONNECTED");
        setActiveSessionId(remainingConnected[0]?.id || "");
      }
    } catch (e) {
      console.warn("Notice deleting session:", e);
    } finally {
      setIsDeletingSession(false);
      setSessionToDelete(null);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    const target = sessions.find((s) => s.id === sessionId);
    if (target) {
      handleRequestDeleteSession(target);
    } else {
      handleConfirmDeleteSession(sessionId);
    }
  };

  // Connect New Session & WebQR Modal State (2-step: 1. Name input, 2. Live QR pairing with auto-detection & auto-close)
  const [showConnectNewSessionModal, setShowConnectNewSessionModal] = useState(false);
  const [newSessionStep, setNewSessionStep] = useState<"name" | "qr" | "connected">("name");
  const [newSessionNameInput, setNewSessionNameInput] = useState("");
  const [newSessionIsPrimary, setNewSessionIsPrimary] = useState(true);
  const [isCreatingNewSession, setIsCreatingNewSession] = useState(false);
  const [connectSessionError, setConnectSessionError] = useState<string | null>(null);
  const [createdSessionData, setCreatedSessionData] = useState<{
    id: string;
    name: string;
    status: "CONNECTING" | "CONNECTED";
    phoneNumber?: string;
  } | null>(null);
  const [newSessionQrDataUrl, setNewSessionQrDataUrl] = useState<string | null>(null);
  const [newSessionConnectedPhone, setNewSessionConnectedPhone] = useState<string | null>(null);
  const [isRefreshingNewSessionQr, setIsRefreshingNewSessionQr] = useState(false);

  // Open the Connect New Session Modal (Step 1: name only, NO QR visible initially)
  const handleOpenConnectModal = () => {
    setNewSessionStep("name");
    setNewSessionNameInput("");
    setNewSessionIsPrimary(sessions.length === 0 || !sessions.some((s) => s.isPrimary));
    setConnectSessionError(null);
    setCreatedSessionData(null);
    setNewSessionQrDataUrl(null);
    setNewSessionConnectedPhone(null);
    setShowConnectNewSessionModal(true);
  };

  // Submit session name -> Initialize Baileys session and show live scannable QR
  const handleCreateSessionSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSessionNameInput.trim();
    if (!trimmed) {
      setConnectSessionError("Please provide a name for this session");
      return;
    }
    setIsCreatingNewSession(true);
    setConnectSessionError(null);

    const cleanId = trimmed.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 16);
    const newId = `wa_${cleanId || "session"}_${Math.floor(100 + Math.random() * 900)}`;

    try {
      const res = await MessageApiClient.createSession(newId, trimmed, account.apiKey, newSessionIsPrimary);
      const newSessObj = {
        id: newId,
        name: trimmed,
        status: "CONNECTING" as const,
        phoneNumber: "Waiting for scan...",
        autoReconnect: "Enabled (Safe Pacing)",
        lastConnected: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        deviceModel: "WhatsApp Multi-Device",
        batteryPercent: 100,
        latencyMs: 32,
        isPrimary: newSessionIsPrimary
      };

      setSessions((prev) => {
        const list = newSessionIsPrimary ? prev.map((s) => ({ ...s, isPrimary: false })) : prev;
        return [...list.filter((s) => s.id !== newId), newSessObj];
      });

      setCreatedSessionData({
        id: newId,
        name: trimmed,
        status: "CONNECTING"
      });

      if (res?.qrCode) {
        setNewSessionQrDataUrl(res.qrCode);
      } else {
        setNewSessionQrDataUrl(generateQrSvgDataUrl(`2@${newId},${Date.now()},msgapi_device`));
      }

      setNewSessionStep("qr");
    } catch (err: any) {
      const newSessObj = {
        id: newId,
        name: trimmed,
        status: "CONNECTING" as const,
        phoneNumber: "Waiting for scan...",
        autoReconnect: "Enabled (Safe Pacing)",
        lastConnected: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        deviceModel: "WhatsApp Multi-Device",
        batteryPercent: 100,
        latencyMs: 32,
        isPrimary: newSessionIsPrimary
      };
      setSessions((prev) => [...prev.filter((s) => s.id !== newId), newSessObj]);
      setCreatedSessionData({
        id: newId,
        name: trimmed,
        status: "CONNECTING"
      });
      setNewSessionQrDataUrl(generateQrSvgDataUrl(`2@${newId},${Date.now()},msgapi_device`));
      setNewSessionStep("qr");
    } finally {
      setIsCreatingNewSession(false);
    }
  };

  // Real-time Baileys SSE listener + status polling for newly created session pairing
  useEffect(() => {
    if (!showConnectNewSessionModal || newSessionStep !== "qr" || !createdSessionData?.id) {
      return;
    }

    const sessionId = createdSessionData.id;
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let closeTimeout: NodeJS.Timeout | null = null;

    const handleConnectedSuccess = (phone?: string) => {
      const detectedPhone = phone ? (phone.startsWith("+") ? phone : `+${phone}`) : "+91 93824 68250";
      setNewSessionConnectedPhone(detectedPhone);
      setNewSessionStep("connected");

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                status: "CONNECTED",
                phoneNumber: detectedPhone,
                lastConnected: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              }
            : s
        )
      );

      setActiveSessionId((prev) => prev || sessionId);

      // Real-time detection: automatically closes modal after 1.8 seconds!
      closeTimeout = setTimeout(() => {
        setShowConnectNewSessionModal(false);
        setNewSessionStep("name");
        setCreatedSessionData(null);
      }, 1800);
    };

    try {
      const streamUrl = MessageApiClient.getQrStreamUrl(sessionId);
      eventSource = new EventSource(streamUrl);

      eventSource.addEventListener("qr", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.qr) setNewSessionQrDataUrl(data.qr);
        } catch (e) {}
      });

      eventSource.addEventListener("ready", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          handleConnectedSuccess(data.phoneNumber);
        } catch (e) {
          handleConnectedSuccess();
        }
      });
    } catch (e) {}

    // Fallback polling every 2.5s
    pollInterval = setInterval(async () => {
      try {
        const res = await MessageApiClient.getSessionStatus(sessionId, account.apiKey);
        if (res?.session?.status === "CONNECTED") {
          handleConnectedSuccess(res.session.phoneNumber);
        } else if (res?.session?.qrCode && !newSessionQrDataUrl) {
          setNewSessionQrDataUrl(res.session.qrCode);
        }
      } catch (e) {}
    }, 2500);

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
      if (closeTimeout) clearTimeout(closeTimeout);
    };
  }, [showConnectNewSessionModal, newSessionStep, createdSessionData?.id, account.apiKey]);

  const activeContact =
    contacts.find((c) => c.id === activeContactId) ||
    contacts.find((c) => {
      const saved =
        typeof window !== "undefined"
          ? localStorage.getItem(`messageapi_active_contact_${account.id}`) ||
            localStorage.getItem("messageapi_active_contact_global")
          : null;
      return (
        saved &&
        (c.id === saved ||
          (c.phone && c.phone.replace(/[^0-9]/g, "") === saved.replace(/[^0-9]/g, "")) ||
          (c.phone && saved.includes(c.phone.replace(/[^0-9]/g, ""))))
      );
    }) ||
    contacts[0];

  // Handle Contact Select & Clear Unread
  const handleSelectContact = (id: string) => {
    setActiveContactId(id);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`messageapi_active_contact_${account.id}`, id);
        localStorage.setItem("messageapi_active_contact_global", id);
      } catch (e) {}
    }
    setSelectedMessageIds([]); // Reset selection mode when switching contact
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
    loadMessages(id);
  };

  // Keyboard shortcut: Escape exits selection mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedMessageIds.length > 0) {
        setSelectedMessageIds([]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMessageIds.length]);

  // 1. Delete Contact (Sidebar whole chat)
  const handleConfirmDeleteContact = async () => {
    if (!contactToDelete) return;
    setIsDeletingContact(true);
    try {
      await MessageApiClient.deleteContact(contactToDelete.id, account.apiKey).catch(() => null);

      const updatedList = contacts.filter((c) => c.id !== contactToDelete.id);
      setContacts(updatedList);
      try {
        localStorage.setItem(`messageapi_contacts_${account.id}`, JSON.stringify(updatedList));
      } catch (e) {}

      if (activeContactId === contactToDelete.id) {
        const nextId = updatedList.length > 0 ? updatedList[0].id : "";
        setActiveContactId(nextId);
        try {
          localStorage.setItem(`messageapi_active_contact_${account.id}`, nextId);
        } catch (e) {}
      }

      setContactToDelete(null);
    } finally {
      setIsDeletingContact(false);
    }
  };

  // 2. Double Click to initiate Selection Mode (and select that message)
  const handleMessageDoubleClick = (msgId: string) => {
    if (selectedMessageIds.includes(msgId)) {
      setSelectedMessageIds((prev) => prev.filter((id) => id !== msgId));
    } else {
      setSelectedMessageIds((prev) => [...prev, msgId]);
    }
  };

  // 3. Single click when in selection mode (toggles selection)
  const handleMessageClick = (msgId: string) => {
    if (selectedMessageIds.length > 0) {
      if (selectedMessageIds.includes(msgId)) {
        setSelectedMessageIds((prev) => prev.filter((id) => id !== msgId));
      } else {
        setSelectedMessageIds((prev) => [...prev, msgId]);
      }
    }
  };

  // 4. Pin / Unpin Selected Message (Only 1 message can be pinned)
  const handleTogglePinSelected = async () => {
    if (selectedMessageIds.length !== 1 || !activeContact) return;
    const targetId = selectedMessageIds[0];
    const isAlreadyPinned =
      activeContact.pinnedMessageId === targetId ||
      activeContact.messages.some((m) => m.id === targetId && m.isPinned);

    const nextIsPinned = !isAlreadyPinned;
    const newPinnedId = nextIsPinned ? targetId : undefined;

    // Optimistically update message objects (strictly only 1 message pinned)
    const updatedMessages = activeContact.messages.map((m) => ({
      ...m,
      isPinned: nextIsPinned && m.id === targetId
    }));

    const updatedContact: WorkspaceContact = {
      ...activeContact,
      messages: updatedMessages,
      pinnedMessageId: newPinnedId
    };

    const updatedList = contacts.map((c) => (c.id === activeContact.id ? updatedContact : c));
    setContacts(updatedList);
    try {
      localStorage.setItem(`messageapi_contacts_${account.id}`, JSON.stringify(updatedList));
    } catch (e) {}
    setSelectedMessageIds([]);

    // Persist to database so it stays pinned across reloads
    try {
      await MessageApiClient.togglePinMessage(
        {
          contactId: activeContact.id,
          messageId: targetId,
          isPinned: nextIsPinned
        },
        account.apiKey
      );
    } catch (err) {
      console.warn("Notice updating pin status on database:", err);
    }
  };

  // 5. Unpin directly from the Sticky banner
  const handleUnpinDirectly = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeContact) return;
    const currentPinnedId =
      activeContact.pinnedMessageId ||
      activeContact.messages.find((m) => m.isPinned)?.id;

    const updatedMessages = activeContact.messages.map((m) => ({
      ...m,
      isPinned: false
    }));

    const updatedContact: WorkspaceContact = {
      ...activeContact,
      messages: updatedMessages,
      pinnedMessageId: undefined
    };
    const updatedList = contacts.map((c) => (c.id === activeContact.id ? updatedContact : c));
    setContacts(updatedList);
    try {
      localStorage.setItem(`messageapi_contacts_${account.id}`, JSON.stringify(updatedList));
    } catch (e) {}

    // Persist unpin to database
    if (currentPinnedId) {
      try {
        await MessageApiClient.togglePinMessage(
          {
            contactId: activeContact.id,
            messageId: currentPinnedId,
            isPinned: false
          },
          account.apiKey
        );
      } catch (err) {
        console.warn("Notice unpinning message on database:", err);
      }
    }
  };

  // 6. Smooth Scroll to Pinned Message with visual flash effect
  const handleScrollToPinned = () => {
    if (!activeContact?.pinnedMessageId) return;
    const el = document.getElementById(`msg_${activeContact.pinnedMessageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-teal-500", "rounded-2xl");
      setTimeout(() => {
        el.classList.remove("ring-2", "ring-teal-500", "rounded-2xl");
      }, 2000);
    }
  };

  // 7. Bulk / Single Delete Messages Confirmation
  const handleConfirmDeleteMessages = async () => {
    if (!activeContact || selectedMessageIds.length === 0) return;
    setIsDeletingMessages(true);
    try {
      await MessageApiClient.deleteMessages(selectedMessageIds, account.apiKey).catch(() => null);

      const remainingMessages = activeContact.messages.filter((m) => !selectedMessageIds.includes(m.id));
      const lastMsg = remainingMessages[remainingMessages.length - 1];

      const isPinnedDeleted =
        selectedMessageIds.includes(activeContact.pinnedMessageId || "") ||
        activeContact.messages.some((m) => selectedMessageIds.includes(m.id) && m.isPinned);

      const newPinnedId = isPinnedDeleted
        ? undefined
        : activeContact.pinnedMessageId;

      if (isPinnedDeleted && (activeContact.pinnedMessageId || selectedMessageIds[0])) {
        MessageApiClient.togglePinMessage(
          {
            contactId: activeContact.id,
            messageId: activeContact.pinnedMessageId || selectedMessageIds[0],
            isPinned: false
          },
          account.apiKey
        ).catch(() => null);
      }

      const updatedContact: WorkspaceContact = {
        ...activeContact,
        messages: remainingMessages,
        lastMessage: lastMsg ? lastMsg.text : "No messages yet",
        lastTime: lastMsg ? lastMsg.timestamp : activeContact.lastTime,
        pinnedMessageId: newPinnedId
      };

      const updatedList = contacts.map((c) => (c.id === activeContact.id ? updatedContact : c));
      setContacts(updatedList);
      try {
        localStorage.setItem(`messageapi_contacts_${account.id}`, JSON.stringify(updatedList));
      } catch (e) {}

      setSelectedMessageIds([]);
      setShowDeleteMessagesModal(false);
    } finally {
      setIsDeletingMessages(false);
    }
  };

  // Handle Sending Chat in Live Chat Tab (Store Agent direct chat to WhatsApp)
  const handleSendMessage = (textToSend?: string) => {
    const rawText = (textToSend || inputPrompt).trim();
    if (!rawText) return;
    const text = rawText.replace(/\*\*(.*?)\*\*/g, "*$1*");

    // 1. OUTGOING MESSAGE: STORE AGENT SENDS DIRECTLY TO CUSTOMER ON WHATSAPP
    const businessMsg: ChatMessage = {
      id: createWsMessageId("biz"),
      sender: "business",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isAiGenerated: false,
      status: "sent"
    };

    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContactId
          ? {
              ...c,
              lastMessage: text,
              lastTime: businessMsg.timestamp,
              messages: [...c.messages, businessMsg]
            }
          : c
      )
    );

    setInputPrompt("");
    setAttachmentMenuOpen(false);

    // Dispatch to real WhatsApp number via Baileys backend socket
    const targetPhone = activeContact?.phone;
    const activeSession =
      sessions.find((s) => s.id === activeSessionId && s.status === "CONNECTED") ||
      sessions.find((s) => s.status === "CONNECTED") ||
      sessions[0];
    const targetSessionId =
      (activeContact?.tag && sessions.some((s) => s.id === activeContact.tag && s.status === "CONNECTED"))
        ? activeContact.tag
        : (activeSession?.id || activeSessionId || "wa_primary_01");

    if (targetPhone && targetSessionId) {
      MessageApiClient.sendMessage({
        sessionId: targetSessionId,
        to: targetPhone,
        content: text,
        apiKey: account.apiKey
      }).catch((err) => console.warn("Notice sending to WhatsApp:", err));
    }

    // Absolutely NO AI response generated when store agent sends a message!
    // AI responses only trigger on real inbound WhatsApp messages from customers.
  };

  // Voice Note Recording Simulation (Sends voice message as store agent)
  const handleToggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      handleSendMessage(`🎙️ [Voice Note: 0:05s]: Audio voice message from ${account.businessName}`);
    } else {
      setIsRecording(true);
    }
  };

  // Add Product to Catalog
  const handleAddProduct = () => {
    if (!newProdName.trim()) return;
    const activeCat = isCustomCategory ? customCategoryInput.trim() || "General" : newProdCategory;
    const newItem: CatalogItem = {
      id: createWsMessageId("prod"),
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      name: newProdName.trim(),
      category: activeCat.trim() || "General",
      price: parseFloat(newProdPrice) || 0,
      stock: parseInt(newProdStock, 10) || 10,
      unit: newProdUnit.trim() || "pcs",
      isAvailable: true
    };
    const updatedCatalog = [...account.catalog, newItem];
    const updated = updateBusinessAccount(account.id, { catalog: updatedCatalog });
    if (updated) onUpdateAccount(updated);

    // Sync to backend database & pgvector
    MessageApiClient.saveCatalogItems(updatedCatalog, account.apiKey).catch(() => null);

    setNewProdName("");
    setNewProdPrice("");
    setNewProdStock("");
    if (isCustomCategory) {
      setCustomCategoryInput("");
    }
  };

  // PDF Catalog File Upload & AI Parser
  const handleCatalogPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setCatalogPdfMessage({
        text: "Only PDF files (.pdf) are allowed for product catalog import.",
        type: "error"
      });
      if (catalogPdfInputRef.current) catalogPdfInputRef.current.value = "";
      setTimeout(() => setCatalogPdfMessage(null), 5000);
      return;
    }

    setIsUploadingCatalogPdf(true);
    setCatalogPdfMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = (reader.result as string).split(",")[1];
        const res = await MessageApiClient.uploadCatalogPdf(
          {
            fileName: file.name,
            content: base64Data,
            defaultCategory: isCustomCategory ? customCategoryInput.trim() : newProdCategory
          },
          account.apiKey
        );

        if (res && res.items && Array.isArray(res.items)) {
          const mapped: CatalogItem[] = res.items.map((i: any) => ({
            id: i.id || createWsMessageId("prod"),
            sku: i.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
            name: i.name,
            category: i.category || "General",
            price: Number(i.price) || 0,
            stock: typeof i.stock === "number" ? i.stock : 10,
            unit: i.unit || "pcs",
            description: i.description || "",
            isAvailable: i.isAvailable !== false
          }));

          const updated = updateBusinessAccount(account.id, { catalog: mapped });
          if (updated) onUpdateAccount(updated);

          setCatalogPdfMessage({
            text: `✅ Extracted & synced ${mapped.length} products from "${file.name}"!`,
            type: "success"
          });
        } else {
          setCatalogPdfMessage({
            text: res?.message || "Catalog parsed successfully.",
            type: "success"
          });
        }
      } catch (err: any) {
        setCatalogPdfMessage({
          text: err.message || "Failed to parse PDF catalog.",
          type: "error"
        });
      } finally {
        setIsUploadingCatalogPdf(false);
        if (catalogPdfInputRef.current) catalogPdfInputRef.current.value = "";
        setTimeout(() => setCatalogPdfMessage(null), 6000);
      }
    };

    reader.onerror = () => {
      setIsUploadingCatalogPdf(false);
      setCatalogPdfMessage({
        text: "Could not read the PDF file.",
        type: "error"
      });
      if (catalogPdfInputRef.current) catalogPdfInputRef.current.value = "";
      setTimeout(() => setCatalogPdfMessage(null), 5000);
    };

    reader.readAsDataURL(file);
  };

  // Remove Product
  const handleRemoveProduct = (id: string) => {
    const updatedCatalog = account.catalog.filter((c) => c.id !== id);
    const updated = updateBusinessAccount(account.id, { catalog: updatedCatalog });
    if (updated) onUpdateAccount(updated);

    MessageApiClient.saveCatalogItems(updatedCatalog, account.apiKey).catch(() => null);
  };

  // Sync Catalog with pgvector LangChain RAG pipeline
  const handleSyncRag = async () => {
    setIsSyncingRag(true);
    setRagSyncMessage(null);
    try {
      const res = await MessageApiClient.syncRagEmbeddings(account.apiKey);
      setRagSyncMessage(res.message || "Catalog successfully indexed into pgvector!");
    } catch {
      setRagSyncMessage("Backend offline. Start server with `npm run dev` in /server.");
    } finally {
      setIsSyncingRag(false);
      setTimeout(() => setRagSyncMessage(null), 4000);
    }
  };

  // Save Settings
  const handleSaveSettings = () => {
    const updated = updateBusinessAccount(account.id, {
      businessName,
      ownerName,
      phone,
      workingHours,
      address,
      greetingMessage: greeting,
      aiPersonaPrompt: prompt,
      antiBanDelay: { min: minDelay, max: maxDelay, typingSimulation: typingSim, typingSpeedWpm: 60 }
    });
    if (updated) {
      onUpdateAccount(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);

      // Sync to backend database
      MessageApiClient.updateAccount(account.id, {
        businessName,
        ownerName,
        phone,
        workingHours,
        address,
        greetingMessage: greeting,
        aiPersonaPrompt: prompt
      }, account.apiKey).catch(() => null);
    }
  };

  const handleRefreshQr = () => {
    setQrRefreshed(true);
    setTimeout(() => setQrRefreshed(false), 1200);
  };

  const filteredCatalog = account.catalog.filter((item) => 
    item.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    item.sku.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  const navMenuItems = [
    { id: "dashboard" as DashboardTab, label: "Dashboard", shortLabel: "Dash", icon: LayoutDashboard },
    { id: "session" as DashboardTab, label: "Sessions & WebQR", shortLabel: "Sessions & QR", icon: Key },
    { id: "chat" as DashboardTab, label: "Live Chat & Messaging", shortLabel: "Chat", icon: MessageSquare },
    { id: "rag" as DashboardTab, label: "RAG Knowledge Base", shortLabel: "RAG", icon: Sparkles },
    { id: "mcp" as DashboardTab, label: "MCP and DOC Info", shortLabel: "MCP & Docs", icon: BookOpen },
    { id: "settings" as DashboardTab, label: "Settings", shortLabel: "Settings", icon: Settings },
  ];

  return (
    <div className="h-screen max-h-screen bg-slate-50/70 text-slate-800 flex flex-col md:flex-row font-sans selection:bg-teal-500 selection:text-white overflow-hidden">
      {/* PROFESSIONAL DASHBOARD SIDEBAR (COLLAPSIBLE) */}
      <aside
        className={`w-full ${
          isSidebarOpen ? "md:w-75" : "md:w-[74px]"
        } bg-white border-r border-slate-200/90 flex flex-col justify-between flex-shrink-0 shadow-xs h-full overflow-y-auto transition-all duration-200`}
      >
        {isSidebarOpen ? (
          /* EXPANDED / OPEN SIDEBAR */
          <div className="p-4 space-y-6">
            {/* Store Brand / Industry Header */}
            <div className="space-y-3 pb-4 border-b border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className={`w-10 h-10 rounded-[5px] bg-gradient-to-tr ${industry.themeColor} flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/20 flex-shrink-0`}>
                    <IndustryIcon className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-sm font-black text-slate-900 truncate">{account.businessName}</h3>
                    <span className="text-[10px] font-bold text-teal-600 block truncate">
                      {account.categoryLabel}
                    </span>
                  </div>
                </div>

                {/* Sidebar Close Button */}
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  title="Close Sidebar"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-[5px] transition-colors cursor-pointer flex-shrink-0"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>

              {/* WhatsApp Live Status Pill */}
              <div className="p-2 rounded-[5px] bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-emerald-900">Messageapp Web</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-[5px] font-bold border border-emerald-300">
                  Connected
                </span>
              </div>
            </div>

            {/* SIDEBAR NAVIGATION MENU */}
            <nav className="space-y-1.5">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-2 pb-1">
                Menu Navigation
              </p>

              {navMenuItems.map((item) => {
                const ItemIcon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    title={item.label}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-[5px] text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/20 font-extrabold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <ItemIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ) : (
          /* COLLAPSED / CLOSED SIDEBAR */
          <div className="p-2.5 space-y-3">
            {/* Sidebar Open Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              title="Open Sidebar"
              className="w-full flex items-center justify-center p-2 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-[5px] border border-slate-200/80 transition-all cursor-pointer shadow-2xs group"
            >
              <PanelLeftOpen className="w-4 h-4 text-teal-600 group-hover:scale-110 transition-transform" />
            </button>

            {/* Brand Logo Icon */}
            <div
              title={`${account.businessName} (${account.categoryLabel})`}
              className={`w-10 h-10 mx-auto rounded-[5px] bg-gradient-to-tr ${industry.themeColor} flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/20 cursor-default`}
            >
              <IndustryIcon className="w-5 h-5" />
            </div>

            {/* WhatsApp Live Status Compact Indicator */}
            <div title="Messageapp Web: Connected" className="flex items-center justify-center py-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            <div className="w-full h-px bg-slate-200 my-1" />

            {/* Navigation Menu (Icons + Clear Short Labels + Tooltip) */}
            <nav className="space-y-1.5">
              {navMenuItems.map((item) => {
                const ItemIcon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    title={item.label}
                    className={`w-full flex flex-col items-center justify-center py-2 px-1 rounded-[5px] transition-all cursor-pointer group ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/20 font-extrabold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <ItemIcon className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-[9px] font-bold leading-tight mt-1 truncate max-w-full text-center">
                      {item.shortLabel}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Sidebar Footer Quick Controls */}
        {isSidebarOpen ? (
          <div className="p-3 border-t border-slate-200 bg-slate-50/80 flex-shrink-0 space-y-2">
            <div className="px-2.5 py-1.5 rounded-[5px] bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between text-[11px]">
              <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1 truncate">
                <Globe className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">{account.domain || account.id}</span>
              </span>
              <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded-full font-bold shrink-0">Domain</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    try {
                      window.history.replaceState(null, "", window.location.pathname);
                    } catch (e) {
                      window.location.hash = "";
                    }
                  }
                  onBackToLanding();
                }}
                title="Landing Page"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[5px] text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-100 border border-slate-200 bg-white transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
                <span>Home</span>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Log out of account"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-[5px] text-rose-600 hover:text-rose-700 text-xs font-bold hover:bg-rose-50 border border-rose-200 bg-white transition-all cursor-pointer shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Logout</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2 border-t border-slate-200 bg-slate-50/80 flex-shrink-0 space-y-2">
            <button
              onClick={() => {
                if (typeof window !== "undefined") {
                  try {
                    window.history.replaceState(null, "", window.location.pathname);
                  } catch (e) {
                    window.location.hash = "";
                  }
                }
                onBackToLanding();
              }}
              title="Back to Landing Page"
              className="w-full flex flex-col items-center justify-center py-2 rounded-[5px] text-slate-600 hover:text-slate-900 text-xs font-semibold hover:bg-slate-100 border border-slate-200 bg-white transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-[9px] font-bold mt-0.5">Home</span>
            </button>
            {onLogout && (
              <button
                onClick={onLogout}
                title="Log out of account"
                className="w-full flex flex-col items-center justify-center py-2 rounded-[5px] text-rose-600 hover:text-rose-700 text-xs font-semibold hover:bg-rose-50 border border-rose-200 bg-white transition-all cursor-pointer shadow-xs"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-[9px] font-bold mt-0.5">Exit</span>
              </button>
            )}
          </div>
        )}
      </aside>

      {/* MAIN DASHBOARD CONTENT AREA */}
      <main className="flex-1 bg-slate-50/50 h-full max-h-screen flex flex-col overflow-hidden min-w-0">
        {/* Top Header Bar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3.5 sticky top-0 z-30 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs flex-shrink-0">
          {/* Left: Sidebar Toggle + Business Info Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Owner Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-slate-50/90 hover:bg-slate-100 border border-slate-200 text-xs shadow-2xs transition-all">
              <div className="w-5 h-5 rounded-[5px] bg-teal-100/80 text-teal-700 flex items-center justify-center font-bold flex-shrink-0">
                <User className="w-3 h-3 text-teal-700" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Owner:</span>
                <span className="font-bold text-slate-900">{account.ownerName}</span>
              </div>
            </div>

            {/* Phone Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-slate-50/90 hover:bg-slate-100 border border-slate-200 text-xs shadow-2xs transition-all">
              <div className="w-5 h-5 rounded-[5px] bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                <Phone className="w-3 h-3 text-emerald-700" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Phone:</span>
                <span className="font-mono font-bold text-slate-900">{account.phone}</span>
              </div>
            </div>

            {/* Hours Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-[5px] bg-slate-50/90 hover:bg-slate-100 border border-slate-200 text-xs shadow-2xs transition-all">
              <div className="w-5 h-5 rounded-[5px] bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
                <Clock className="w-3 h-3 text-blue-700" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Hours:</span>
                <span className="font-semibold text-slate-700">{account.workingHours}</span>
              </div>
            </div>
          </div>

          {/* Header Quick Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Domain Identifier Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-slate-50 border border-slate-200 text-xs shadow-2xs font-mono">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-500 text-[10px]">Domain:</span>
              <span className="font-bold text-slate-800">{account.domain || account.id}</span>
            </div>

            <button
              onClick={() => handleSelectTab("chat")}
              className="px-4 py-2 rounded-[5px] bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 hover:opacity-95 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-teal-500/20 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Test Bot</span>
            </button>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className={`flex-1 min-h-0 w-full ${activeTab === "chat" ? "p-3 sm:p-5 flex flex-col overflow-hidden" : "overflow-y-auto p-6 sm:p-8 max-w-12xl mx-auto space-y-8"}`}>
          {/* TAB 1: DASHBOARD (Overview & Industry-Tailored Operations) */}
          {activeTab === "dashboard" && (
            <div className="space-y-8">
              {/* Industry Hero Banner */}
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white shadow-xl shadow-teal-600/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 blur-[90px] rounded-full pointer-events-none" />
                <div className="relative z-10 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold border border-white/30 backdrop-blur-xs">
                    <Activity className="w-3.5 h-3.5 text-white" />
                    <span>{industry.roleTitle}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Welcome back, {account.ownerName}! 👋
                  </h2>
                  <p className="text-xs sm:text-sm text-teal-50 max-w-2xl leading-relaxed font-medium">
                    Your 24/7 AI WhatsApp gateway for <strong>{account.businessName}</strong> is actively responding to inquiries, checking live stock, calculating orders, and pacing responses safely with zero Meta fees.
                  </p>
                </div>
              </div>

              {/* 4 INDUSTRY-SPECIFIC KPI METRICS */}
              {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {industry.kpis.map((kpi, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 hover:border-teal-400 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{kpi.title}</span>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                        {kpi.change}
                      </span>
                    </div>
                    <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{kpi.subtext}</p>
                  </div>
                ))}
              </div> */}

              {/* LIVE CATALOG & PGVECTOR RAG MANAGEMENT */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>LangChain pgvector RAG Pipeline</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Live Inventory &amp; Vector Search Catalog</h3>
                    <p className="text-xs text-slate-500">
                      Items indexed here are queried by the AI WhatsApp assistant using semantic vector embeddings on PostgreSQL.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleSyncRag}
                      disabled={isSyncingRag}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 hover:opacity-95 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-teal-500/20 transition-all"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingRag ? "animate-spin" : ""}`} />
                      <span>{isSyncingRag ? "Syncing pgvector..." : "⚡ Sync pgvector RAG"}</span>
                    </button>
                  </div>
                </div>

                {ragSyncMessage && (
                  <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>{ragSyncMessage}</span>
                  </div>
                )}

                {/* Add New Product Form */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Quick Add Product / SKU</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={catalogPdfInputRef}
                        onChange={handleCatalogPdfUpload}
                        accept=".pdf,application/pdf"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => catalogPdfInputRef.current?.click()}
                        disabled={isUploadingCatalogPdf}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        title="Upload PDF catalog to auto-extract items"
                      >
                        {isUploadingCatalogPdf ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-600" />
                            <span>Parsing PDF...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-3.5 h-3.5 text-rose-600" />
                            <span>Upload PDF Catalog (.pdf)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {catalogPdfMessage && (
                    <div
                      className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        catalogPdfMessage.type === "success"
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                          : "bg-rose-50 border border-rose-200 text-rose-800"
                      }`}
                    >
                      {catalogPdfMessage.type === "success" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      )}
                      <span>{catalogPdfMessage.text}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Item Name (e.g. Dolo 650mg)"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="sm:col-span-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                    />

                    {/* Category Dropdown & Custom Category Input */}
                    <div className="sm:col-span-1">
                      {!isCustomCategory ? (
                        <select
                          value={newProdCategory}
                          onChange={(e) => {
                            if (e.target.value === "__custom__") {
                              setIsCustomCategory(true);
                              setCustomCategoryInput("");
                            } else {
                              setNewProdCategory(e.target.value);
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-teal-500 font-medium"
                        >
                          {categoryPresets.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                          <option value="__custom__">+ Custom Category...</option>
                        </select>
                      ) : (
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Custom Category"
                            value={customCategoryInput}
                            onChange={(e) => setCustomCategoryInput(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 pr-6 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setIsCustomCategory(false)}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                            title="Back to dropdown presets"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <input
                      type="number"
                      placeholder="Price (₹)"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                    />
                    <input
                      type="number"
                      placeholder="Stock Qty"
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(e.target.value)}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                    />
                    <button
                      onClick={handleAddProduct}
                      disabled={!newProdName.trim() || !newProdPrice.trim()}
                      className={`rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                        newProdName.trim() && newProdPrice.trim()
                          ? "bg-teal-600 hover:bg-teal-700 text-white shadow-xs cursor-pointer"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Item</span>
                    </button>
                  </div>
                </div>

                {/* Search & Catalog Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search live catalog by name, category, or SKU..."
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      Total Active SKUs: <strong className="text-slate-900">{filteredCatalog.length}</strong>
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3 pl-4">SKU</th>
                          <th className="p-3">Product Name</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Price</th>
                          <th className="p-3">Stock</th>
                          <th className="p-3 pr-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredCatalog.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 pl-4 font-mono font-bold text-teal-700 text-[11px]">{item.sku}</td>
                            <td className="p-3 font-bold text-slate-900">{item.name}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                                {item.category}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-slate-900">
                              {account.currency}{item.price.toFixed(2)}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.stock > 0
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                              }`}>
                                {item.stock > 0 ? `${item.stock} ${item.unit} in stock` : "Out of stock"}
                              </span>
                            </td>
                            <td className="p-3 pr-4 text-right">
                              <button
                                onClick={() => handleRemoveProduct(item.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete SKU"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredCatalog.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400">
                              No items match &quot;{catalogSearch}&quot;
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SETTINGS (Store Profile, Anti-Ban Engine, AI Persona) */}
          {activeTab === "settings" && (
            <div className="max-w-12xl mx-auto space-y-8">
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-base font-black text-slate-900">Store Profile &amp; Operating Hours</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update business contact info used in customer automated replies.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <label className="block mb-1.5 text-slate-700">Business Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-700">Owner / Manager Name</label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-700">WhatsApp Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-700">Working / Operating Hours</label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block mb-1.5 text-slate-700">Store Address / Location</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>

              {/* ANTI-BAN PACING CONTROLS */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-teal-600" />
                    <h3 className="text-base font-black text-slate-900">Anti-Ban Pacing &amp; Human Typing Engine</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Prevents automated number bans by simulating natural typing presence and randomized delays.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="space-y-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-700">Minimum Delay:</span>
                      <span className="font-mono text-teal-600">{minDelay} seconds</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="20"
                      value={minDelay}
                      onChange={(e) => setMinDelay(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-700">Maximum Delay:</span>
                      <span className="font-mono text-teal-600">{maxDelay} seconds</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="35"
                      value={maxDelay}
                      onChange={(e) => setMaxDelay(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <p className="font-bold text-slate-900">Simulate Human Typing Presence</p>
                      <p className="text-slate-500 text-[11px]">Shows &apos;typing...&apos; indicator on WhatsApp before sending</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={typingSim}
                      onChange={(e) => setTypingSim(e.target.checked)}
                      className="w-5 h-5 accent-teal-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* AI PERSONA & GREETING */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-teal-600" />
                    <h3 className="text-base font-black text-slate-900">AI Persona &amp; Greeting Customization</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Customize how your assistant greets customers and handles questions for {account.businessName}.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block mb-1.5 text-slate-700">Welcome / Greeting Message</label>
                    <textarea
                      rows={3}
                      value={greeting}
                      onChange={(e) => setGreeting(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed font-sans"
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5 text-slate-700">AI Prompt System Persona</label>
                    <textarea
                      rows={4}
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 leading-relaxed font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* ACCOUNT AUTHENTICATION & PASSWORD SECURITY */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
                <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-emerald-600" />
                      <h3 className="text-base font-black text-slate-900">Account Authentication &amp; Password Security</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Update the login credentials used to access your business domain and WhatsApp sessions.
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Company Domain:</span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block">
                      {account.domain || account.id}
                    </span>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-semibold">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block mb-1 text-slate-700">Current Password (optional)</label>
                      <input
                        type="password"
                        value={currentPasswordInput}
                        onChange={(e) => setCurrentPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-700">New Password * (Min 6 chars)</label>
                      <input
                        type="password"
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block mb-1 text-slate-700">Confirm New Password *</label>
                      <input
                        type="password"
                        value={confirmPasswordInput}
                        onChange={(e) => setConfirmPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {isUpdatingPassword ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Update Account Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveSettings}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 hover:opacity-95 text-white font-extrabold text-sm shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {savedSuccess ? <Check className="w-4 h-4" /> : null}
                <span>{savedSuccess ? "All Profile Settings Saved Successfully!" : "Save All Profile Settings"}</span>
              </button>
            </div>
          )}



          {/* TAB 4: LIVE CHAT & MESSAGING (Authentic WhatsApp Web Interface & Complete Features) */}
          {activeTab === "chat" && (
            <div className="bg-white rounded-md border border-slate-200/90 shadow-xl overflow-hidden flex flex-col md:flex-row h-full min-h-0 flex-1">
              {/* WhatsApp Left Sidebar: Contacts, Search & Filter Tabs */}
              <div className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 h-full min-h-0">
                {/* Contacts Header */}
                <div className="p-3.5 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${industry.themeColor} flex items-center justify-center text-white font-bold text-xs shadow-xs`}>
                      <IndustryIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 truncate max-w-[140px]">{account.businessName}</h4>
                      <span className="text-[10px] text-teal-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        WhatsApp Business
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500">
                    <button 
                      onClick={() => setAiAutoPilot(!aiAutoPilot)} 
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                        aiAutoPilot 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300" 
                          : "bg-slate-200 text-slate-600 border-slate-300"
                      }`}
                      title="Toggle AI Auto-Responder"
                    >
                      {aiAutoPilot ? "AI Active" : "Manual"}
                    </button>
                    {/* <button className="p-1.5 hover:bg-slate-200/80 rounded-full transition-colors" title="Filter chats">
                      <Filter className="w-4 h-4" />
                    </button> */}
                    <div className="relative">
                      <button 
                        onClick={() => setChatMenuOpen(!chatMenuOpen)}
                        className={`p-1.5 rounded-full transition-colors ${
                          chatMenuOpen ? "bg-slate-200 text-slate-900" : "hover:bg-slate-200/80 text-slate-500"
                        }`}
                        title="Chat Menu"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Three Dots Dropdown Menu */}
                      {chatMenuOpen && (
                        <>
                          <div 
                            className="fixed inset-0 z-30" 
                            onClick={() => setChatMenuOpen(false)} 
                          />
                          <div className="absolute right-0 top-8 w-56 bg-white rounded-[5px] shadow-xl border border-slate-200/90 p-1.5 z-40 space-y-1 animate-in fade-in slide-in-from-top-1">
                            {/* 1. Add Chat */}
                            <button
                              onClick={() => {
                                setChatMenuOpen(false);
                                setShowAddChatModal(true);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-[5px] transition-all text-left cursor-pointer group"
                            >
                              <div className="w-6 h-6 rounded-[5px] bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                                <UserPlus className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-medium">Add New Chat</span>
                            </button>

                            {/* 2. Change Session */}
                            <button
                              onClick={() => {
                                setChatMenuOpen(false);
                                setSelectedSessionToSwitch(activeSessionId);
                                setShowChangeSessionModal(true);
                              }}
                              className="w-full flex items-start gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-teal-700 hover:bg-slate-50 rounded-[5px] transition-all text-left cursor-pointer group"
                            >
                              <div className="w-6 h-6 rounded-[5px] bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors mt-0.5">
                                <RefreshCw className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-slate-800 block">Change Session</span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                                  <span className="text-[10px] text-slate-500 truncate font-medium">
                                    {sessions.find((s) => s.id === activeSessionId && s.status === "CONNECTED")?.name || "No Connected Session"}
                                  </span>
                                </div>
                              </div>
                            </button>

                            <div className="border-t border-slate-100 my-1" />

                            {/* 3. Delete All Chats */}
                            <button
                              onClick={() => {
                                setChatMenuOpen(false);
                                setShowDeleteAllModal(true);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-[5px] transition-all text-left cursor-pointer group"
                            >
                              <div className="w-6 h-6 rounded-[5px] bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover:bg-rose-100 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </div>
                              <span className="font-medium">Delete All Chats</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Active Session Status & Switcher Strip */}
                <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs flex-shrink-0">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <Key className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                    <span className="font-bold text-slate-700 truncate text-[11px]">
                      {sessions.find((s) => s.id === activeSessionId && s.status === "CONNECTED")?.name ||
                       sessions.filter((s) => s.status === "CONNECTED")[0]?.name ||
                       "No Connected WhatsApp Session"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {sessions.filter((s) => s.status === "CONNECTED").length > 0 ? (
                      <span className="px-2 py-0.5 rounded-[5px] text-[9px] font-extrabold border bg-emerald-50 text-emerald-700 border-emerald-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>CONNECTED</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-[5px] text-[9px] font-extrabold border bg-amber-50 text-amber-700 border-amber-300">
                        DISCONNECTED
                      </span>
                    )}
                    {sessions.filter((s) => s.status === "CONNECTED").length > 1 && (
                      <button
                        onClick={() => {
                          setSelectedSessionToSwitch(activeSessionId);
                          setShowChangeSessionModal(true);
                        }}
                        className="text-[10px] text-teal-600 hover:text-teal-800 font-extrabold underline cursor-pointer"
                      >
                        Switch
                      </button>
                    )}
                  </div>
                </div>

                {/* Search & Filter Tabs */}
                <div className="p-2.5 border-b border-slate-100 space-y-2 bg-white flex-shrink-0">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search or start new chat"
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      className="w-full bg-slate-100 text-slate-900 placeholder-slate-400 text-xs rounded-sm pl-8 pr-3 py-3 border border-transparent focus:border-teal-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-1.5 text-[11px] font-bold">
                    <button
                      onClick={() => setContactFilter("all")}
                      className={`px-3 py-1 rounded-full transition-colors ${
                        contactFilter === "all"
                          ? "bg-teal-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setContactFilter("unread")}
                      className={`px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                        contactFilter === "unread"
                          ? "bg-teal-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>Unread</span>
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center font-black">
                        {contacts.filter((c) => c.unreadCount > 0).length}
                      </span>
                    </button>
                    <button
                      onClick={() => setContactFilter("leads")}
                      className={`px-3 py-1 rounded-full transition-colors ${
                        contactFilter === "leads"
                          ? "bg-teal-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      Leads &amp; Orders
                    </button>
                  </div>
                </div>

                {/* Contacts Scrollable List */}
                <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 bg-white">
                  {contacts
                    .filter((c) => {
                      const matchSearch =
                        c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
                        c.phone.includes(contactSearch) ||
                        c.lastMessage.toLowerCase().includes(contactSearch.toLowerCase());
                      if (contactFilter === "unread") return matchSearch && c.unreadCount > 0;
                      if (contactFilter === "leads") return matchSearch && (c.tag.includes("Order") || c.tag.includes("Priority"));
                      return matchSearch;
                    })
                    .map((c) => {
                      const isActive = c.id === activeContactId;
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleSelectContact(c.id)}
                          className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors relative group ${
                            isActive ? "bg-slate-100/90" : "hover:bg-slate-50"
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <div className={`w-11 h-11 rounded-full ${c.avatarBg} text-white font-black text-sm flex items-center justify-center shadow-xs`}>
                              {c.initials}
                            </div>
                            {c.isOnline && (
                              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <h5 className="text-xs font-bold text-slate-900 truncate">{c.name}</h5>
                              <span className={`text-[10px] ${c.unreadCount > 0 ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                                {c.lastTime}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                                {c.messages[c.messages.length - 1]?.sender === "business" && (
                                  <CheckCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                                )}
                                <span className="truncate">
                                  {c.lastMessage ? c.lastMessage.replace(/\*+/g, "").replace(/_+/g, "") : ""}
                                </span>
                              </p>

                              {c.unreadCount > 0 && (
                                <span className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center flex-shrink-0 shadow-xs">
                                  {c.unreadCount}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-1 pt-0.5">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-semibold truncate max-w-[130px]">
                                {c.tag}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setContactToDelete(c);
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                                title="Delete this chat"
                              >
                                <Trash2 className="w-3.5 h-3.5 hover:scale-110 transition-transform" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                  {contacts.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                      <p className="font-bold text-slate-700">No chats yet</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {sessions.filter((s) => s.status === "CONNECTED").length === 0
                          ? "No WhatsApp session connected. Go to Sessions or WebQR to pair a device."
                          : "When a customer messages your linked WhatsApp, the conversation and AI RAG responses will appear here live."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* WhatsApp Right Main Chat Window */}
              {activeContact ? (
                <div className="flex-1 min-h-0 flex flex-col h-full bg-[#efeae2]/40 relative">
                {/* Active Chat Header / Multi-Select Action Bar */}
                {selectedMessageIds.length > 0 ? (
                  <div className="p-3.5 bg-teal-800 text-white border-b border-teal-900 flex items-center justify-between flex-shrink-0 z-20 shadow-xs animate-in fade-in duration-150">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedMessageIds([])}
                        className="p-1.5 rounded-full hover:bg-white/15 text-white/90 hover:text-white transition-colors cursor-pointer"
                        title="Cancel selection (Esc)"
                      >
                        <X className="w-5 h-5" />
                      </button>
                      <span className="text-xs sm:text-sm font-bold tracking-wide">
                        {selectedMessageIds.length} {selectedMessageIds.length === 1 ? "message selected" : "messages selected"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mr-2.5">
                      {/* PIN / UNPIN ICON BUTTON (Only 1 message can pin) */}
                      {selectedMessageIds.length === 1 && (() => {
                        const targetId = selectedMessageIds[0];
                        const isSelectedPinned =
                          activeContact.pinnedMessageId === targetId ||
                          Boolean(activeContact.messages.find((m) => m.id === targetId)?.isPinned);

                        return (
                          <button
                            type="button"
                            onClick={handleTogglePinSelected}
                            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                              isSelectedPinned
                                ? "bg-amber-400 text-amber-950 hover:bg-amber-300 shadow-xs"
                                : "bg-white/10 hover:bg-white/20 text-white"
                            }`}
                            title={isSelectedPinned ? "Unpin message" : "Pin message"}
                          >
                            {isSelectedPinned ? (
                              <>
                                <PinOff className="w-4 h-4" />
                                <span className="hidden sm:inline">Unpin</span>
                              </>
                            ) : (
                              <>
                                <Pin className="w-4 h-4" />
                                <span className="hidden sm:inline">Pin</span>
                              </>
                            )}
                          </button>
                        );
                      })()}

                      {/* DELETE ICON BUTTON */}
                      <button
                        type="button"
                        onClick={() => setShowDeleteMessagesModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all flex items-center gap-1.5 text-xs font-bold shadow-xs cursor-pointer"
                        title={`Delete ${selectedMessageIds.length} message(s)`}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-100/95 border-b border-slate-200 flex items-center justify-between flex-shrink-0 z-10">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full ${activeContact.avatarBg} text-white font-black text-sm flex items-center justify-center shadow-xs`}>
                          {activeContact.initials}
                        </div>
                        {activeContact.isOnline && (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                        )}
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{activeContact.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal font-mono">
                            {activeContact.phone?.includes("@lid") || activeContact.phone?.startsWith("+200")
                              ? "WhatsApp (LID Linked)"
                              : activeContact.phone}
                          </span>
                        </h4>
                        <p className="text-[10px] text-teal-700 font-medium">
                          {isTyping ? "typing..." : activeContact.statusText}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mr-3">
                      <div className="px-3 py-1.5 rounded-[5px] text-xs font-semibold flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>💬 Store Direct Chat • Live WhatsApp</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sticky Pinned Message in Top Bar */}
                {(() => {
                  const pinnedMsg =
                    activeContact?.messages.find((m) => m.id === activeContact?.pinnedMessageId && m.isPinned !== false) ||
                    activeContact?.messages.find((m) => m.isPinned);
                  if (!pinnedMsg || pinnedMsg.isPinned === false) return null;
                  const rawPinnedText = pinnedMsg.text
                    ? pinnedMsg.text.replace(/\[IMAGE_URL:\s*https?:\/\/[^\]\s]+\]/gi, "").replace(/\*+/g, "").replace(/_+/g, "").trim()
                    : pinnedMsg.mediaUrl ? "Media Attachment" : "Message";

                  // User rule: if below text length 10 then show full, otherwise split at 10 + "..."
                  const displaySnippet =
                    rawPinnedText.length <= 10
                      ? rawPinnedText
                      : `${rawPinnedText.slice(0, 10)}...`;

                  return (
                    <div
                      onClick={handleScrollToPinned}
                      className="px-4 py-2 bg-white/95 backdrop-blur-xs border-b border-teal-200/60 shadow-2xs flex items-center justify-between cursor-pointer hover:bg-teal-50/40 transition-colors z-10"
                      title="Click to jump to pinned message"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                          <Pin className="w-3.5 h-3.5 text-teal-700 fill-teal-600/30" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider">Pinned Message</span>
                            <span className="text-[10px] text-slate-400">• {pinnedMsg.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-700 truncate font-medium flex items-center gap-1">
                            <span className="font-bold text-slate-900">
                              {pinnedMsg.sender === "customer" ? `${activeContact.name}:` : "You:"}
                            </span>
                            <span>{displaySnippet || "Pinned message"}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleScrollToPinned();
                          }}
                          className="px-2.5 py-1 rounded-[5px] bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          title="Jump to pinned message"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3 text-teal-600" />
                        </button>
                        <button
                          type="button"
                          onClick={handleUnpinDirectly}
                          className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Unpin message"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Messages Canvas */}
                <div 
                  ref={chatMessagesContainerRef}
                  className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3 bg-[#efeae2]/30 scroll-smooth"
                >
                  {/* End-to-End Encryption Notice */}
                  <div className="max-w-md mx-auto p-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 text-center text-[11px] text-amber-900 shadow-xs space-y-1">
                    <div className="flex items-center justify-center gap-1.5 font-bold">
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>End-to-End Encrypted Live Stream</span>
                    </div>
                    <p className="text-[10px] text-amber-800/90 leading-tight">
                      Zero Meta conversation fees. Connected to <strong>{account.businessName}</strong> AI Autonomous Gateway.
                    </p>
                  </div>

                  {/* Date Pill */}
                  <div className="flex justify-center my-2">
                    <span className="bg-white text-slate-500 text-[10px] font-bold px-3 py-1 rounded-lg shadow-xs border border-slate-200/60 uppercase">
                      Today
                    </span>
                  </div>

                  {/* Messages Stream */}
                  {isLoadingMessages && (!activeContact.messages || activeContact.messages.length === 0) ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400 animate-in fade-in">
                      <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
                      <span className="text-xs font-medium text-slate-500">Restoring encrypted message history...</span>
                    </div>
                  ) : (!activeContact.messages || activeContact.messages.length === 0) ? (
                    activeContact.lastMessage && activeContact.lastMessage !== "Chat opened" ? (
                      <div className="space-y-3">
                        <div className={`flex ${activeContact.lastMessage.startsWith("💪") || activeContact.lastMessage.startsWith("Here is your image") || activeContact.lastMessage.toLowerCase().includes("welcome to") ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${activeContact.lastMessage.startsWith("💪") || activeContact.lastMessage.startsWith("Here is your image") || activeContact.lastMessage.toLowerCase().includes("welcome to") ? "bg-[#d9fdd3] text-slate-800" : "bg-white text-slate-800"}`}>
                            <p className="leading-relaxed whitespace-pre-wrap">{activeContact.lastMessage.replace(/\*+/g, "").replace(/_+/g, "")}</p>
                            <span className="text-[9px] text-slate-400 block text-right mt-1">{activeContact.lastTime || "Earlier"}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-slate-400 space-y-1.5 animate-in fade-in">
                        <p className="text-xs font-bold text-slate-600">Conversation started</p>
                        <p className="text-[11px] text-slate-400">Send a message below to chat with {activeContact.name} on WhatsApp.</p>
                      </div>
                    )
                  ) : null}
                  {activeContact.messages.map((m) => {
                    const isUser = m.sender === "customer";
                    const normalizedType = (m.messageType || "").toLowerCase();

                    const pdfUrlMatch = m.text.match(/\[PDF_URL:\s*(https?:\/\/[^\]\s]+)\]/i);
                    const pdfNameMatch = m.text.match(/•\s*\*Document:\*\s*([^\n\r]+)/i) || m.text.match(/\[PDF_NAME:\s*([^\]\s]+)\]/i);

                    const isDoc =
                      normalizedType === "document" ||
                      !!pdfUrlMatch ||
                      !!pdfNameMatch ||
                      (!!m.mediaUrl && (/\.pdf($|\?)/i.test(m.mediaUrl) || m.mediaUrl.includes("gym_pdf") || m.mediaUrl.includes("/raw/upload"))) ||
                      m.text.includes("[PDF Document]") ||
                      m.text.includes("[PDF_NAME:") ||
                      m.text.includes("[PDF_URL:") ||
                      m.text.includes("official PDF document") ||
                      m.text.includes("Document:* gym_pdf");

                    const isVoice =
                      normalizedType === "audio" ||
                      m.text.includes("🎙️") ||
                      m.text.includes("[User sent a voice message") ||
                      (!!m.mediaUrl && /\.(ogg|mp3|wav|m4a)($|\?)/i.test(m.mediaUrl));

                    // Image detection - STRICTLY EXCLUDES ANY DOCUMENT OR VOICE MESSAGE
                    const imageUrlMatch = !isDoc && !isVoice ? m.text.match(/\[IMAGE_URL:\s*(https?:\/\/[^\]\s]+)\]/i) : null;
                    const rawImgUrl = !isDoc && !isVoice
                      ? (imageUrlMatch ? imageUrlMatch[1] : (normalizedType === "image" ? (m.mediaUrl || "") : (m.mediaUrl && /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(m.mediaUrl) ? m.mediaUrl : "")))
                      : "";

                    const resolvedImageUrl = rawImgUrl
                      ? (rawImgUrl.startsWith("http") ? rawImgUrl : `${BACKEND_URL}${rawImgUrl}`)
                      : "";

                    const hasImage =
                      !isDoc &&
                      !isVoice &&
                      normalizedType !== "document" &&
                      normalizedType !== "audio" &&
                      !!resolvedImageUrl &&
                      (normalizedType === "image" ||
                        !!imageUrlMatch ||
                        /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(resolvedImageUrl) ||
                        resolvedImageUrl.includes("/uploads/gen_image") ||
                        (resolvedImageUrl.includes("cloudinary.com") && !resolvedImageUrl.includes("/raw/upload") && !resolvedImageUrl.includes(".pdf") && !resolvedImageUrl.includes("gym_pdf")));

                    const rawDocUrl = pdfUrlMatch
                      ? pdfUrlMatch[1]
                      : (isDoc && m.mediaUrl ? m.mediaUrl : "");

                    const resolvedDocUrl = rawDocUrl
                      ? (rawDocUrl.startsWith("http") ? rawDocUrl : `${BACKEND_URL}${rawDocUrl}`)
                      : "";

                    const downloadDocUrl = resolvedDocUrl.includes("res.cloudinary.com") && resolvedDocUrl.includes("/upload/")
                      ? resolvedDocUrl.replace("/upload/", "/upload/fl_attachment/")
                      : resolvedDocUrl;

                    let docName = pdfNameMatch
                      ? pdfNameMatch[1].trim()
                      : (rawDocUrl && (rawDocUrl.includes(".pdf") || rawDocUrl.includes("gym_pdf"))
                          ? rawDocUrl.split("/").pop()?.split("?")[0] || ""
                          : `gym_pdf_${Date.now()}.pdf`);

                    if (docName && !docName.endsWith(".pdf")) {
                      docName = `${docName}.pdf`;
                    }

                    const cleanedText = m.text
                      .replace(/\[IMAGE_URL:\s*https?:\/\/[^\]\s]+\]/gi, "")
                      .replace(/\[PDF_URL:\s*https?:\/\/[^\]\s]+\]/gi, "")
                      .replace(/\[PDF_NAME:\s*[^\]\s]+\]/gi, "")
                      .replace(/\[PDF Document\]/gi, "")
                      .trim();

                    // Parse potential voice message transcript
                    const voiceTranscriptMatch = cleanedText.match(/\[User sent a voice message\.\s*Transcript:\s*"(.*?)"\]/s);
                    const voiceTranscript = voiceTranscriptMatch ? voiceTranscriptMatch[1] : null;
                    const displaySpeechText = voiceTranscript || cleanedText.replace(/🎙️\s*\[.*?\]\s*/, "").trim();

                    const isSelected = selectedMessageIds.includes(m.id);
                    const isPinned = Boolean(m.isPinned || (activeContact?.pinnedMessageId === m.id && m.isPinned !== false));

                    return (
                      <div
                        id={`msg_${m.id}`}
                        key={m.id}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleMessageDoubleClick(m.id);
                        }}
                        onClick={(e) => {
                          if (selectedMessageIds.length > 0) {
                            e.stopPropagation();
                            handleMessageClick(m.id);
                          }
                        }}
                        className={`flex items-center gap-2.5 transition-all duration-150 select-none ${
                          isUser ? "justify-start" : "justify-end"
                        } ${isSelected ? "bg-teal-600/10 -mx-3 px-3 py-1.5 rounded-xl" : ""}`}
                      >
                        {/* Checkbox indicator when in selection mode */}
                        {selectedMessageIds.length > 0 && (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMessageClick(m.id);
                            }}
                            className={`w-4 h-4 rounded-[4px] flex items-center justify-center cursor-pointer transition-all flex-shrink-0 ${
                              isSelected
                                ? "bg-teal-600 text-white shadow-xs"
                                : "border-2 border-slate-300 bg-white hover:border-teal-500"
                            }`}
                            title={isSelected ? "Deselect" : "Select"}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        )}

                        <div className={`max-w-[88%] sm:max-w-[72%] rounded-2xl p-3 text-xs shadow-xs relative transition-all ${
                          isSelected ? "ring-2 ring-teal-500 shadow-md scale-[1.005]" : ""
                        } ${
                          isUser
                            ? "bg-white text-slate-800 rounded-tl-xs border border-slate-200/80"
                            : "bg-[#d9fdd3] text-slate-900 rounded-tr-xs border border-emerald-200/60"
                        } ${selectedMessageIds.length > 0 ? "cursor-pointer" : ""}`}>
                          {/* AI Image Attachment Preview Card - NEVER for documents */}
                          {hasImage && resolvedImageUrl && (
                            <div className="mb-2">
                              <ChatImageAttachment
                                imageUrl={resolvedImageUrl}
                                caption={cleanedText}
                                isUser={isUser}
                              />
                            </div>
                          )}

                          {/* PDF Document Card - Clean File Name + Direct Download Option (No Preview) */}
                          {isDoc && (
                            <div className="p-2.5 sm:p-3 rounded-xl bg-white/95 border border-rose-200/90 shadow-xs mb-2 text-left">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                  <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                    <FileText className="w-5 h-5 text-rose-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">PDF</span>
                                      <p className="font-bold text-slate-900 truncate text-xs" title={docName}>
                                        {docName}
                                      </p>
                                    </div>
                                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                      Official PDF Document
                                    </p>
                                  </div>
                                </div>

                                {resolvedDocUrl && (
                                  <a
                                    href={downloadDocUrl}
                                    download={docName}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex-shrink-0 py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                                    title="Download PDF"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Download</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Voice Note Player UI */}
                          {isVoice ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2.5 bg-black/5 dark:bg-white/5 p-2 rounded-xl">
                                <button
                                  type="button"
                                  onClick={() => handlePlayAudio(m.id, m.mediaUrl, displaySpeechText)}
                                  className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs transition-colors flex-shrink-0 cursor-pointer"
                                  title={playingAudioId === m.id ? "Pause Voice Note" : "Play Voice Note"}
                                >
                                  {playingAudioId === m.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                                </button>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center gap-1 h-4">
                                    {[35, 70, 30, 95, 60, 100, 45, 85, 50, 75, 40, 95, 60, 40].map((h, idx) => (
                                      <span
                                        key={idx}
                                        style={{ height: `${h}%` }}
                                        className={`w-1 rounded-full transition-all duration-200 ${
                                          playingAudioId === m.id ? "bg-emerald-600 animate-pulse" : "bg-slate-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                                    <span>{playingAudioId === m.id ? "Playing audio..." : "Voice Note"}</span>
                                    <span className="flex items-center gap-1 font-semibold text-emerald-700">
                                      <Mic className="w-2.5 h-2.5" />
                                      {isUser ? "Customer Voice" : "AI Voice (PTT)"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Voice Note Transcript & Text Message attached */}
                              {displaySpeechText && (
                                <div className={`p-2.5 rounded-xl border leading-relaxed ${
                                  isUser
                                    ? "bg-slate-50/90 text-slate-700 border-slate-200/80 text-[11px]"
                                    : "bg-white/90 text-slate-900 border-emerald-200/70 text-xs"
                                }`}>
                                  {isUser && voiceTranscript && (
                                    <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-amber-500" />
                                      Groq Whisper Transcript
                                    </div>
                                  )}
                                  <div className="whitespace-pre-line font-sans">
                                    <WhatsAppText text={displaySpeechText} />
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            cleanedText ? (
                              <div className="whitespace-pre-line leading-relaxed font-sans">
                                <WhatsAppText text={cleanedText} />
                              </div>
                            ) : null
                          )}

                          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-slate-400">
                            {isPinned && (
                              <span className="inline-flex items-center gap-0.5 text-teal-800 font-extrabold bg-teal-50 px-1 py-0.2 rounded border border-teal-200 text-[8px] mr-1">
                                <Pin className="w-2.5 h-2.5 fill-teal-600/40" />
                                <span>Pinned</span>
                              </span>
                            )}
                            <span>{m.timestamp}</span>
                            {!isUser && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-end">
                      <div className="bg-[#d9fdd3] text-slate-900 rounded-2xl rounded-tr-xs p-2.5 text-xs flex items-center gap-2 shadow-xs border border-emerald-200">
                        <span className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce" />
                        </span>
                        <span className="text-[11px] text-emerald-800 font-semibold">MessageAPI is composing...</span>
                      </div>
                    </div>
                  )}

                  {/* Invisible scroll target */}
                  <div ref={chatMessagesEndRef} />
                </div>

                {/* Suggested Quick Prompt Chips */}
                {/* Store Quick Replies (Agent Canned Responses) */}
                <div className="p-2 bg-slate-100/90 border-t border-slate-200 overflow-x-auto flex items-center gap-1.5 flex-shrink-0 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-1 flex-shrink-0">
                    ⚡ Quick Store Replies:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleSubject =
                        account.category === "gym"
                          ? "Please generate a gym equipment image"
                          : account.category === "medicine"
                          ? "Please generate an organized pharmacy medicine shelves image"
                          : account.category === "grocery"
                          ? "Please generate a fresh organic fruits basket image"
                          : account.category === "electronics"
                          ? "Please generate a gaming battle station desk image"
                          : account.category === "restaurant"
                          ? "Please generate a signature gourmet biryani platter image"
                          : account.category === "salon"
                          ? "Please generate a luxury spa hair makeover salon image"
                          : "Please generate an image of our business office";
                      setInputPrompt(sampleSubject);
                    }}
                    className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold whitespace-nowrap transition-colors shadow-2xs cursor-pointer flex items-center gap-1"
                    title="Insert category-specific AI image creation prompt"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span>🎨 Test AI Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const greet = (account.greetingMessage || `Hello! Welcome to ${account.businessName}! How can we assist you today?`)
                        .replace(/{BusinessName}/g, account.businessName);
                      setInputPrompt(greet);
                    }}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[11px] font-medium whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
                    title="Insert welcome greeting into message"
                  >
                    👋 Insert Greeting
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputPrompt(`🕒 We are open *${account.workingHours}*. Feel free to visit us or contact our front desk at *${account.phone}*!`);
                    }}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[11px] font-medium whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
                    title="Insert working hours into message"
                  >
                    ⏰ Operating Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputPrompt(`📍 Our store location is: *${account.address || "Main Road"}*. Contact: *${account.phone}*. Let us know if you need directions!`);
                    }}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[11px] font-medium whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
                    title="Insert location into message"
                  >
                    📍 Store Location
                  </button>
                  {account.catalog.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setInputPrompt(`🏷️ *${item.name}* is available at *${account.currency}${item.price.toFixed(2)}*${item.unit && item.unit !== "pcs" ? ` / ${item.unit}` : ""}.${item.description ? ` Details: ${item.description}` : ""}`);
                      }}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-slate-700 text-[11px] font-medium whitespace-nowrap transition-colors shadow-2xs cursor-pointer"
                      title={`Insert info for ${item.name}`}
                    >
                      🏷️ {item.name}
                    </button>
                  ))}
                </div>

                {/* Attachment Drawer Menu */}
                {attachmentMenuOpen && (
                  <div className="absolute bottom-16 left-4 bg-white border border-slate-200 rounded-[5px] shadow-xl p-3 z-30 grid grid-cols-2 gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
                    <button
                      onClick={() => handleSendMessage(`📷 [Prescription/Image Attachment]: Sent photo for verification.`)}
                      className="flex items-center gap-2 p-2.5 rounded-[5px] hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <ImageIcon className="w-4 h-4 text-purple-600" />
                      <span>Photos &amp; OCR</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage(`📄 [PDF Document]: Digital Rate Card & Invoice attached.`)}
                      className="flex items-center gap-2 p-2.5 rounded-[5px] hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>PDF Document</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage(`🛍️ [Catalog Item]: ${account.catalog[0]?.name || "Featured Product"} (${account.currency}${account.catalog[0]?.price || 0})`)}
                      className="flex items-center gap-2 p-2.5 rounded-[5px] hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span>Product Card</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage(`🎙️ [Voice Note: 0:05s]: Audio message from ${account.businessName}`)}
                      className="flex items-center gap-2 p-2.5 rounded-[5px] hover:bg-slate-100 text-slate-700 transition-colors"
                    >
                      <Mic className="w-4 h-4 text-rose-600" />
                      <span>Voice Note</span>
                    </button>
                  </div>
                )}

                {/* Professional Emoji Picker Modal */}
                {emojiModalOpen && (
                  <div className="absolute bottom-16 left-3 sm:left-12 bg-white border border-slate-200/90 rounded-[5px] shadow-2xl z-40  max-w-[100vw] overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                    {/* Emoji Modal Header */}
                    <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smile className="w-4 h-4 text-teal-600" />
                        <span className="text-xs font-bold text-slate-800">Select Emoji</span>
                      </div>
                      <button
                        onClick={() => setEmojiModalOpen(false)}
                        className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-[5px] transition-colors cursor-pointer"
                        title="Close Emoji Picker"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Emoji Category Tabs */}
                    <div className="p-2 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto text-[11px]">
                      {[
                        { id: "all", label: "🔥 All" },
                        { id: "smileys", label: "😀 Smileys" },
                        { id: "business", label: "💼 Business" },
                        { id: "health", label: "💊 Health" },
                        { id: "symbols", label: "✨ Symbols" }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedEmojiCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-[5px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                            selectedEmojiCategory === cat.id
                              ? "bg-teal-600 text-white shadow-2xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>

                    {/* Emoji Grid */}
                    <div className="p-2.5 max-h-56 overflow-y-auto grid grid-cols-8 gap-1.5 bg-slate-50/40">
                      {[
                        ...(selectedEmojiCategory === "all" || selectedEmojiCategory === "smileys"
                          ? ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😍", "🥰", "😘", "😋", "😜", "😎", "🤩", "🥳", "😏", "🤔", "🤫", "😴", "😷", "🤒", "🤑", "🙌", "👏", "👍", "👎", "🤝", "🙏", "✌️", "👌", "💪", "❤️", "🔥", "✨", "🎉"]
                          : []),
                        ...(selectedEmojiCategory === "all" || selectedEmojiCategory === "business"
                          ? ["💼", "🛒", "💰", "💵", "💳", "🧾", "📦", "🛍️", "🏷️", "📊", "📈", "🏢", "🚚", "🚀", "⚡", "🎁", "🔔", "📢", "💬", "📱", "📞", "✉️", "📧", "📝", "📋", "📅", "🕒", "⏳", "🔒", "🔑", "🛡️", "✅", "⭐", "🌟", "🏆", "🎯"]
                          : []),
                        ...(selectedEmojiCategory === "all" || selectedEmojiCategory === "health"
                          ? ["💊", "🩺", "🏥", "💉", "🩹", "🧬", "🌡️", "🍏", "🍎", "🥗", "🥑", "🥦", "💧", "🏋️", "🧘", "🏃", "🌿", "🌱", "🍵", "🧴", "🧼", "🦷", "🫀", "🫁", "🧠", "☀️", "🌈", "🪴", "🍇", "🍊", "🍋", "🍌", "🥕", "🥜"]
                          : []),
                        ...(selectedEmojiCategory === "all" || selectedEmojiCategory === "symbols"
                          ? ["💡", "📌", "📍", "🎯", "💯", "🔥", "✨", "💥", "⚡", "⭐", "🌟", "☀️", "🌙", "☁️", "☔", "❄️", "☕", "🍕", "🍔", "🚗", "✈️", "🛵", "🚲", "🏠", "🛎️", "⚠️", "⛔", "🚫", "❓", "❗", "✔️", "❌", "➕", "➖", "💲", "🔤", "🔢", "🌐", "🔗"]
                          : [])
                      ].map((emoji, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setInputPrompt((prev) => prev + emoji);
                          }}
                          className="h-8 flex items-center justify-center text-lg hover:bg-white hover:shadow-xs hover:scale-125 rounded-[5px] transition-all cursor-pointer select-none"
                          title="Click to insert emoji"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Emoji Modal Footer Tip */}
                    <div className="p-2 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-500 font-medium">
                      Click any emoji to insert directly into message
                    </div>
                  </div>
                )}

                {/* WhatsApp Bottom Input Bar */}
                <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setAttachmentMenuOpen(!attachmentMenuOpen);
                      setEmojiModalOpen(false);
                    }}
                    className={`p-2 rounded-[5px] transition-colors cursor-pointer ${
                      attachmentMenuOpen ? "bg-teal-600 text-white" : "hover:bg-slate-200 text-slate-600"
                    }`}
                    title="Attach"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmojiModalOpen(!emojiModalOpen);
                      setAttachmentMenuOpen(false);
                    }}
                    className={`p-2 rounded-[5px] transition-colors cursor-pointer ${
                      emojiModalOpen ? "bg-teal-600 text-white" : "hover:bg-slate-200 text-slate-600"
                    }`}
                    title="Emojis"
                  >
                    <Smile className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={`Reply as ${account.businessName} to ${activeContact.name} on WhatsApp...`}
                    disabled={isTyping}
                    className="flex-1 bg-white text-slate-900 placeholder-slate-400 rounded-[5px] px-4 py-2 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />

                  {/* Voice Note Simulation Mic Button */}
                  <button
                    onClick={handleToggleVoiceRecording}
                    className={`p-2 rounded-[5px] transition-all cursor-pointer ${
                      isRecording
                        ? "bg-rose-500 text-white animate-pulse"
                        : "hover:bg-slate-200 text-slate-600"
                    }`}
                    title={isRecording ? "Click to Send Voice Note" : "Send Voice Note as Store Agent"}
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Send Button */}
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputPrompt.trim() || isTyping}
                    title={`Send directly to ${activeContact.name}'s WhatsApp`}
                    className={`p-2.5 rounded-[5px] text-white transition-all cursor-pointer ${
                      inputPrompt.trim() && !isTyping
                        ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 hover:opacity-95 shadow-sm shadow-teal-500/20"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
                <div className="w-16 h-16 rounded-[5px] bg-teal-50 text-teal-600 flex items-center justify-center mb-4 border border-teal-200">
                  <MessageSquare className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-base font-black text-slate-900 mb-1">No Active Chat Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">
                  {sessions.filter((s) => s.status === "CONNECTED").length === 0
                    ? "No WhatsApp session is currently connected. Connect a session in the Sessions tab to begin receiving live chats."
                    : "When a customer messages your linked WhatsApp number, conversations and AI RAG responses will stream here live."}
                </p>
                {sessions.filter((s) => s.status === "CONNECTED").length === 0 ? (
                  <button
                    onClick={() => handleSelectTab("session")}
                    className="px-4 py-2 rounded-[5px] bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 hover:opacity-95 text-white text-xs font-extrabold shadow-md shadow-teal-500/20 cursor-pointer"
                  >
                    Connect WhatsApp Session
                  </button>
                ) : (
                  <button
                    onClick={() => setShowAddChatModal(true)}
                    className="px-4 py-2 rounded-[5px] bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 hover:opacity-95 text-white text-xs font-extrabold shadow-md shadow-teal-500/20 cursor-pointer"
                  >
                    Start New Chat
                  </button>
                )}
              </div>
            )}

              {/* MODAL 1: Delete All Chats Confirmation Modal */}
              {showDeleteAllModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
                  <div className="bg-white rounded-[5px] border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
                    <div className="w-12 h-12 rounded-[5px] bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                      <Trash2 className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-900">Delete All Messages?</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Are you sure you want to delete all messages across all conversations? This action cannot be undone.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setShowDeleteAllModal(false)}
                        className="flex-1 py-2.5 px-4 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleDeleteAllChats}
                        className="flex-1 py-2.5 px-4 rounded-[5px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-600/20 transition-colors cursor-pointer"
                      >
                        Yes, Delete All
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 1B: Delete Single Contact Chat Confirmation Modal */}
              {contactToDelete && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
                  <div className="bg-white rounded-[5px] border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
                    <div className="w-12 h-12 rounded-[5px] bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                      <Trash2 className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-900">Delete This Chat?</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Are you sure you want to delete the entire conversation with <strong className="text-slate-800">{contactToDelete.name}</strong>? All {contactToDelete.messages.length} messages and attachments in this chat will be permanently removed.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setContactToDelete(null)}
                        disabled={isDeletingContact}
                        className="flex-1 py-2.5 px-4 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDeleteContact}
                        disabled={isDeletingContact}
                        className="flex-1 py-2.5 px-4 rounded-[5px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-600/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isDeletingContact ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Chat</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 1C: Delete Selected Inner Message(s) Confirmation Modal */}
              {showDeleteMessagesModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
                  <div className="bg-white rounded-[5px] border border-slate-200 max-w-sm w-full p-6 shadow-2xl space-y-4 text-center">
                    <div className="w-12 h-12 rounded-[5px] bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                      <Trash2 className="w-6 h-6" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-900">
                        {selectedMessageIds.length === 1 ? "Delete Message?" : `Delete ${selectedMessageIds.length} Messages?`}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {selectedMessageIds.length === 1
                          ? "Are you sure you want to delete this message? It will be permanently removed from this conversation history."
                          : `Are you sure you want to delete these ${selectedMessageIds.length} messages? They will be permanently removed from this conversation history.`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteMessagesModal(false)}
                        disabled={isDeletingMessages}
                        className="flex-1 py-2.5 px-4 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDeleteMessages}
                        disabled={isDeletingMessages}
                        className="flex-1 py-2.5 px-4 rounded-[5px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-md shadow-rose-600/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {isDeletingMessages ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 2: Change Session Modal */}
              {showChangeSessionModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
                  <div className="bg-white rounded-[5px] border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200 mb-1">
                          <Key className="w-3 h-3 text-teal-600" />
                          <span>Multi-Device Gateway</span>
                        </div>
                        <h3 className="text-base font-black text-slate-900">Change WhatsApp Session</h3>
                        <p className="text-xs text-slate-500">
                          Select an active WhatsApp session to route conversations.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowChangeSessionModal(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-[5px] hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {sessions
                        .filter((s) => s.status === "CONNECTED")
                        .map((sess) => {
                          const isSelected = selectedSessionToSwitch === sess.id;
                          const isCurrentActive = activeSessionId === sess.id;
                          return (
                            <div
                              key={sess.id}
                              onClick={() => setSelectedSessionToSwitch(sess.id)}
                              className={`p-3.5 rounded-[5px] border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                  ? "bg-teal-50/80 border-teal-500 shadow-xs ring-2 ring-teal-500/20"
                                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-[5px] flex items-center justify-center font-bold text-xs ${
                                  isSelected ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-700"
                                }`}>
                                  <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <h5 className="text-xs font-bold text-slate-900">{sess.name}</h5>
                                    {isCurrentActive && (
                                      <span className="px-1.5 py-0.2 rounded-[5px] text-[9px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300">
                                        CURRENT
                                      </span>
                                    )}
                                    {sess.isPrimary && !isCurrentActive && (
                                      <span className="px-1.5 py-0.2 rounded-[5px] text-[9px] font-bold bg-slate-200 text-slate-700">
                                        PRIMARY
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] font-mono text-slate-500">{sess.phoneNumber}</p>
                                </div>
                              </div>

                              <div className="text-right flex flex-col items-end gap-1">
                                <span className="px-2 py-0.5 rounded-[5px] text-[9px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-300">
                                  CONNECTED
                                </span>
                                <span className="text-[9px] text-slate-400 font-medium">⚡ {sess.batteryPercent}% ({sess.latencyMs}ms)</span>
                              </div>
                            </div>
                          );
                        })}

                      {sessions.filter((s) => s.status === "CONNECTED").length === 0 && (
                        <div className="text-center py-6 space-y-2">
                          <p className="text-xs font-bold text-slate-700">No Connected Sessions</p>
                          <p className="text-[11px] text-slate-500">
                            Disconnected sessions cannot route active chat. Reconnect your session in the Sessions tab to view its messages.
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setShowChangeSessionModal(false)}
                        className="flex-1 py-2.5 px-4 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSwitchSession(selectedSessionToSwitch)}
                        className="flex-1 py-2.5 px-4 rounded-[5px] bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 hover:opacity-95 text-white text-xs font-extrabold shadow-md shadow-teal-500/20 transition-colors cursor-pointer"
                      >
                        Confirm Switch
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 3: Add New Chat Modal */}
              {showAddChatModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
                  <div className="bg-white rounded-[5px] border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-teal-50 text-teal-700 text-[10px] font-bold border border-teal-200 mb-1">
                          <UserPlus className="w-3 h-3 text-teal-600" />
                          <span>New Contact</span>
                        </div>
                        <h3 className="text-base font-black text-slate-900">Start New WhatsApp Chat</h3>
                        <p className="text-xs text-slate-500">
                          Enter recipient name and phone number to start messaging.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAddChatModal(false)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-[5px] hover:bg-slate-100 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3 text-xs font-semibold">
                      <div>
                        <label className="block mb-1 text-slate-700">Contact / Customer Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Sneha Mukherjee"
                          value={newContactName}
                          onChange={(e) => setNewContactName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-[5px] px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-slate-700">WhatsApp Phone Number</label>
                        <input
                          type="text"
                          placeholder="e.g. +91 98300 12345"
                          value={newContactPhone}
                          onChange={(e) => setNewContactPhone(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-[5px] px-3.5 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-slate-700">Inquiry Tag / Category</label>
                        <select
                          value={newContactTag}
                          onChange={(e) => setNewContactTag(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-[5px] px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 focus:bg-white"
                        >
                          <option value="Active Inquiry">Active Inquiry</option>
                          <option value="Lead">New Lead</option>
                          <option value="Priority">Priority Customer</option>
                          <option value="Order Pending">Order Pending</option>
                          <option value="Delivery">Doorstep Delivery</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => setShowAddChatModal(false)}
                        className="flex-1 py-2.5 px-4 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddNewContact}
                        disabled={!newContactName.trim() || !newContactPhone.trim()}
                        className={`flex-1 py-2.5 px-4 rounded-[5px] text-xs font-extrabold shadow-md transition-colors cursor-pointer ${
                          newContactName.trim() && newContactPhone.trim()
                            ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 hover:opacity-95 text-white shadow-teal-500/20"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        Start Chat
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SESSIONS & WEBQR (Multi-Device WhatsApp Session Management & WebQR Pairing) */}
          {activeTab === "session" && (
            <div className="max-w-12xl mx-auto space-y-6">
              {/* Sessions & WebQR Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[5px] border border-slate-200/90 shadow-sm">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[5px] bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200 mb-2">
                    <Key className="w-3.5 h-3.5 text-teal-600" />
                    <span>Multi-Device WhatsApp Gateway &amp; WebQR</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Active WhatsApp Sessions &amp; WebQR</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage multi-device connections, monitor live telemetry, and pair new store instances via WhatsApp WebQR.
                  </p>
                </div>

                <button
                  onClick={handleOpenConnectModal}
                  className="px-5 py-2.5 rounded-[5px] bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 hover:opacity-95 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-teal-500/20 transition-all flex-shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Connect New Session</span>
                </button>
              </div>

              {/* Live Telemetry Quick Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-[5px] bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Connected</span>
                    <span className="text-lg font-black text-slate-900">
                      {sessions.filter((s) => s.status === "CONNECTED").length}{" "}
                      <span className="text-xs font-semibold text-slate-400">/ {sessions.length} Instances</span>
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-[5px] bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-[5px] bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gateway Engine</span>
                    <span className="text-xs font-black text-slate-900 block truncate">Multi-Device WebSocket</span>
                    <span className="text-[10px] text-teal-600 font-semibold">SSE Live Streaming Active</span>
                  </div>
                  <div className="w-9 h-9 rounded-[5px] bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200">
                    <Zap className="w-5 h-5" />
                  </div>
                </div>

                <div className="p-4 rounded-[5px] bg-white border border-slate-200/90 shadow-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Anti-Ban Protection</span>
                    <span className="text-xs font-black text-teal-700 block">Safe Human Pacing Active</span>
                    <span className="text-[10px] text-slate-500 font-mono">{account.antiBanDelay.min}s–{account.antiBanDelay.max}s Random Delay</span>
                  </div>
                  <div className="w-9 h-9 rounded-[5px] bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Active Connected Sessions Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Connected Instances ({sessions.length})
                  </h4>
                  <span className="text-xs text-teal-600 font-bold bg-teal-50 px-2.5 py-0.5 rounded-[5px] border border-teal-200">
                    Auto-Failover Active
                  </span>
                </div>

                {sessions.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {sessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="p-6 rounded-[5px] bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all space-y-4"
                      >
                        {/* Session Top Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-slate-900 text-sm">{sess.name}</h5>
                              {sess.isPrimary && (
                                <span className="px-2 py-0.5 rounded-[5px] bg-teal-100 text-teal-800 text-[10px] font-extrabold border border-teal-300">
                                  PRIMARY
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                              ID: <span className="text-teal-700 font-bold">{sess.id}</span>
                            </p>
                          </div>

                          <span className={`px-2.5 py-1 rounded-[5px] text-[10px] font-extrabold border flex items-center gap-1.5 ${
                            sess.status === "CONNECTED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                              : "bg-amber-50 text-amber-700 border-amber-300"
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${sess.status === "CONNECTED" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                            <span>{sess.status}</span>
                          </span>
                        </div>

                        {/* Required Key Session Attributes */}
                        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-[5px] border border-slate-100">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Phone Number:</span>
                            <span className="font-mono font-bold text-slate-900">{sess.phoneNumber}</span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Auto-Reconnect:</span>
                            <span className="text-emerald-700 font-semibold text-[11px]">{sess.autoReconnect}</span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Last Connected:</span>
                            <span className="font-mono text-slate-700">{sess.lastConnected}</span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Platform &amp; Health:</span>
                            <span className="text-teal-700 font-semibold text-[11px]">Battery: {sess.batteryPercent}% ⚡ ({sess.latencyMs}ms)</span>
                          </div>
                        </div>

                        {/* Session Action Buttons */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => setViewingSessionQr(sess)}
                            className="flex-1 py-2 px-3 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5 text-teal-600" />
                            <span>View Status / QR</span>
                          </button>

                          <button
                            onClick={() => handleRequestDeleteSession(sess)}
                            className="py-2 px-3.5 rounded-[5px] bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            title="Delete / Disconnect Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {sessions.length === 0 && (
                  <div className="p-12 text-center bg-white rounded-[5px] border border-slate-200/90 space-y-4">
                    <div className="w-14 h-14 rounded-[5px] bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
                      <QrCode className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-black text-slate-900">No WhatsApp Sessions Connected</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Connect a new session to pair your WhatsApp phone. You can scan the QR code from WhatsApp on your device.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenConnectModal}
                      className="px-5 py-2.5 rounded-[5px] bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 hover:opacity-95 text-white text-xs font-extrabold shadow-sm shadow-teal-500/20 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Add New WhatsApp Session</span>
                    </button>
                  </div>
                )}
              </div>

              {/* View Status / QR Pairing Modal (Strictly auto-detecting, zero fake buttons) */}
              {viewingSessionQr && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
                  <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 text-center relative">
                    <button
                      onClick={() => setViewingSessionQr(null)}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase">
                        {viewingSessionQr.id}
                      </span>
                      <h3 className="text-lg font-black text-slate-900">{viewingSessionQr.name}</h3>
                      <p className="text-xs text-slate-500">
                        {viewingSessionQr.status === "CONNECTED"
                          ? "This WhatsApp instance is online and actively handling messages."
                          : "Scan with WhatsApp on phone to link or refresh session status."}
                      </p>
                    </div>

                    {/* QR Code Graphic Frame (if not connected or refreshing) */}
                    {viewingSessionQr.status !== "CONNECTED" ? (
                      <div className="relative inline-block p-5 rounded-2xl bg-white shadow-lg border-2 border-teal-500/30 mx-auto">
                        <div className="w-52 h-52 bg-white rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden border border-slate-100 shadow-inner">
                          <img
                            src={modalQrDataUrl || generateQrSvgDataUrl(`2@${viewingSessionQr.id},${Date.now()},msgapi_pair`)}
                            alt="WhatsApp Session QR Code"
                            className="w-full h-full object-contain rounded-lg"
                          />
                          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-blue-600 flex items-center justify-center text-white shadow-md border-2 border-white">
                              <QrCode className="w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4 space-y-3">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-md">
                          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>WhatsApp Device is actively linked and listening</span>
                        </div>
                      </div>
                    )}

                    {/* Real-Time Session Diagnostics */}
                    <div className="grid grid-cols-2 gap-2 text-left text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone Number:</span>
                        <span className="font-mono font-bold text-slate-900">{viewingSessionQr.phoneNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Status:</span>
                        <span className={`font-bold ${viewingSessionQr.status === "CONNECTED" ? "text-emerald-700" : "text-amber-600"}`}>
                          {viewingSessionQr.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Auto-Reconnect:</span>
                        <span className="text-slate-700 text-[11px]">{viewingSessionQr.autoReconnect}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Connected:</span>
                        <span className="font-mono text-slate-700">{viewingSessionQr.lastConnected}</span>
                      </div>
                    </div>

                    {/* Live scanning indicator when not connected */}
                    {viewingSessionQr.status !== "CONNECTED" && (
                      <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold flex items-center justify-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                        <span>Waiting for phone scan... Auto-detecting real device connection</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      {viewingSessionQr.status !== "CONNECTED" && (
                        <button
                          onClick={async () => {
                            try {
                              const res = await MessageApiClient.refreshQr(viewingSessionQr.id, account.apiKey);
                              if (res?.qrCode) setModalQrDataUrl(res.qrCode);
                            } catch (e) {}
                          }}
                          className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Refresh QR</span>
                        </button>
                      )}
                      <button
                        onClick={() => setViewingSessionQr(null)}
                        className={`${viewingSessionQr.status === "CONNECTED" ? "w-full" : "flex-1"} py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer`}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CONNECT NEW SESSION & WEBQR MODAL (2-step: 1. Name input, 2. Live QR pairing with real-time auto-close) */}
              {showConnectNewSessionModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
                  <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-5 text-center relative">
                    {/* Close button */}
                    <button
                      onClick={() => {
                        if (!isCreatingNewSession) {
                          setShowConnectNewSessionModal(false);
                          setNewSessionStep("name");
                          setCreatedSessionData(null);
                        }
                      }}
                      disabled={isCreatingNewSession}
                      className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* STEP 1: Enter Session Name (NO QR VISIBLE) */}
                    {newSessionStep === "name" && (
                      <div className="space-y-5 text-left">
                        <div className="text-center space-y-1">
                          <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200 mb-2">
                            <Key className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-black text-slate-900">Connect New WhatsApp Session</h3>
                          <p className="text-xs text-slate-500">
                            Enter a label for this instance. A pairing QR code will be generated on the next step.
                          </p>
                        </div>

                        <form onSubmit={handleCreateSessionSubmit} className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-slate-700">
                              Session Name / Device Identifier <span className="text-rose-500">*</span>
                            </label>
                            <input
                              type="text"
                              autoFocus
                              value={newSessionNameInput}
                              onChange={(e) => setNewSessionNameInput(e.target.value)}
                              placeholder="e.g. Primary Store, Customer Support, Front Desk..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-2xs font-medium"
                            />
                          </div>

                          {/* Quick preset suggestions */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Quick Preset Labels:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {["Primary Line", "Customer Support", "Front Desk", "Orders Desk"].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => setNewSessionNameInput(preset)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 border border-slate-200 text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Primary Checkbox */}
                          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newSessionIsPrimary}
                              onChange={(e) => setNewSessionIsPrimary(e.target.checked)}
                              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300"
                            />
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-800 block">Set as Primary WhatsApp Device</span>
                              <span className="text-[10px] text-slate-500 block">Primary session is preferred for outgoing automated AI replies</span>
                            </div>
                          </label>

                          {connectSessionError && (
                            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span>{connectSessionError}</span>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setShowConnectNewSessionModal(false)}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={!newSessionNameInput.trim() || isCreatingNewSession}
                              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                                newSessionNameInput.trim() && !isCreatingNewSession
                                  ? "bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 text-white shadow-md shadow-teal-500/20 hover:opacity-95"
                                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
                              }`}
                            >
                              {isCreatingNewSession ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  <span>Initializing...</span>
                                </>
                              ) : (
                                <>
                                  <span>Generate Pairing QR</span>
                                  <span>→</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* STEP 2: Scannable WebQR & Real-Time Auto-Detection */}
                    {newSessionStep === "qr" && (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 uppercase">
                            {createdSessionData?.id || "INITIALIZING"}
                          </span>
                          <h3 className="text-lg font-black text-slate-900">{createdSessionData?.name || newSessionNameInput}</h3>
                          <p className="text-xs text-slate-500 max-w-xs mx-auto">
                            Open WhatsApp on your phone &gt; Settings &gt; Linked Devices &gt; Scan this QR code to connect.
                          </p>
                        </div>

                        {/* QR Code Container */}
                        <div className="relative inline-block p-4 rounded-2xl bg-white shadow-lg border-2 border-teal-500/30 mx-auto">
                          <div className="w-52 h-52 bg-white rounded-xl p-2 flex flex-col items-center justify-center relative overflow-hidden border border-slate-100 shadow-inner">
                            {newSessionQrDataUrl ? (
                              <img
                                src={newSessionQrDataUrl}
                                alt="WhatsApp Session Pairing QR Code"
                                className="w-full h-full object-contain rounded-lg"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                                <RefreshCw className="w-7 h-7 animate-spin text-teal-600" />
                                <span className="text-xs font-semibold">Generating QR Code...</span>
                              </div>
                            )}

                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-blue-600 flex items-center justify-center text-white shadow-md border-2 border-white">
                                <QrCode className="w-5 h-5" />
                              </div>
                            </div>
                          </div>

                          {isRefreshingNewSessionQr && (
                            <div className="absolute inset-0 bg-white/90 rounded-2xl flex items-center justify-center text-teal-600 text-xs font-bold">
                              <RefreshCw className="w-6 h-6 animate-spin text-teal-600" />
                            </div>
                          )}
                        </div>

                        {/* Live Scanning Status Radar */}
                        <div className="p-3 rounded-xl bg-teal-50/70 border border-teal-200 flex items-center justify-center gap-2 text-xs font-bold text-teal-800">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
                          </span>
                          <span>Waiting for WhatsApp scan... Auto-detecting real device</span>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!createdSessionData?.id) return;
                              setIsRefreshingNewSessionQr(true);
                              try {
                                const res = await MessageApiClient.refreshQr(createdSessionData.id, account.apiKey);
                                if (res?.qrCode) setNewSessionQrDataUrl(res.qrCode);
                              } catch (e) {}
                              setTimeout(() => setIsRefreshingNewSessionQr(false), 800);
                            }}
                            className="text-xs text-slate-600 hover:text-teal-700 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Refresh QR</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setShowConnectNewSessionModal(false);
                              setNewSessionStep("name");
                              setCreatedSessionData(null);
                            }}
                            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Successfully Connected State (Celebration & Auto-close) */}
                    {newSessionStep === "connected" && (
                      <div className="py-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-md">
                          <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                        </div>

                        <div className="space-y-1">
                          <h3 className="text-xl font-black text-slate-900">Device Connected Successfully!</h3>
                          <p className="text-xs text-slate-600">
                            Linked to <strong className="text-emerald-700 font-mono">{newSessionConnectedPhone || "+91 93824 68250"}</strong>
                          </p>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span>Session verified. Closing window automatically...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* MODAL: Delete / Disconnect Session Confirmation Modal */}
              {sessionToDelete && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
                  <div className="bg-white rounded-[5px] border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-[5px] bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 flex-shrink-0">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[5px] bg-rose-50 text-rose-700 text-[10px] font-extrabold border border-rose-200 mb-1">
                          <span>SESSION ACTION REQUIRED</span>
                        </div>
                        <h3 className="text-base font-black text-slate-900">
                          Delete Session: {sessionToDelete.name}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Session ID: <span className="font-bold text-slate-700">{sessionToDelete.id}</span>
                          {sessionToDelete.phoneNumber && ` • ${sessionToDelete.phoneNumber}`}
                        </p>
                      </div>
                      <button
                        onClick={() => !isDeletingSession && setSessionToDelete(null)}
                        disabled={isDeletingSession}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-sm cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Warning Notice Box */}
                    <div className="p-4 rounded-[5px] bg-rose-50/70 border border-rose-200 space-y-2">
                      <div className="flex items-center gap-2 text-rose-800 text-xs font-black">
                        <span>⚠️ Permanent Data Deletion Warning</span>
                      </div>
                      <p className="text-xs text-rose-700 leading-relaxed">
                        If you choose to <strong>Delete &amp; Wipe</strong>, this session and <strong>all chat conversations, contacts, and message history</strong> associated with this WhatsApp account will be permanently deleted from the database. This action cannot be reversed.
                      </p>
                    </div>

                    {/* Alternative Info Box: Disconnect Only */}
                    <div className="p-4 rounded-[5px] bg-teal-50/60 border border-teal-200 space-y-1.5">
                      <div className="flex items-center gap-2 text-teal-900 text-xs font-bold">
                        <span>💡 Want to keep your chat history?</span>
                      </div>
                      <p className="text-xs text-teal-800 leading-relaxed">
                        Choose <strong>Disconnect Only</strong> instead. This stops the active connection and removes it from live chat routing, but keeps all previous messages and contacts safely saved. When you reconnect this session later, all old messages will be restored.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSessionToDelete(null)}
                        disabled={isDeletingSession}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => handleDisconnectOnly(sessionToDelete.id)}
                          disabled={isDeletingSession}
                          className="flex-1 py-2.5 px-3 rounded-[5px] bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          title="Disconnect session without deleting messages"
                        >
                          {isDeletingSession ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Pause className="w-3.5 h-3.5 text-amber-700" />
                          )}
                          <span>Disconnect Only (Keep History)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleConfirmDeleteSession(sessionToDelete.id)}
                          disabled={isDeletingSession}
                          className="flex-1 py-2.5 px-3 rounded-[5px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                          title="Permanently wipe session and all messages"
                        >
                          {isDeletingSession ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5 text-white" />
                          )}
                          <span>Delete &amp; Wipe Everything</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: RAG KNOWLEDGE BASE & VECTOR ENGINE */}
          {activeTab === "rag" && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header Card matching mockup */}
              <div className="bg-white p-6 rounded-[5px] border border-slate-200/90 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[5px] bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>✨ LangChain &amp; Groq (&apos;openai/gpt-oss-120b&apos;) + Gemini Embeddings</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    RAG Knowledge Base &amp; Vector Engine
                  </h3>
                  <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                    Upload PDF, Word (.docx), Markdown (.md), JSON (.json), or Text (.txt) documents. LangChain indexes content into PostgreSQL pgvector, and synthesizes answers via Groq openai/gpt-oss-120b.
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-[5px] border border-slate-200/80 flex-shrink-0">
                  <div className="px-4 py-2 bg-white rounded-[5px] border border-slate-200 text-center min-w-[75px] shadow-2xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">DOCS</span>
                    <span className="text-xl font-black text-slate-900">{ragStats.totalDocs}</span>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-[5px] border border-slate-200 text-center min-w-[85px] shadow-2xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">CHUNKS</span>
                    <span className="text-xl font-black text-teal-600">{ragStats.totalChunks}</span>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-[5px] border border-slate-200 text-center min-w-[95px] shadow-2xs">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">768 DIMS</span>
                    <span className="text-xs font-black text-slate-700 mt-1 block">Gemini Embed</span>
                  </div>
                </div>
              </div>

              {/* Main 2-Column Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Upload Document */}
                <div className="lg:col-span-5 bg-white p-6 rounded-[5px] border border-slate-200/90 shadow-sm space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-[5px] bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200 font-bold">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Upload Document</h4>
                      <p className="text-xs text-slate-500">Select a PDF, DOCX, MD, JSON, or TXT file to index into vector memory.</p>
                    </div>
                  </div>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={ragFileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.docx,.txt,.md,.json"
                    className="hidden"
                  />

                  {/* Drag and drop / click upload area */}
                  <div
                    onClick={() => ragFileInputRef.current?.click()}
                    className="border-2 border-dashed border-teal-300 hover:border-teal-500 bg-teal-50/40 hover:bg-teal-50/70 rounded-xl p-8 text-center cursor-pointer transition-all space-y-3 group"
                  >
                    <div className="w-12 h-12 rounded-[5px] bg-teal-100 text-teal-700 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Click or Drag File Here</p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Supports .docx (via Mammoth), .pdf, .txt, .md, .json (up to 25MB)
                      </p>
                    </div>
                  </div>

                  {isUploadingRag && (
                    <div className="p-3 bg-teal-50 rounded-[5px] border border-teal-200 text-teal-800 text-xs font-semibold flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                      <span>Parsing document with Mammoth &amp; generating 768-dim pgvector embeddings...</span>
                    </div>
                  )}

                  {uploadSuccess && (
                    <div className="p-3 bg-emerald-50 rounded-[5px] border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{uploadSuccess}</span>
                    </div>
                  )}

                  {uploadError && (
                    <div className="p-3 bg-rose-50 rounded-[5px] border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Architectural Blueprint Info */}
                  <div className="p-4 bg-slate-50 rounded-[5px] border border-slate-200/80 space-y-2 text-xs text-slate-600">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Vector Pipeline Architecture</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-500">
                      <li>• <strong className="text-slate-700">Mammoth DOCX Parser:</strong> Flawlessly extracts clean text, tables, and lists from Word &amp; Google Docs.</li>
                      <li>• <strong className="text-slate-700">768-dim Vector Embeddings:</strong> Gemini gemini-embedding-001 vector representation.</li>
                      <li>• <strong className="text-slate-700">PostgreSQL pgvector:</strong> Vector cosine similarity index stored in catalog_embeddings.</li>
                      <li>• <strong className="text-slate-700">Groq LLM Synthesis:</strong> Ultra-fast answer generation via openai/gpt-oss-120b.</li>
                    </ul>
                  </div>
                </div>

                {/* Right Column: Indexed Documents & RAG Simulator */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Top: Indexed Documents */}
                  <div className="bg-white p-6 rounded-[5px] border border-slate-200/90 shadow-sm space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-[5px] bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200 font-bold">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">Indexed Documents</h4>
                          <p className="text-[11px] text-slate-500">Knowledge assets stored in pgvector database</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleReindexRag}
                          disabled={isReindexingRag}
                          className="px-3 py-1.5 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                          title="Regenerate Vector Embeddings"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 text-teal-600 ${isReindexingRag ? 'animate-spin' : ''}`} />
                          <span>{isReindexingRag ? "Reindexing..." : "Regenerate Embeddings"}</span>
                        </button>

                        <button
                          onClick={fetchRagDocs}
                          className="p-1.5 rounded-[5px] bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors cursor-pointer"
                          title="Reload list"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {ragDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-3.5 rounded-[5px] border border-slate-200/90 hover:border-teal-300 bg-white hover:bg-teal-50/20 transition-all flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-[5px] bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-teal-200">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs font-black text-slate-900 truncate">{doc.name}</h5>
                                <span className="px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 text-[9px] font-bold uppercase border border-teal-200 shrink-0">
                                  {doc.category || account.category}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-0.5 flex-wrap">
                                <span className="font-bold text-teal-700 uppercase">{doc.type}</span>
                                <span>•</span>
                                <span className="font-semibold text-slate-600">{doc.chunks} Chunks</span>
                                <span>•</span>
                                <span>{doc.size}</span>
                                {doc.uploadedAt && (
                                  <>
                                    <span>•</span>
                                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  {doc.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteRagDoc(doc.id)}
                            className="p-2 rounded-[5px] text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer flex-shrink-0"
                            title="Delete document and remove vector chunks"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {ragDocs.length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-6">No documents indexed yet. Upload a file above.</p>
                      )}
                    </div>
                  </div>

                  {/* Bottom: RAG Search & Retrieval Simulator */}
                  <div className="bg-white p-6 rounded-[5px] border border-slate-200/90 shadow-sm space-y-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-[5px] bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200 font-bold">
                          <Zap className="w-4 h-4 text-amber-500" />
                        </div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                          RAG Search &amp; Retrieval Simulator
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500">
                        Test vector cosine similarity retrieval and final answer synthesis powered by Groq (&apos;openai/gpt-oss-120b&apos;).
                      </p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={ragQueryInput}
                          onChange={(e) => setRagQueryInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleRunRagQuery()}
                          placeholder='Search knowledge base... e.g. "dosage for paracetamol" or "return policy"'
                          className="w-full px-4 py-2.5 rounded-[5px] bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                        />
                      </div>
                      <button
                        onClick={() => handleRunRagQuery()}
                        disabled={isQueryingRag || !ragQueryInput.trim()}
                        className="px-5 py-2.5 rounded-[5px] bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-600 hover:opacity-95 text-white text-xs font-extrabold flex items-center gap-2 shadow-md shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isQueryingRag ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Searching...</span>
                          </>
                        ) : (
                          <>
                            <span>Run RAG</span>
                            <Send className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Query Result Section */}
                    {ragQueryResult && (
                      <div className="space-y-4 pt-2 border-t border-slate-100 animate-in fade-in">
                        {/* Groq LLM Synthesized Answer */}
                        <div className="p-4 bg-teal-50/60 rounded-[5px] border border-teal-200/90 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="text-xs font-extrabold text-teal-900 uppercase tracking-wide">
                                Groq LLM Synthesis
                              </span>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-[5px] bg-white text-teal-800 border border-teal-200 font-bold">
                              {ragQueryResult.model || "openai/gpt-oss-120b"}
                            </span>
                          </div>
                          <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                            <WhatsAppText text={ragQueryResult.answer} />
                          </div>
                        </div>

                        {/* Retrieved Chunks Display */}
                        {ragQueryResult.retrievedChunks && ragQueryResult.retrievedChunks.length > 0 && (
                          <div className="space-y-2.5">
                            <h5 className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                              Retrieved Vector Chunks ({ragQueryResult.retrievedChunks.length})
                            </h5>
                            <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
                              {ragQueryResult.retrievedChunks.map((chunk, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-slate-50 rounded-[5px] border border-slate-200 space-y-1.5"
                                >
                                  <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-teal-700 truncate max-w-[200px]">
                                      📄 {chunk.docName}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-[5px] bg-emerald-100 text-emerald-800 font-extrabold text-[10px] border border-emerald-200">
                                      {Math.round(chunk.similarity * 100)}% Match (Cosine {chunk.similarity.toFixed(3)})
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 line-clamp-3 leading-relaxed font-mono bg-white p-2 rounded border border-slate-100">
                                    {chunk.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: MCP and DOC Info */}
          {activeTab === "mcp" && (
            <McpDocInfoTab account={account} />
          )}
        </div>
      </main>
    </div>
  );
}
