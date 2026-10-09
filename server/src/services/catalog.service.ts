import { prisma } from '../config/database';
import { RagService } from './rag.service';
import { ENV } from '../config/env';
import zlib from 'zlib';

export class CatalogService {
  public static async getCatalog(businessId: string, category?: string, search?: string) {
    const where: any = { businessId };
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } }
      ];
    }

    return prisma.catalogItem.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  }

  public static async upsertItem(params: {
    businessId: string;
    sku: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    unit?: string;
    description?: string;
    isAvailable?: boolean;
  }) {
    const { businessId, sku, name, category, price, stock, unit = 'pcs', description, isAvailable = true } = params;

    // Check if item with same sku already exists for this business
    const existing = await prisma.catalogItem.findFirst({
      where: { businessId, sku }
    });

    let savedItem;
    if (existing) {
      savedItem = await prisma.catalogItem.update({
        where: { id: existing.id },
        data: { name, category, price, stock, unit, description, isAvailable }
      });
    } else {
      savedItem = await prisma.catalogItem.create({
        data: { businessId, sku, name, category, price, stock, unit, description, isAvailable }
      });
    }

    // Auto-index into pgvector via RagService asynchronously
    RagService.indexCatalogItem({
      id: savedItem.id,
      businessId: savedItem.businessId,
      sku: savedItem.sku,
      name: savedItem.name,
      category: savedItem.category,
      price: savedItem.price.toString(),
      stock: savedItem.stock,
      unit: savedItem.unit,
      description: savedItem.description
    }).catch((err) => console.error('Failed to auto-index item in pgvector:', err));

    return savedItem;
  }

  public static async bulkUpsert(businessId: string, items: Array<{
    sku: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    unit?: string;
    description?: string;
    isAvailable?: boolean;
  }>) {
    const results = [];
    for (const item of items) {
      const saved = await CatalogService.upsertItem({
        businessId,
        ...item
      });
      results.push(saved);
    }
    return results;
  }

  public static async updateItem(id: string, updates: any) {
    const item = await prisma.catalogItem.update({
      where: { id },
      data: updates
    });

    RagService.indexCatalogItem({
      id: item.id,
      businessId: item.businessId,
      sku: item.sku,
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      stock: item.stock,
      unit: item.unit,
      description: item.description
    }).catch(() => null);

    return item;
  }

  public static async deleteItem(id: string) {
    return prisma.catalogItem.delete({
      where: { id }
    });
  }

  /**
   * Helper to extract plain text and table lines from raw PDF buffer without external packages
   */
  public static extractTextFromPdfBuffer(buffer: Buffer): string {
    const content = buffer.toString('binary');
    const extractedChunks: string[] = [];

    // Find all stream ... endstream blocks in PDF
    const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
    let match;
    while ((match = streamRegex.exec(content)) !== null) {
      const streamContent = match[1];
      let decompressed: Buffer | null = null;
      try {
        const streamBuf = Buffer.from(streamContent, 'binary');
        decompressed = zlib.inflateSync(streamBuf);
      } catch {
        try {
          const streamBuf = Buffer.from(streamContent, 'binary');
          decompressed = zlib.unzipSync(streamBuf);
        } catch {
          // Uncompressed or raw stream
        }
      }

      const textToSearch = decompressed ? decompressed.toString('utf-8') : streamContent;

      // Extract text in Tj operators: (Some text) Tj
      const tjRegex = /\(([^)]+)\)\s*Tj/g;
      let tjMatch;
      while ((tjMatch = tjRegex.exec(textToSearch)) !== null) {
        const clean = tjMatch[1].replace(/\\([0-7]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
        extractedChunks.push(clean);
      }

      // Extract text in TJ array operators: [(Part 1) 10 (Part 2)] TJ
      const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
      let tjArrayMatch;
      while ((tjArrayMatch = tjArrayRegex.exec(textToSearch)) !== null) {
        const inner = tjArrayMatch[1];
        const parts = inner.match(/\(([^)]+)\)/g);
        if (parts) {
          const joined = parts.map((p) => p.slice(1, -1)).join(' ');
          extractedChunks.push(joined);
        }
      }
    }

    // Fallback: Extract all printable ASCII sequences if streams yielded low text
    if (extractedChunks.length < 5) {
      const printable = buffer.toString('utf-8').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ');
      const lines = printable
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 2 && !l.startsWith('%') && !l.startsWith('xref') && !l.startsWith('trailer'));
      return lines.join('\n');
    }

    return extractedChunks.join('\n');
  }

  /**
   * Upload and AI-parse a PDF catalog / price list document.
   * Extracts product headers (name, sku, category, price, stock, unit, description),
   * maps to database schema, upserts to PostgreSQL for the business account,
   * and auto-indexes into pgvector.
   */
  public static async uploadAndParsePdf(params: {
    businessId: string;
    fileName: string;
    base64Content: string;
    defaultCategory?: string;
  }): Promise<{
    success: boolean;
    count: number;
    items: Array<any>;
    message: string;
  }> {
    const { businessId, fileName, base64Content, defaultCategory = 'General' } = params;

    // Verify it is a PDF
    if (!fileName.toLowerCase().endsWith('.pdf') && !base64Content.startsWith('JVBERi0')) {
      throw new Error('Only PDF documents (.pdf) are allowed for catalog import.');
    }

    const business = (await prisma.businessAccount.findUnique({
      where: { id: businessId }
    })) || (await prisma.businessAccount.findFirst());

    if (!business) {
      throw new Error('Business account not found.');
    }

    const buffer = Buffer.from(base64Content, 'base64');
    const extractedText = CatalogService.extractTextFromPdfBuffer(buffer);

    console.log(`📄 [Catalog PDF] Uploaded "${fileName}" (${buffer.length} bytes). Extracted text length: ${extractedText.length} chars.`);

    let parsedItems: Array<{
      name: string;
      sku?: string;
      category?: string;
      price: number;
      stock?: number;
      unit?: string;
      description?: string;
    }> = [];

    const categoryPrefix = (defaultCategory || business.category || 'SKU')
      .toUpperCase()
      .replace(/[^A-Z]/g, '')
      .slice(0, 4) || 'ITEM';

    // Strategy 1: Use Gemini API directly on PDF inline data if key is available
    if (ENV.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an AI Inventory & Catalog Parser for "${business.businessName}".
The uploaded PDF contains an inventory sheet, price list, menu, or product catalog.
Examine the document headers and content carefully. Extract all products and services into a valid JSON array of objects.
Each object MUST have the following schema:
[
  {
    "name": "Product Name",
    "sku": "SKU code (if present in doc, or create sensible SKU like ${categoryPrefix}-101)",
    "category": "${defaultCategory || business.category || 'Products'}",
    "price": 1299.00,
    "stock": 25,
    "unit": "pcs",
    "description": "Short description or specifications"
  }
]

CRITICAL: Return ONLY raw JSON array. Do NOT wrap in markdown code blocks, do NOT add introductory or concluding text.`;

        const result = await model.generateContent([
          {
            inlineData: {
              data: base64Content,
              mimeType: 'application/pdf'
            }
          },
          prompt
        ]);

        const textOutput = result.response.text().trim();
        const cleanedJson = textOutput.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
        const json = JSON.parse(cleanedJson);
        if (Array.isArray(json) && json.length > 0) {
          parsedItems = json;
          console.log(`✨ [Gemini AI] Successfully extracted ${json.length} items from PDF.`);
        }
      } catch (geminiErr: any) {
        console.warn('⚠️ Gemini PDF extraction notice:', geminiErr.message);
      }
    }

    // Strategy 2: Use Groq LLM if Gemini didn't return items
    if (parsedItems.length === 0 && ENV.GROQ_API_KEY && extractedText.trim().length > 0) {
      try {
        const groqModel = ENV.GROQ_LLM_MODEL || 'openai/gpt-oss-120b';
        const prompt = `You are an AI Inventory & Catalog Parser for "${business.businessName}".
The following text was extracted from a PDF catalog, price list, or inventory document:

--- BEGIN EXTRACTED TEXT ---
${extractedText.slice(0, 16000)}
--- END EXTRACTED TEXT ---

Examine the headers (Product Name, SKU, Category, Price, Stock, Unit, Description) and extract every item into a valid JSON array of objects.
Each object MUST have:
[
  {
    "name": "Product Name",
    "sku": "SKU or generate ${categoryPrefix}-101",
    "category": "${defaultCategory || business.category || 'Products'}",
    "price": 1299.00,
    "stock": 10,
    "unit": "pcs",
    "description": "Short description"
  }
]

CRITICAL: Return ONLY raw JSON array. Do not include markdown code block syntax or explanations.`;

        let groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.1,
            max_tokens: 1500
          })
        });

        if (!groqRes.ok) {
          groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.1,
              max_tokens: 1500
            })
          });
        }

        if (groqRes.ok) {
          const data = await groqRes.json();
          const rawContent = data.choices?.[0]?.message?.content?.trim() || '';
          const cleanedJson = rawContent.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
          const json = JSON.parse(cleanedJson);
          if (Array.isArray(json) && json.length > 0) {
            parsedItems = json;
            console.log(`✨ [Groq AI] Successfully extracted ${json.length} items from PDF text.`);
          }
        }
      } catch (groqErr: any) {
        console.warn('⚠️ Groq PDF extraction notice:', groqErr.message);
      }
    }

    // Strategy 3: Heuristic text line extraction if LLM is unavailable
    if (parsedItems.length === 0) {
      const lines = extractedText.split('\n').map((l) => l.trim()).filter((l) => l.length > 2);
      let count = 1;
      for (const line of lines) {
        const priceMatch = line.match(/(?:₹|Rs\.?|\$)\s*(\d+(?:\.\d{1,2})?)|\b(\d{2,6}(?:\.\d{1,2})?)\b/);
        if (priceMatch) {
          const rawPrice = parseFloat(priceMatch[1] || priceMatch[2]);
          const namePart = line.replace(priceMatch[0], '').replace(/[^\w\s-]/g, '').trim();
          if (namePart.length >= 3 && rawPrice > 0) {
            parsedItems.push({
              name: namePart,
              sku: `${categoryPrefix}-${String(count).padStart(3, '0')}`,
              category: defaultCategory || business.category || 'Products',
              price: rawPrice,
              stock: 10,
              unit: 'pcs',
              description: `Imported from ${fileName}`
            });
            count++;
          }
        }
      }
    }

    if (parsedItems.length === 0) {
      throw new Error(`Could not parse any product rows from "${fileName}". Please ensure the PDF contains product names and prices.`);
    }

    // Sanitize and upsert each item into PostgreSQL
    const savedItems = [];
    let itemIndex = 1;
    for (const raw of parsedItems) {
      const name = String(raw.name || '').trim();
      if (!name) continue;

      const price = Math.max(0, parseFloat(String(raw.price)) || 0);
      const stock = Math.max(0, parseInt(String(raw.stock), 10) || 10);
      const category = String(raw.category || defaultCategory || business.category || 'General').trim();
      const unit = String(raw.unit || 'pcs').trim() || 'pcs';
      const description = raw.description ? String(raw.description).trim() : `Imported from ${fileName}`;
      const sku = raw.sku && String(raw.sku).trim()
        ? String(raw.sku).trim()
        : `${categoryPrefix}-${String(itemIndex + Math.floor(Math.random() * 800)).padStart(3, '0')}`;

      const saved = await CatalogService.upsertItem({
        businessId: business.id,
        sku,
        name,
        category,
        price,
        stock,
        unit,
        description,
        isAvailable: stock > 0
      });

      savedItems.push(saved);
      itemIndex++;
    }

    // Automatically sync embeddings to pgvector
    RagService.syncBusinessCatalog(business.id).catch((e) => console.warn('Sync embeddings notice:', e.message));

    console.log(`✅ [Catalog PDF] Successfully imported ${savedItems.length} products from "${fileName}" for business "${business.businessName}".`);

    return {
      success: true,
      count: savedItems.length,
      items: savedItems,
      message: `Successfully imported ${savedItems.length} products from "${fileName}"!`
    };
  }
}
