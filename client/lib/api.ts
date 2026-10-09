import { BusinessAccount, CatalogItem, ChatMessage } from './types';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const BACKEND_URL =
  API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export class MessageApiClient {
  private static getHeaders(apiKey?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }
    return headers;
  }

  /**
   * Check if backend server is online and operational
   */
  public static async checkHealth(): Promise<{ online: boolean; data?: any }> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        return { online: true, data };
      }
      return { online: false };
    } catch {
      return { online: false };
    }
  }

  /**
   * Fetch all business accounts from backend
   */
  public static async getAccounts(masterKey?: string): Promise<BusinessAccount[]> {
    const res = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'GET',
      headers: this.getHeaders(masterKey || 'msgapi_master_secret_key_889922')
    });
    const data = await res.json();
    return data.accounts || [];
  }

  /**
   * Create a new business account on the backend
   */
  public static async createAccount(accountData: Partial<BusinessAccount>): Promise<BusinessAccount> {
    const res = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(accountData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create account');
    return data.account;
  }

  /**
   * Update account settings
   */
  public static async updateAccount(id: string, updates: Partial<BusinessAccount>, apiKey: string): Promise<BusinessAccount> {
    const res = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update account');
    return data.account;
  }

  /**
   * WhatsApp Multi-Device Session Management
   */
  public static async getSessions(apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'GET',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  public static async createSession(sessionId: string, sessionName: string, apiKey: string, isPrimary = true) {
    const res = await fetch(`${API_BASE_URL}/sessions`, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({ sessionId, sessionName, isPrimary })
    });
    return res.json();
  }

  public static async getSessionStatus(sessionId: string, apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/status`, {
      method: 'GET',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  public static async refreshQr(sessionId: string, apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/refresh-qr`, {
      method: 'POST',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  public static async deleteSession(sessionId: string, apiKey: string, deleteData = false) {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}?deleteData=${deleteData}`, {
      method: 'DELETE',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  public static async disconnectSession(sessionId: string, apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/disconnect`, {
      method: 'POST',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  public static async requestPairingCode(sessionId: string, phoneNumber: string, apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/pairing-code`, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({ phoneNumber })
    });
    return res.json();
  }

  public static getQrStreamUrl(sessionId: string): string {
    return `${API_BASE_URL}/sessions/${sessionId}/qr-stream`;
  }

  public static getEventsStreamUrl(sessionId?: string, apiKey?: string): string {
    const params = new URLSearchParams();
    if (sessionId) params.set('sessionId', sessionId);
    if (apiKey) params.set('apiKey', apiKey);
    const qs = params.toString();
    return `${API_BASE_URL}/events${qs ? `?${qs}` : ''}`;
  }

  /**
   * Outbound Message Dispatch
   */
  public static async sendMessage(params: {
    sessionId: string;
    to: string;
    content: string;
    messageType?: string;
    mediaUrl?: string;
    apiKey: string;
  }) {
    const { apiKey, ...body } = params;
    const res = await fetch(`${API_BASE_URL}/messages/send`, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify(body)
    });
    return res.json();
  }

  /**
   * Live Catalog Management
   */
  public static async getCatalog(apiKey: string, search?: string) {
    const url = new URL(`${API_BASE_URL}/catalog`);
    if (search) url.searchParams.set('search', search);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  public static async saveCatalogItems(items: CatalogItem[], apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/catalog`, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({ items })
    });
    return res.json();
  }

  /**
   * Upload and AI-parse a PDF price sheet or catalog
   */
  public static async uploadCatalogPdf(params: {
    fileName: string;
    content: string;
    defaultCategory?: string;
  }, apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/catalog/upload-pdf`, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify(params)
    });
    return res.json();
  }

  /**
   * RAG & AI ERP Natural Language Queries
   */
  public static async queryErp(query: string, apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/erp/query`, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({ query })
    });
    return res.json();
  }

  public static async syncRagEmbeddings(apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/rag/sync`, {
      method: 'POST',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  public static async searchSemanticRag(query: string, apiKey: string, limit = 5) {
    const res = await fetch(`${API_BASE_URL}/rag/search`, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({ query, limit })
    });
    return res.json();
  }

  public static async refreshQr(sessionId: string, apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/refresh-qr`, {
      method: 'POST',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  /**
   * Real Contacts & Message History
   */
  public static async getContacts(apiKey: string, sessionId?: string) {
    const url = new URL(`${API_BASE_URL}/messages/contacts`);
    if (sessionId) url.searchParams.set('sessionId', sessionId);
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  public static async getMessages(contactId: string, apiKey: string) {
    const encodedId = encodeURIComponent(contactId);
    const res = await fetch(`${API_BASE_URL}/messages/conversation/${encodedId}`, {
      method: 'GET',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  public static async deleteContact(contactId: string, apiKey: string) {
    const encodedId = encodeURIComponent(contactId);
    const res = await fetch(`${API_BASE_URL}/messages/contacts/${encodedId}`, {
      method: 'DELETE',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  public static async deleteMessages(messageIds: string[], apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/messages/batch-delete`, {
      method: 'DELETE',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({ messageIds })
    });
    return res.json();
  }

  public static async togglePinMessage(params: {
    contactId: string;
    messageId: string;
    isPinned?: boolean;
  }, apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/messages/pin`, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify(params)
    });
    return res.json();
  }

  /**
   * User Authentication & Account Isolation (by unique company domain)
   */
  public static async register(data: {
    domain: string;
    password: string;
    businessName: string;
    category?: string;
    categoryLabel?: string;
    ownerName?: string;
    phone?: string;
    email?: string;
    address?: string;
    currency?: string;
    workingHours?: string;
    greetingMessage?: string;
    aiPersonaPrompt?: string;
  }): Promise<{ success: boolean; token: string; account: BusinessAccount; user: any; error?: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to register account');
    return result;
  }

  public static async login(credentials: {
    domain: string;
    password: string;
  }): Promise<{ success: boolean; token: string; account: BusinessAccount; user: any; error?: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Invalid domain or password');
    return result;
  }

  public static async updatePassword(
    data: { domain?: string; currentPassword?: string; newPassword: string },
    apiKey: string
  ): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/update-password`, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update password');
    return result;
  }

  public static async getMe(apiKeyOrDomain: string): Promise<{ success: boolean; account: BusinessAccount; user: any }> {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(apiKeyOrDomain)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Account not found');
    return result;
  }

  /**
   * RAG Knowledge Base & Document Vector Management
   */
  public static async getRagDocuments(apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/rag/documents`, {
      method: 'GET',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  public static async uploadRagDocument(doc: { name: string; type: string; size: string; content: string; isBase64?: boolean; category?: string }, apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/rag/documents/upload`, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify(doc)
    });
    return res.json();
  }

  public static async deleteRagDocument(id: string, apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/rag/documents/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  public static async reindexRagDocuments(apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/rag/documents/reindex`, {
      method: 'POST',
      headers: this.getHeaders(apiKey)
    });
    return res.json();
  }

  public static async queryRagKnowledgeBase(query: string, apiKey: string) {
    const res = await fetch(`${API_BASE_URL}/rag/query`, {
      method: 'POST',
      headers: this.getHeaders(apiKey),
      body: JSON.stringify({ query })
    });
    return res.json();
  }
}
