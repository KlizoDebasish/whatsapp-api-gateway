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

/**
 * Intelligent local response generator simulating the WhatsApp Gateway ERP Assistant
 */
export function generateSimulatedReply(
  account: BusinessAccount,
  userMessage: string
): string {
  const q = userMessage.toLowerCase().trim();
  const curr = account.currency || "₹";

  // Check for greetings
  if (/\b(hi|hello|hey|namaste|hlo|good morning|good evening)\b/i.test(q)) {
    return account.greetingMessage.replace("{BusinessName}", account.businessName);
  }

  // Check for working hours / timing
  if (/\b(time|timing|timings|open|close|hours|schedule)\b/i.test(q)) {
    return `🕒 *Operating Hours for ${account.businessName}:*\nWe are open *${account.workingHours}*.\nHow can we help you today?`;
  }

  // Check for location / address
  if (/\b(address|location|where|map|shop location)\b/i.test(q)) {
    return `📍 *Our Store Location:*\n${account.businessName}\n${account.address || "Main Market Road"}\n📞 Phone: ${account.phone}`;
  }

  // Search in catalog
  const catalog = account.catalog || [];
  const matchedItem = catalog.find((item) =>
    q.includes(item.name.toLowerCase()) ||
    q.includes(item.sku.toLowerCase()) ||
    (item.category && q.includes(item.category.toLowerCase())) ||
    item.name.toLowerCase().split(" ").some((w) => w.length >= 4 && q.includes(w))
  );

  if (matchedItem) {
    const stockStatus = matchedItem.stock > 0 ? `✅ In Stock (*${matchedItem.stock} ${matchedItem.unit}* available)` : `⚠️ Currently Out of Stock`;
    return `📦 *${matchedItem.name}* (\`${matchedItem.sku}\`)\n• Category: *${matchedItem.category}*\n• Price: *${curr}${matchedItem.price.toFixed(2)}*\n• Availability: ${stockStatus}\n• Details: ${matchedItem.description || "Fresh stock"}\n\nWould you like to place an order? Please reply with the quantity!`;
  }

  // Check for all products / catalog list
  if (/\b(menu|catalog|list|all products|price list|services|items)\b/i.test(q)) {
    const itemsList = catalog
      .slice(0, 5)
      .map((item, idx) => `${idx + 1}. *${item.name}* - ${curr}${item.price.toFixed(2)} (${item.stock > 0 ? "In Stock" : "Out of stock"})`)
      .join("\n");
    return `📋 *Featured Catalog at ${account.businessName}:*\n${itemsList}\n\nReply with any product name to get complete details or order!`;
  }

  // Check for human agent / call
  if (/\b(call|agent|human|talk|speak|owner)\b/i.test(q)) {
    return `📞 Connecting you with our store manager, *${account.ownerName}*. You can reach us directly at *${account.phone}*.`;
  }

  // Check for order placement
  if (/\b(order|buy|book|need|want|purchase)\b/i.test(q)) {
    return `🛍️ *Order Request Received!*\nWe have noted your interest. Please provide your *Delivery Address* or preferred pickup time to confirm your order.`;
  }

  // Generic natural response
  return `Thank you for contacting *${account.businessName}*! 👋\nWe have received your query: "${userMessage}". Our automated assistant or store team is available *${account.workingHours}* to assist you. Ask for any product or service!`;
}
