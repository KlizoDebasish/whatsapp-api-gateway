import { BusinessAccount, BusinessCategory, BUSINESS_TEMPLATES } from "./types";

const STORAGE_KEY = "messageapi_business_accounts_v2";
const ACTIVE_ACCOUNT_KEY = "messageapi_active_account_id_v2";
const AUTH_TOKEN_KEY = "messageapi_auth_token_v2";
const AUTH_DOMAIN_KEY = "messageapi_auth_domain_v2";

export const INITIAL_DEMO_ACCOUNTS: BusinessAccount[] = [];

type Listener = () => void;
const listeners = new Set<Listener>();
let cachedActiveAccount: BusinessAccount | null = null;
let lastCacheKey = "";

function notifyListeners() {
  cachedActiveAccount = null;
  lastCacheKey = "";
  listeners.forEach((l) => l());
}

export function subscribeToAccountStore(listener: Listener): () => void {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

export function getActiveAccountSnapshot(): BusinessAccount | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY) || "";
  const activeId = localStorage.getItem(ACTIVE_ACCOUNT_KEY) || "";
  const key = `${activeId}::${raw}`;
  if (cachedActiveAccount && lastCacheKey === key) {
    return cachedActiveAccount;
  }
  lastCacheKey = key;
  const accounts = getStoredAccounts();
  if (accounts.length === 0) {
    cachedActiveAccount = null;
    return null;
  }
  cachedActiveAccount = (activeId ? accounts.find((a) => a.id === activeId) : null) || accounts[0] || null;
  return cachedActiveAccount;
}

export function getServerSnapshot(): BusinessAccount | null {
  return null;
}

export function getStoredAccounts(): BusinessAccount[] {
  if (typeof window === "undefined") return [];
  try {
    // Purge any legacy demo keys
    if (typeof window !== "undefined") {
      ["messageapi_business_accounts", "messageapi_active_account_id"].forEach((k) => {
        if (localStorage.getItem(k)) localStorage.removeItem(k);
      });
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Filter out hardcoded demo accounts so user only sees real user-registered accounts
    const filtered = parsed.filter(
      (a: BusinessAccount) =>
        a &&
        a.id !== "biz_apollo_pharma" &&
        a.id !== "biz_iron_gym" &&
        !a.id.startsWith("demo_")
    );
    if (filtered.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      if (filtered.length === 0) {
        localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_DOMAIN_KEY);
      }
    }
    return filtered;
  } catch {
    return [];
  }
}

export function saveAccounts(accounts: BusinessAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    notifyListeners();
  } catch (e) {
    console.error("Failed to save accounts to localStorage", e);
  }
}

export function loginAccount(account: BusinessAccount, token?: string, domain?: string): void {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(AUTH_TOKEN_KEY, token);
    if (domain || account.domain) localStorage.setItem(AUTH_DOMAIN_KEY, domain || account.domain || "");
    const accounts = getStoredAccounts();
    const existingIdx = accounts.findIndex((a) => a.id === account.id || (account.domain && a.domain === account.domain));
    if (existingIdx >= 0) {
      accounts[existingIdx] = { ...accounts[existingIdx], ...account };
    } else {
      accounts.unshift(account);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, account.id);
    notifyListeners();
  } catch (e) {
    console.error("Failed to login account in storage", e);
  }
}

export function logoutAccount(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_DOMAIN_KEY);
    localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("messageapi_current_view_v3");
    localStorage.removeItem("messageapi_active_tab_v3");
    cachedActiveAccount = null;
    notifyListeners();
  } catch (e) {
    console.error("Failed to logout account", e);
  }
}

const VIEW_STORAGE_KEY = "messageapi_current_view_v3";
const TAB_STORAGE_KEY = "messageapi_active_tab_v3";

export function getSavedView(): "landing" | "workspace" {
  if (typeof window === "undefined") return "landing";
  const saved = localStorage.getItem(VIEW_STORAGE_KEY);
  if (saved === "workspace" || saved === "landing") return saved;
  const activeId = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
  return activeId ? "workspace" : "landing";
}

export function saveCurrentView(view: "landing" | "workspace"): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch (e) {
    console.error("Failed to save current view", e);
  }
}

export function getSavedTab(accountDomainOrId?: string): string {
  if (typeof window === "undefined") return "dashboard";
  const key = accountDomainOrId ? `${TAB_STORAGE_KEY}_${accountDomainOrId}` : TAB_STORAGE_KEY;
  return localStorage.getItem(key) || localStorage.getItem(TAB_STORAGE_KEY) || "dashboard";
}

export function saveActiveTab(tab: string, accountDomainOrId?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TAB_STORAGE_KEY, tab);
    if (accountDomainOrId) {
      localStorage.setItem(`${TAB_STORAGE_KEY}_${accountDomainOrId}`, tab);
    }
  } catch (e) {
    console.error("Failed to save active tab", e);
  }
}

export function clearAllCredentials(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.clear();
    cachedActiveAccount = null;
    notifyListeners();
  } catch (e) {
    console.error("Failed to clear credentials", e);
  }
}

export function getAuthDomain(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_DOMAIN_KEY) || null;
}

export function getActiveAccountId(): string {
  if (typeof window === "undefined") return "";
  try {
    const active = localStorage.getItem(ACTIVE_ACCOUNT_KEY);
    if (active) return active;
    const accounts = getStoredAccounts();
    return accounts[0]?.id || "";
  } catch {
    return "";
  }
}

export function setActiveAccountId(id: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, id);
    notifyListeners();
  } catch (e) {
    console.error("Failed to set active account", e);
  }
}

export function createBusinessAccount(
  data: Partial<BusinessAccount> & { businessName: string; category: BusinessCategory }
): BusinessAccount {
  const template = BUSINESS_TEMPLATES[data.category] || BUSINESS_TEMPLATES.custom;
  const cleanId = `biz_${data.businessName.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Math.random().toString(36).substring(2, 6)}`;
  const apiKey = `msgapi_live_${data.category.substring(0, 3)}_${Math.random().toString(36).substring(2, 10)}`;

  const newAccount: BusinessAccount = {
    id: cleanId,
    businessName: data.businessName,
    category: data.category,
    categoryLabel: template.title,
    ownerName: data.ownerName || "Business Owner",
    phone: data.phone || "+91 99999 00000",
    email: data.email || "",
    address: data.address || "",
    currency: data.currency || "₹",
    workingHours: data.workingHours || "09:00 AM - 09:00 PM",
    greetingMessage: data.greetingMessage || template.defaultGreeting.replace("{BusinessName}", data.businessName),
    aiPersonaPrompt: data.aiPersonaPrompt || template.defaultPrompt.replace("{BusinessName}", data.businessName),
    antiBanDelay: data.antiBanDelay || { min: 8, max: 18, typingSimulation: true, typingSpeedWpm: 60 },
    enableAi: data.enableAi ?? true,
    enableStockQueries: data.enableStockQueries ?? true,
    allowedChats: data.allowedChats || "*",
    apiKey,
    webhookUrl: data.webhookUrl || "",
    status: "qr_ready",
    phoneNumber: data.phone || "",
    catalog: data.catalog && data.catalog.length > 0 ? data.catalog : [...template.sampleCatalog],
    createdAt: new Date().toISOString(),
    stats: {
      totalMessages: 0,
      inboundQueries: 0,
      ordersPlaced: 0,
      stockInquiries: 0
    }
  };

  const accounts = getStoredAccounts();
  const updated = [newAccount, ...accounts];
  saveAccounts(updated);
  setActiveAccountId(newAccount.id);
  return newAccount;
}

export function updateBusinessAccount(id: string, updates: Partial<BusinessAccount>): BusinessAccount | null {
  const accounts = getStoredAccounts();
  const idx = accounts.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  accounts[idx] = { ...accounts[idx], ...updates };
  saveAccounts(accounts);
  return accounts[idx];
}

export function deleteBusinessAccount(id: string): void {
  const accounts = getStoredAccounts();
  const filtered = accounts.filter((a) => a.id !== id);
  saveAccounts(filtered);
  if (getActiveAccountId() === id && filtered.length > 0) {
    setActiveAccountId(filtered[0].id);
  }
}

export interface SimulatedReplyResult {
  text: string;
  mediaUrl?: string;
  messageType?: "text" | "image" | "document";
}

const CATEGORY_VISUALS: Record<string, {
  label: string;
  keywords: string[];
  suggestions: string[];
  promptEnhancer: (subject: string, biz: string) => string;
}> = {
  gym: {
    label: "Fitness & Gym",
    keywords: [
      "gym", "fitness", "workout", "dumbbell", "barbell", "weights", "equipment", 
      "treadmill", "bench press", "squat", "crossfit", "muscle", "bodybuilder", 
      "bodybuilding", "trainer", "training", "supplement", "whey", "protein", 
      "creatine", "exercise", "cardio", "gym interior", "gym poster", "studio", 
      "bicep", "pullup", "gym floor", "locker room", "transformation", "kettlebell", 
      "leg press", "smith machine", "diet", "nutrition", "rower", "athlete"
    ],
    suggestions: [
      "Heavy dumbbell rack & Olympic barbell workout zone",
      "Modern crossfit studio floor with cardio machines",
      "Whey protein tub & fitness supplement display",
      "High-energy personal trainer workout poster"
    ],
    promptEnhancer: (s) =>
      `Cinematic commercial photography of ${s}, modern premium fitness gym background, dramatic studio rim lighting, 4k ultra detailed, hyperrealistic, athletic aesthetic, sharp focus, 1024x1024, advertising poster quality`
  },
  medicine: {
    label: "Pharmacy & Healthcare",
    keywords: [
      "medicine", "pharma", "pharmacy", "drug", "pill", "capsule", "tablet", "syrup", 
      "prescription", "doctor", "healthcare", "clinic", "first aid", "bandage", 
      "thermometer", "stethoscope", "vitamin", "ointment", "medical", "hospital", 
      "shelf", "counter", "dispensing", "mask", "syringes", "wellness", "supplement", 
      "inhaler", "glucometer", "bp monitor", "sanitizer", "lab"
    ],
    suggestions: [
      "Organized pharmacy medicine shelves & counter setup",
      "First aid kit & essential healthcare supplies display",
      "Daily multivitamin & health supplement bottles",
      "Clinical pharmacy storefront with licensed dispensing desk"
    ],
    promptEnhancer: (s) =>
      `Professional clean studio photo of ${s}, licensed pharmacy and healthcare clinic background, soft clinical lighting, 4k ultra detailed, hyperrealistic, sharp focus, 1024x1024, medical commercial standard`
  },
  grocery: {
    label: "Supermarket & Express Grocery",
    keywords: [
      "grocery", "supermarket", "fruit", "vegetable", "produce", "apple", "banana", 
      "milk", "dairy", "bread", "bakery", "cereal", "flour", "rice", "dal", "grain", 
      "snack", "basket", "cart", "store aisle", "fresh", "organic", "spices", "butter", 
      "cheese", "eggs", "oil", "pantry", "vegetables", "fruits", "mart", "farm"
    ],
    suggestions: [
      "Fresh organic fruits & vegetables in a wooden market crate",
      "Neatly organized modern supermarket grocery aisles",
      "Warm artisanal bakery bread & fresh dairy morning basket",
      "Assorted grains, spices & daily pantry staples showcase"
    ],
    promptEnhancer: (s) =>
      `Vibrant commercial food photography of fresh ${s}, supermarket grocery setting, bright natural morning lighting, 4k ultra detailed, hyperrealistic, fresh and appetizing, 1024x1024`
  },
  electronics: {
    label: "Consumer Electronics & Tech",
    keywords: [
      "electronics", "gadget", "phone", "smartphone", "laptop", "computer", "monitor", 
      "display", "headphone", "audio", "speaker", "charger", "cable", "gaming", 
      "console", "smartwatch", "tech", "device", "camera", "tablet", "keyboard", 
      "mouse", "gpu", "processor", "airpods", "earbuds", "tv"
    ],
    suggestions: [
      "Flagship smartphone with futuristic titanium camera array",
      "Pro gaming battle station desk with RGB mechanical keyboard",
      "Premium wireless noise-canceling headphones & audio station",
      "Ultra-slim workstation laptop with 4K bezel-less display"
    ],
    promptEnhancer: (s) =>
      `High-end product photography of ${s}, sleek tech showroom setting, neon cyber accent lighting, 4k ultra detailed, hyperrealistic, modern tech aesthetic, 1024x1024`
  },
  restaurant: {
    label: "Restaurant & Culinary Kitchen",
    keywords: [
      "restaurant", "food", "dish", "meal", "biryani", "starter", "curry", "pizza", 
      "burger", "chef", "kitchen", "dining", "menu", "beverage", "shake", "coffee", 
      "dessert", "plate", "table", "culinary", "appetizer", "pasta", "sandwich", 
      "drink", "cocktail", "mocktail", "paneer", "chicken", "salad", "roast", "bake"
    ],
    suggestions: [
      "Signature royal chef special biryani platter with rich spices",
      "Sizzling gourmet appetizer platter with artisan dips",
      "Craft barista espresso & decadent chocolate dessert plate",
      "Ambient fine-dining restaurant candlelit dinner table"
    ],
    promptEnhancer: (s) =>
      `Mouth-watering gourmet food photography of ${s}, restaurant dining presentation, warm atmospheric lighting, subtle rising steam, shallow depth of field, 4k ultra detailed, hyperrealistic, 1024x1024`
  },
  salon: {
    label: "Salon, Spa & Beauty Lounge",
    keywords: [
      "salon", "spa", "hair", "haircut", "styling", "facial", "massage", "beauty", 
      "skincare", "manicure", "pedicure", "grooming", "makeup", "lounge", "chair", 
      "mirror", "serum", "keratin", "glow", "barber", "shampoo", "cream", "lotion", 
      "eyebrows", "cosmetics", "facials"
    ],
    suggestions: [
      "Luxury modern salon hair styling station with vanity mirrors",
      "Tranquil wellness spa aromatherapy massage suite with lotus petals",
      "Professional hair makeover styling & grooming setup",
      "Organic botanical facial & skincare beauty treatment kit"
    ],
    promptEnhancer: (s) =>
      `Luxury beauty commercial photography of ${s}, modern elegant salon and spa background, warm glamorous lighting, 4k ultra detailed, hyperrealistic, sharp focus, 1024x1024`
  },
  custom: {
    label: "Enterprise Business & Commerce",
    keywords: [
      "business", "office", "workspace", "product", "service", "consultation", 
      "desk", "team", "meeting", "company", "store", "catalog", "corporate", 
      "commercial", "suite", "headquarters", "brand"
    ],
    suggestions: [
      "Executive corporate business consultation suite",
      "Premium branded product & showcase presentation",
      "Modern creative enterprise conference & innovation hub",
      "Professional client service welcome desk"
    ],
    promptEnhancer: (s) =>
      `Corporate commercial photography of ${s}, modern architectural business headquarters background, clean executive lighting, 4k ultra detailed, hyperrealistic, 1024x1024`
  }
};

/**
 * Intelligent local response generator simulating the WhatsApp Gateway ERP Assistant
 */
export function generateSimulatedReply(
  account: BusinessAccount,
  userMessage: string
): string {
  const q = userMessage.toLowerCase().trim();
  const curr = account.currency || "₹";

  const generateReply = (): string => {
    // 1. PDF / Document Generation Intent
    if (/\b(pdf|document|catalog pdf|catalogue pdf|price list pdf|rate card pdf|brochure)\b/i.test(q) &&
      /\b(generate|create|send|download|give|share|export|make|view|get)\b/i.test(q)) {
      const distinctCats = Array.from(new Set(account.catalog?.map((c) => c.category?.trim()).filter(Boolean) || []));
      const catList = distinctCats.length > 0 ? distinctCats.map((c) => `• *${c}*`).join("\n") : "• *Full Store Product Catalog*";
      return `📄 *Digital Catalog PDF for ${account.businessName}:*\n\nHere are the catalog categories available for document export:\n${catList}\n\nYou can also export or view the itemized PDF catalog from the store dashboard anytime! Would you like details on any specific category?`;
    }

    // 2. Image Generation Intent
    const imageKeywords = /\b(image|photo|picture|pic|poster|banner|wallpaper|graphic|visual|drawing|illustration|sketch)\b/i;
    const commandVerbs = /\b(generate|create|draw|make|render|design|show me|give me|produce|paint)\b/i;
    const isImageIntent = (commandVerbs.test(q) && imageKeywords.test(q)) ||
      /\b(generate|create|draw|make|show me an?|picture of|photo of|image of)\s+([a-z0-9\s]+)\s+(image|photo|picture|pic|poster|banner)/i.test(q) ||
      /\b(generate|create|draw|make)\s+(an?\s+)?(image|photo|picture|pic|poster|banner)/i.test(q) ||
      /^(please\s+)?(generate|create|draw|make)\s+(an?\s+)?image/i.test(q) ||
      /\b(image|photo|picture)\s*[:=]/i.test(q);

    if (isImageIntent) {
      const catKey = (account.category || "custom").toLowerCase();
      const profile = CATEGORY_VISUALS[catKey] || CATEGORY_VISUALS.custom;
      let subject = q
        .replace(/^(hey|hi|hello|heya|hlo|dear|ok|okay)[,\s]+/i, "")
        .replace(/^(can you|could you|would you|will you|i want you to|i would like you to|i need you to|help me|tell me to)[,\s]+/i, "")
        .replace(/^(please|kindly)[,\s]+/i, "")
        .replace(/^(generate|create|draw|make|render|design|show me|give me|produce|paint|get me)\s+(me\s+)?(an?\s+)?/i, "")
        .replace(/^(image|photo|picture|pic|poster|banner|visual|graphic|wallpaper|drawing)\s*(of|for|about|:)?\s*/i, "")
        .replace(/\s+(image|photo|picture|pic|poster|banner|wallpaper|graphic|drawing)$/i, "")
        .replace(/^(an?\s+)/i, "")
        .replace(/[:=?!.,]+$/g, "").trim();

      const lowerSub = subject.toLowerCase().trim();
      const isVague =
        !lowerSub ||
        lowerSub.length < 2 ||
        ["image", "photo", "picture", "pic", "poster", "banner", "something", "a picture", "an image", "visual", "graphic", "wallpaper", "drawing"].includes(lowerSub);

      if (isVague) {
        const suggestionsText = profile.suggestions.map((s) => `• ${s}`).join("\n");
        return `I'd love to generate an image for you! 🎨 Could you please clarify which specific ${profile.label} image you would like to create?\n\nHere are some popular options you can choose from:\n${suggestionsText}\n\nSimply reply with your idea or tell me which one you'd like to see!`;
      }

      const stopWords = new Set([
        "hey", "hello", "please", "can", "you", "want", "need", "give", "show", "make",
        "generate", "create", "image", "photo", "picture", "pic", "for", "the", "and",
        "with", "like", "good", "best", "some", "any", "pro", "max", "new", "one", "two",
        "all", "about", "draw", "have", "see", "this", "that", "our"
      ]);

      let matchesKeyword = false;
      for (const kw of profile.keywords) {
        const lowerKw = kw.toLowerCase();
        if (lowerSub === lowerKw || lowerSub.includes(lowerKw)) {
          matchesKeyword = true;
          break;
        }
      }

      if (!matchesKeyword) {
        const subjectWords = lowerSub.split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !stopWords.has(w));
        for (const word of subjectWords) {
          for (const kw of profile.keywords) {
            const lowerKw = kw.toLowerCase();
            if (lowerKw === word || lowerKw.split(/\s+/).includes(word)) {
              matchesKeyword = true;
              break;
            }
          }
          if (matchesKeyword) break;
        }
      }

      const matchesCatalog = (account.catalog || []).some((item) => {
        const n = item.name.toLowerCase();
        const c = (item.category || "").toLowerCase();
        return lowerSub.includes(n) || (n.length >= 4 && lowerSub.includes(n)) || (c && lowerSub.includes(c));
      });

      if (!matchesKeyword && !matchesCatalog) {
        const suggestionsText = profile.suggestions.map((s) => `• ${s}`).join("\n");
        const cleanSubName = subject
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");

        return `I specialize exclusively in ${profile.label} visuals for ${account.businessName}! 🎨 I'm unable to create images of '${cleanSubName}', as I only provide images related to our ${profile.label} services.\n\nHere are some relevant images I can generate for you right now:\n${suggestionsText}\n\nWould you like me to generate one of these for you instead?`;
      }

      const capitalizedSubject = subject.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
      const enhancedPrompt = profile.promptEnhancer(subject, account.businessName);
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&nologo=true&enhance=true`;

      return `Here is your image of *${capitalizedSubject}*! 🎨\n\n[IMAGE_URL:${pollinationsUrl}]\n\n*Created exclusively for ${account.businessName}.*\n\nI hope you like it! Can I ask how else I can help you today? 😊`;
    }

    // Check for greetings
    if (/\b(hi|hello|hey|namaste|hlo|heya|hola|good morning|good evening)\b/i.test(q)) {
      return (account.greetingMessage || "Hello! Welcome to {BusinessName}!").replace(/{BusinessName}/g, account.businessName);
    }

    // Check for working hours / timing
    if (/\b(time|timing|timings|open|close|hours|schedule|operating hours)\b/i.test(q)) {
      return `🕒 *Operating Hours for ${account.businessName}:*\nWe are open *${account.workingHours}*.\nFeel free to ask any other questions!`;
    }

    // Check for location / address
    if (/\b(address|location|where|map|shop location|store location)\b/i.test(q)) {
      return `📍 *Store Location:* ${account.businessName}\n${account.address || "Main Market Road"}\n📞 Front Desk: *${account.phone}*`;
    }

    const isStockQuery = /\b(stock|stocks|inventory|available|availability|units left|in stock|stock details|items available|how many|units left|qty|quantity|left in stock|how much stock|catalog|products|items|menu|list|options)\b/i.test(q);

    // Search in catalog
    const catalog = account.catalog || [];
    const distinctCategories = Array.from(
      new Set(catalog.map((i) => i.category?.trim()).filter(Boolean))
    );

    const matchedCategory = distinctCategories.find((cat) => {
      const c = cat.toLowerCase();
      return q === c || q.includes(c) || c.split(/\s+/).some((w) => w.length >= 4 && q.includes(w));
    });

    const matchedItem = catalog.find((item) =>
      q.includes(item.name.toLowerCase()) ||
      q.includes(item.sku.toLowerCase()) ||
      item.name.toLowerCase().split(" ").some((w) => w.length >= 4 && q.includes(w))
    );

    // Stock query flow
    if (isStockQuery || matchedCategory) {
      if (!matchedCategory && !matchedItem) {
        if (catalog.length === 0) {
          return `Currently, no stock is available now.. we will update soon! Please feel free to ask about our timings or contact our front desk at *${account.phone}*.`;
        }
        const catList = distinctCategories.map((c) => `• *${c}*`).join('\n');
        return `Hello! We have live inventory available across several categories at *${account.businessName}*:\n\n${catList}\n\nWhich category would you like to check stock details for? Simply reply with the category name!`;
      }

      if (matchedCategory) {
        const catItems = catalog.filter(
          (i) => i.category.toLowerCase() === matchedCategory.toLowerCase() ||
                 i.category.toLowerCase().includes(matchedCategory.toLowerCase()) ||
                 matchedCategory.toLowerCase().includes(i.category.toLowerCase())
        );
        const inStockItems = catItems.filter((i) => i.stock > 0);
        if (catItems.length === 0 || inStockItems.length === 0) {
          return `Currently, no stock is available in *${matchedCategory}*.. we will update soon! Please let us know if you would like to explore our other categories or check back shortly.`;
        }
        const top4to5 = inStockItems.slice(0, 5);
        const productListText = top4to5.map((item, idx) => {
          return `${idx + 1}. *${item.name}* (\`${item.sku}\`)\n   • Price: *${curr}${item.price.toFixed(2)}*${item.unit && item.unit !== 'pcs' ? ` / ${item.unit}` : ''}\n   • Stock: *${item.stock} ${item.unit} available* (✅ In Stock)${item.description ? `\n   • Info: ${item.description}` : ''}`;
        }).join('\n\n');

        return `📦 *Live Stock Details for ${matchedCategory} at ${account.businessName}:*\n\n${productListText}\n\nWould you like to place an order or check details for another category?`;
      }

      if (matchedItem) {
        if (matchedItem.stock > 0) {
          return `✅ *${matchedItem.name}* (\`${matchedItem.sku}\`) is in stock!\n• Category: *${matchedItem.category}*\n• Price: *${curr}${matchedItem.price.toFixed(2)}*${matchedItem.unit && itemUnit(matchedItem.unit)}\n• Available Stock: *${matchedItem.stock} ${matchedItem.unit}*\n${matchedItem.description ? `• Details: ${matchedItem.description}\n` : ''}Would you like to place an order? Please reply with your desired quantity to proceed!`;
        }
        return `⚠️ *${matchedItem.name}* (\`${matchedItem.sku}\`) is currently out of stock.. we will update soon! Would you like us to notify you when it arrives?`;
      }

      return `We could not find that item in our current inventory at *${account.businessName}*. No stock is available now.. we will update soon! Please feel free to check our other categories or reach our team at *${account.phone}*.`;
    }

    function itemUnit(unit?: string) {
      return unit && unit !== 'pcs' ? ` / ${unit}` : '';
    }

    // Non-stock query: product description without stock count
    if (matchedItem) {
      return `📦 *${matchedItem.name}*\n• Price: *${curr}${matchedItem.price.toFixed(2)}*${itemUnit(matchedItem.unit)}\n${matchedItem.description ? `• Details: ${matchedItem.description}\n` : ''}Would you like more details or help getting started?`;
    }

    // Check for human agent / call
    if (/\b(call|agent|human|talk|speak|owner)\b/i.test(q)) {
      return `📞 Connecting you with our team desk for *${account.businessName}*. You can reach us directly at *${account.phone}*.`;
    }

    // Check for order placement
    if (/\b(order|buy|book|need|want|purchase)\b/i.test(q)) {
      return `🛍️ *Request Received!*\nWe have noted your interest. Please provide your contact number and preferred details to proceed.`;
    }

    // Generic natural response matching AI persona (no unprompted stock mentions)
    const welcome = account.greetingMessage 
      ? account.greetingMessage.replace(/{BusinessName}/g, account.businessName)
      : `Thank you for contacting *${account.businessName}*! 👋`;
    return `${welcome}\n\nHow can I assist you with our services, pricing, or timings today?`;
  };

  return generateReply().replace(/\*\*(.*?)\*\*/g, "*$1*").trim();
}
