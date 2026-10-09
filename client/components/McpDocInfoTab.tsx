"use client";

import React, { useState } from "react";
import { 
  Bot, 
  Terminal, 
  Code, 
  Sparkles, 
  Copy, 
  Check, 
  BookOpen, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Package, 
  MessageSquare, 
  Send, 
  Upload, 
  Database, 
  Key, 
  RefreshCw, 
  FileText, 
  ExternalLink,
  ChevronRight,
  Settings,
  Activity,
  CheckCircle2,
  Sliders
} from "lucide-react";
import { BusinessAccount } from "@/lib/types";

interface McpDocInfoTabProps {
  account: BusinessAccount;
}

export function McpDocInfoTab({ account }: McpDocInfoTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<"antigravity" | "tools" | "features" | "api">("antigravity");
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(id);
    setTimeout(() => setCopiedSnippet(null), 2500);
  };

  const mcpConfigJson = JSON.stringify(
    {
      mcpServers: {
        messageapi: {
          command: "node",
          args: [
            "c:/Users/Debasish Panda/Desktop/wp-gateway/server/node_modules/tsx/dist/cli.mjs",
            "c:/Users/Debasish Panda/Desktop/wp-gateway/server/src/mcp/server.ts"
          ],
          env: {
            MESSAGEAPI_URL: "http://localhost:5000/api/v1",
            MESSAGEAPI_KEY: account.apiKey || "msgapi_master_secret_key_889922"
          }
        }
      }
    },
    null,
    2
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-6 sm:p-8 text-white border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <Bot className="w-3.5 h-3.5 text-teal-400" />
              <span>Model Context Protocol (MCP)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Google Antigravity Ready</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
              v1.0.0
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              MCP &amp; System Architecture Documentation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Connect Google Antigravity directly to your WhatsApp Gateway, pgvector Knowledge Base, and ERP Catalog. 
              Let your AI agent create WhatsApp instances, dispatch messages, update inventory, and manage settings autonomously.
            </p>
          </div>

          {/* Quick Stats Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Transport</p>
              <p className="text-sm font-extrabold text-teal-300">Stdio JSON-RPC</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Tools</p>
              <p className="text-sm font-extrabold text-emerald-300">8 Custom Tools</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vector DB</p>
              <p className="text-sm font-extrabold text-cyan-300">pgvector RAG</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-0.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Synthesis</p>
              <p className="text-sm font-extrabold text-indigo-300">Groq LLM 120B</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab("antigravity")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "antigravity"
              ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Bot className="w-3.5 h-3.5" />
          <span>Antigravity Setup &amp; Usage</span>
        </button>

        <button
          onClick={() => setActiveSubTab("tools")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "tools"
              ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Available MCP Tools (8)</span>
        </button>

        <button
          onClick={() => setActiveSubTab("features")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "features"
              ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Project Features &amp; Architecture</span>
        </button>

        <button
          onClick={() => setActiveSubTab("api")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === "api"
              ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80"
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>REST API Documentation</span>
        </button>
      </div>

      {/* ====================================================================== */}
      {/* SUB-TAB 1: ANTIGRAVITY SETUP & USAGE */}
      {/* ====================================================================== */}
      {activeSubTab === "antigravity" && (
        <div className="space-y-6">
          {/* Quick Start 3-Step Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xs border border-teal-200">
                1
              </div>
              <h4 className="text-sm font-bold text-slate-900">Install MCP SDK</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Run <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">npm install @modelcontextprotocol/sdk zod</code> in your <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">/server</code> folder.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-200">
                2
              </div>
              <h4 className="text-sm font-bold text-slate-900">Configure Antigravity</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add the server config to <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800 font-mono">~/.gemini/config/mcp_config.json</code> using the template below.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-xs border border-emerald-200">
                3
              </div>
              <h4 className="text-sm font-bold text-slate-900">Control via Chat</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Speak naturally with Antigravity! Ask it to create sessions, add catalog items, send messages, or upload documents.
              </p>
            </div>
          </div>

          {/* Antigravity Config Code Block */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 shadow-xl space-y-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold text-slate-200">Antigravity Configuration File</span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  Path: %USERPROFILE%\.gemini\config\mcp_config.json
                </p>
              </div>

              <button
                onClick={() => handleCopy(mcpConfigJson, "config_json")}
                className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer w-fit"
              >
                {copiedSnippet === "config_json" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy mcp_config.json</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
              {mcpConfigJson}
            </pre>
          </div>

          {/* How to Use in Antigravity (Prompt Examples) */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Natural Language Commands</span>
              </div>
              <h3 className="text-lg font-black text-slate-900">How You Can Now Use It in Antigravity</h3>
              <p className="text-xs text-slate-500">
                Once registered, Antigravity discovers your tools and executes them autonomously when you type in chat:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 transition-colors space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-teal-600" />
                  <span className="text-xs font-bold text-slate-900">1. Quick Add Product / SKU</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 font-mono text-[11px] text-slate-700">
                  &ldquo;Antigravity, quick add a product named &apos;Whey Protein Isolate 2kg&apos; for ₹4,999 with 20 stock under Supplements.&rdquo;
                </div>
                <p className="text-[11px] text-slate-500">
                  Calls <code className="text-teal-700 font-bold">quick_add_catalog_product</code>, updates PostgreSQL, and embeds into pgvector.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 transition-colors space-y-2">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-900">2. Create WhatsApp Session</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 font-mono text-[11px] text-slate-700">
                  &ldquo;Create a new WhatsApp session named &apos;Customer Support&apos;.&rdquo;
                </div>
                <p className="text-[11px] text-slate-500">
                  Calls <code className="text-blue-700 font-bold">create_whatsapp_session</code>, spawns a Baileys instance, and yields the pairing QR code.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 transition-colors space-y-2">
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">3. Send WhatsApp Message</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 font-mono text-[11px] text-slate-700">
                  &ldquo;Send a message to +919382468250 saying &apos;Your order #104 has been confirmed!&apos;.&rdquo;
                </div>
                <p className="text-[11px] text-slate-500">
                  Calls <code className="text-emerald-700 font-bold">send_whatsapp_message</code> with single asterisk formatting and human typing delay.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 transition-colors space-y-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-900">4. Upload Document to RAG</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 font-mono text-[11px] text-slate-700">
                  &ldquo;Upload this 7-day return policy text to our RAG knowledge base under Customer Service.&rdquo;
                </div>
                <p className="text-[11px] text-slate-500">
                  Calls <code className="text-purple-700 font-bold">upload_rag_document</code> and indexes text chunks into pgvector.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 transition-colors space-y-2">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-900">5. Update Settings</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 font-mono text-[11px] text-slate-700">
                  &ldquo;Update our business working hours to &apos;08:00 AM - 10:00 PM&apos; in settings.&rdquo;
                </div>
                <p className="text-[11px] text-slate-500">
                  Calls <code className="text-amber-700 font-bold">update_business_settings</code> and syncs settings to database.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 transition-colors space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-slate-900">6. Get Live Updates</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 font-mono text-[11px] text-slate-700">
                  &ldquo;What are our latest incoming WhatsApp messages and active instances?&rdquo;
                </div>
                <p className="text-[11px] text-slate-500">
                  Calls <code className="text-rose-700 font-bold">get_latest_updates</code> and reports back real-time metrics.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 hover:bg-teal-50/50 border border-slate-200 transition-colors space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-900">7. Generate Category AI Visual</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 font-mono text-[11px] text-slate-700">
                  &ldquo;Generate a 1024×1024 photorealistic visual of a gym dumbbell rack for our store.&rdquo;
                </div>
                <p className="text-[11px] text-slate-500">
                  Calls <code className="text-emerald-700 font-bold">generate_ai_visual</code> with category-constrained guardrails and optional Cloudinary CDN re-hosting.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* SUB-TAB 2: AVAILABLE MCP TOOLS REFERENCE */}
      {/* ====================================================================== */}
      {activeSubTab === "tools" && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-1">
            <h3 className="text-lg font-black text-slate-900">9 Native Antigravity MCP Tools</h3>
            <p className="text-xs text-slate-500">
              Each tool is defined with Zod schema validation and exposed via Stdio JSON-RPC.
            </p>
          </div>

          <div className="space-y-3">
            {/* Tool 1 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-800 font-mono text-xs font-extrabold">
                    quick_add_catalog_product
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Dashboard &amp; VectorDB
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">POST /api/v1/catalog + /sync</span>
              </div>
              <p className="text-xs text-slate-600">
                Adds a product/SKU to the live catalog and triggers instant LangChain pgvector indexing.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 space-y-1">
                <p className="font-bold text-slate-900 text-[10px] uppercase">Parameters:</p>
                <p>• <span className="text-teal-700 font-bold">name</span> (string, required): Item name (e.g. &apos;Dolo 650mg&apos;)</p>
                <p>• <span className="text-teal-700 font-bold">price</span> (number, required): Price of the product</p>
                <p>• <span className="text-teal-700 font-bold">stock</span> (number): Available inventory quantity</p>
                <p>• <span className="text-slate-500 font-bold">category</span> (string): Product category</p>
                <p>• <span className="text-slate-500 font-bold">sku</span> (string, optional): Unique SKU code</p>
                <p>• <span className="text-slate-500 font-bold">unit</span> (string, optional): &apos;pcs&apos;, &apos;strip&apos;, &apos;month&apos;, etc.</p>
              </div>
            </div>

            {/* Tool 2 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 font-mono text-xs font-extrabold">
                    create_whatsapp_session
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                    Multi-Device Baileys
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">POST /api/v1/sessions</span>
              </div>
              <p className="text-xs text-slate-600">
                Spawns a new WhatsApp Baileys session with a given instance name and returns pairing status.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 space-y-1">
                <p className="font-bold text-slate-900 text-[10px] uppercase">Parameters:</p>
                <p>• <span className="text-blue-700 font-bold">sessionName</span> (string, required): e.g. &apos;Support Line&apos;, &apos;Sales Desk&apos;</p>
                <p>• <span className="text-slate-500 font-bold">isPrimary</span> (boolean): Whether instance is primary</p>
              </div>
            </div>

            {/* Tool 3 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs font-extrabold">
                    send_whatsapp_message
                  </span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Anti-Ban Protected
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">POST /api/v1/messages/send</span>
              </div>
              <p className="text-xs text-slate-600">
                Dispatches a message using single asterisk (*bold*) WhatsApp formatting and human typing pacing.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 space-y-1">
                <p className="font-bold text-slate-900 text-[10px] uppercase">Parameters:</p>
                <p>• <span className="text-emerald-700 font-bold">to</span> (string, required): Phone with country code (e.g. &apos;+919382468250&apos;)</p>
                <p>• <span className="text-emerald-700 font-bold">content</span> (string, required): Message text</p>
                <p>• <span className="text-slate-500 font-bold">sessionId</span> (string, optional): Specific session ID</p>
              </div>
            </div>

            {/* Tool 4 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-800 font-mono text-xs font-extrabold">
                    upload_rag_document
                  </span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                    pgvector Indexing
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">POST /api/v1/rag/documents</span>
              </div>
              <p className="text-xs text-slate-600">
                Uploads document text or file data and segments it into pgvector cosine similarity chunks.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 space-y-1">
                <p className="font-bold text-slate-900 text-[10px] uppercase">Parameters:</p>
                <p>• <span className="text-purple-700 font-bold">name</span> (string, required): e.g. &apos;faq.txt&apos;, &apos;terms.pdf&apos;</p>
                <p>• <span className="text-purple-700 font-bold">content</span> (string, required): Raw text or base64 file data</p>
                <p>• <span className="text-slate-500 font-bold">type</span> (string): &apos;TXT&apos;, &apos;PDF&apos;, &apos;DOCX&apos;</p>
                <p>• <span className="text-slate-500 font-bold">category</span> (string): &apos;General&apos;, &apos;Policies&apos;, etc.</p>
              </div>
            </div>

            {/* Tool 5 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-800 font-mono text-xs font-extrabold">
                    query_rag_erp
                  </span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                    Groq LLM Synthesis
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">POST /api/v1/erp/query</span>
              </div>
              <p className="text-xs text-slate-600">
                Retrieves knowledge base chunks and catalog items to formulate a grounded customer response.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 space-y-1">
                <p className="font-bold text-slate-900 text-[10px] uppercase">Parameters:</p>
                <p>• <span className="text-amber-700 font-bold">query</span> (string, required): The customer question</p>
              </div>
            </div>

            {/* Tool 6 */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-300 text-slate-800 font-mono text-xs font-extrabold">
                    update_business_settings
                  </span>
                  <span className="text-[10px] bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded">
                    Account Config
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">PUT /api/v1/accounts/:id</span>
              </div>
              <p className="text-xs text-slate-600">
                Updates business persona, operating hours, auto-greeting, address, or phone in PostgreSQL.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-[11px] text-slate-700 space-y-1">
                <p className="font-bold text-slate-900 text-[10px] uppercase">Parameters:</p>
                <p>• <span className="text-slate-700 font-bold">workingHours</span>, <span className="text-slate-700 font-bold">aiPersonaPrompt</span>, <span className="text-slate-700 font-bold">greetingMessage</span>, <span className="text-slate-700 font-bold">address</span>, <span className="text-slate-700 font-bold">phone</span> (all optional strings)</p>
              </div>
            </div>

            {/* Tool 7 & 8 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 font-mono text-[11px] font-bold">
                  get_latest_updates
                </span>
                <p className="text-xs text-slate-600">
                  Fetches live connected instances, unread inquiries, and latest chats.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-800 font-mono text-[11px] font-bold">
                  list_whatsapp_sessions
                </span>
                <p className="text-xs text-slate-600">
                  Returns all WhatsApp instances, phone numbers, battery levels, and latency.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-[11px] font-bold">
                  generate_ai_visual
                </span>
                <p className="text-xs text-slate-600">
                  Generates 1024×1024 category-constrained photorealistic AI images via Pollinations AI with optional Cloudinary CDN hosting.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* SUB-TAB 3: PROJECT FEATURES & ARCHITECTURE */}
      {/* ====================================================================== */}
      {activeSubTab === "features" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">Multi-Device Baileys WhatsApp Gateway</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Connects real WhatsApp web sessions directly to your server. Eliminates Meta conversation fees, supports multi-number routing, real-time message listening, voice notes, and human anti-ban typing simulation.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">PostgreSQL + pgvector Semantic RAG</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Both catalog items and uploaded knowledge documents are vectorized using LangChain embeddings. Customer inquiries find the closest cosine matches in milliseconds directly in PostgreSQL.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">Groq LLM 3-Part Response Synthesis</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Powered by Groq (<code className="font-mono text-slate-800">openai/gpt-oss-120b</code> &amp; <code className="font-mono text-slate-800">llama-3.3-70b</code>). Generates 1) Welcome greeting &amp; contextual question, 2) Grounded catalog/facts, 3) Helpful next-step call-to-action.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black text-slate-900">Real-Time Server-Sent Events (SSE)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Live message stream keeps the web dashboard in lockstep with incoming and outgoing WhatsApp messages. Instant deduplication ensures chat bubbles never appear twice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* SUB-TAB 4: REST API DOCUMENTATION */}
      {/* ====================================================================== */}
      {activeSubTab === "api" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">REST API Reference</h3>
                <p className="text-xs text-slate-500">
                  Authenticate all requests using the header <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">x-api-key: {account.apiKey}</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                  Base: http://localhost:5000/api/v1
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 pr-4">Method</th>
                    <th className="py-2.5 pr-4">Endpoint</th>
                    <th className="py-2.5 pr-4">Description</th>
                    <th className="py-2.5">Key Payload / Query</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  <tr>
                    <td className="py-2.5 pr-4"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">POST</span></td>
                    <td className="py-2.5 pr-4 font-bold text-slate-900">/sessions</td>
                    <td className="py-2.5 pr-4 font-sans text-slate-600">Create new Baileys instance</td>
                    <td className="py-2.5 text-slate-500">&#123; sessionId, sessionName, isPrimary &#125;</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4"><span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">GET</span></td>
                    <td className="py-2.5 pr-4 font-bold text-slate-900">/sessions</td>
                    <td className="py-2.5 pr-4 font-sans text-slate-600">List all instances</td>
                    <td className="py-2.5 text-slate-500">-</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4"><span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">DELETE</span></td>
                    <td className="py-2.5 pr-4 font-bold text-slate-900">/sessions/:id</td>
                    <td className="py-2.5 pr-4 font-sans text-slate-600">Disconnect or wipe session</td>
                    <td className="py-2.5 text-slate-500">?deleteData=true</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">POST</span></td>
                    <td className="py-2.5 pr-4 font-bold text-slate-900">/messages/send</td>
                    <td className="py-2.5 pr-4 font-sans text-slate-600">Send WhatsApp message</td>
                    <td className="py-2.5 text-slate-500">&#123; sessionId, to, content &#125;</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4"><span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">GET</span></td>
                    <td className="py-2.5 pr-4 font-bold text-slate-900">/messages/contacts</td>
                    <td className="py-2.5 pr-4 font-sans text-slate-600">Fetch contacts list</td>
                    <td className="py-2.5 text-slate-500">-</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">POST</span></td>
                    <td className="py-2.5 pr-4 font-bold text-slate-900">/catalog</td>
                    <td className="py-2.5 pr-4 font-sans text-slate-600">Add SKU item to catalog</td>
                    <td className="py-2.5 text-slate-500">&#123; sku, name, price, stock &#125;</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">POST</span></td>
                    <td className="py-2.5 pr-4 font-bold text-slate-900">/catalog/sync</td>
                    <td className="py-2.5 pr-4 font-sans text-slate-600">Reindex catalog pgvector embeddings</td>
                    <td className="py-2.5 text-slate-500">-</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">POST</span></td>
                    <td className="py-2.5 pr-4 font-bold text-slate-900">/rag/documents</td>
                    <td className="py-2.5 pr-4 font-sans text-slate-600">Upload &amp; index document chunks</td>
                    <td className="py-2.5 text-slate-500">&#123; name, type, content, isBase64 &#125;</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4"><span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">POST</span></td>
                    <td className="py-2.5 pr-4 font-bold text-slate-900">/erp/query</td>
                    <td className="py-2.5 pr-4 font-sans text-slate-600">Semantic pgvector + Groq answer</td>
                    <td className="py-2.5 text-slate-500">&#123; query &#125;</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4"><span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold">PUT</span></td>
                    <td className="py-2.5 pr-4 font-bold text-slate-900">/accounts/:id</td>
                    <td className="py-2.5 pr-4 font-sans text-slate-600">Update account settings &amp; prompt</td>
                    <td className="py-2.5 text-slate-500">&#123; workingHours, aiPersonaPrompt &#125;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default McpDocInfoTab;
