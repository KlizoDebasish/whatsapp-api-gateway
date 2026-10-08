import { RagService } from './rag.service';
import { prisma } from '../config/database';
import { ENV } from '../config/env';

export class ErpService {
  /**
   * Queries the VectorDB (pgvector catalog embeddings & document chunks) and synthesizes
   * an intelligent WhatsApp response starting with an AI greeting & contextual question,
   * followed by grounded RAG retrieved information, and closing with next steps.
   */
  public static async queryErp(params: {
    businessId: string;
    query: string;
  }): Promise<{
    matched: boolean;
    items: Array<{
      sku: string;
      name: string;
      category: string;
      price: number;
      stock: number;
      unit: string;
      inStock: boolean;
    }>;
    aiGeneratedReply: string;
  }> {
    const { businessId, query } = params;
    const lowerQuery = query.toLowerCase().trim();

    const business = await prisma.businessAccount.findUnique({
      where: { id: businessId }
    }) || await prisma.businessAccount.findFirst();

    if (!business) {
      throw new Error('Business account not found');
    }

    const currency = business.currency || '₹';
    const bizCategory = (business.category || 'custom').toLowerCase();
    const isGym = bizCategory === 'gym' || business.businessName.toLowerCase().includes('gym') || business.businessName.toLowerCase().includes('fit');
    const isPharma = bizCategory === 'medicine' || bizCategory === 'pharmacy' || business.businessName.toLowerCase().includes('pharma') || business.businessName.toLowerCase().includes('apollo') || business.businessName.toLowerCase().includes('med');
    const isGrocery = bizCategory === 'grocery' || bizCategory === 'supermarket' || business.businessName.toLowerCase().includes('mart') || business.businessName.toLowerCase().includes('fresh') || business.businessName.toLowerCase().includes('grocery');
    const isElectronics = bizCategory === 'electronics' || bizCategory === 'tech' || business.businessName.toLowerCase().includes('tech') || business.businessName.toLowerCase().includes('gadget') || business.businessName.toLowerCase().includes('electronics');
    const isRestaurant = bizCategory === 'restaurant' || bizCategory === 'cafe' || bizCategory === 'food' || business.businessName.toLowerCase().includes('cafe') || business.businessName.toLowerCase().includes('bistro') || business.businessName.toLowerCase().includes('restaurant');
    const isSalon = bizCategory === 'salon' || bizCategory === 'spa' || bizCategory === 'beauty' || business.businessName.toLowerCase().includes('salon') || business.businessName.toLowerCase().includes('spa');

    // 1. VectorDB Retrieval (Catalog Semantic Search via pgvector)
    let catalogMatches: any[] = [];
    try {
      catalogMatches = await RagService.semanticSearch({
        businessId: business.id,
        query,
        limit: 4
      });
    } catch (err: any) {
      console.warn('Catalog semantic search warning:', err.message);
    }

    // 2. VectorDB Retrieval (Knowledge Base Document Chunks via pgvector)
    let docMatches: any[] = [];
    try {
      const kbResult = await RagService.queryKnowledgeBase({
        businessId: business.id,
        query,
        limit: 3
      });
      docMatches = kbResult.retrievedChunks || [];
    } catch (err: any) {
      console.warn('Doc chunks retrieval warning:', err.message);
    }

    const topCatalogMatch = catalogMatches.find((m) => m.similarity > 0.35) || catalogMatches[0];
    const topDocMatch = docMatches.find((d) => d.similarity > 0.45) || docMatches[0];

    // Format retrieved vector context for LLM
    const catalogContextText = catalogMatches.length > 0
      ? catalogMatches.map((item, idx) => 
          `[Item ${idx + 1}] Name: ${item.name} | SKU: ${item.sku} | Category: ${item.category} | Price: ${currency}${item.price} | Stock: ${item.stock} ${item.unit} (${item.stock > 0 ? 'In Stock' : 'Out of Stock'}) | Description: ${item.description || 'N/A'}`
        ).join('\n')
      : 'No exact catalog matches found in vector database.';

    const docContextText = docMatches.length > 0
      ? docMatches.map((d, idx) => `[Source ${idx + 1} (${d.docName})]: ${d.text}`).join('\n\n')
      : 'No specific document chunks found.';

    // Intent checks
    const isHoursQuery = /\b(time|timing|timings|open|close|hours|schedule)\b/i.test(lowerQuery);
    const isLocationQuery = /\b(address|location|where|map|shop location)\b/i.test(lowerQuery);

    // 3. Synthesize response via Groq LLM (LangChain ChatGroq / openai/gpt-oss-120b)
    let synthesizedReply = '';

    if (ENV.GROQ_API_KEY) {
      try {
        const groqModel = ENV.GROQ_LLM_MODEL || 'openai/gpt-oss-120b';
        const systemPrompt = `You are the official WhatsApp AI Assistant for "${business.businessName}" (${business.categoryLabel || business.category}).
Your persona: "${business.aiPersonaPrompt}".

CRITICAL INSTRUCTION - EVERY RESPONSE MUST STRICTLY FOLLOW THIS 3-PART STRUCTURE:
1. AI GREETING & CONTEXTUAL QUESTION:
   - Begin with a warm, energetic greeting acknowledging the business (e.g. "Hello! Welcome to ${business.businessName}! 👋").
   - Follow immediately with a thoughtful, contextual question tailored to the customer query and industry:
     * Gym / Fitness: e.g. "Are you looking for membership plans, personal workout coaching, or supplement guidance today?"
     * Pharmacy / Medicine: e.g. "Are you inquiring about medicine availability, prescription fulfillment, dosage details, or healthcare consultations today?"
     * Grocery / Supermarket: e.g. "Are you looking for fresh produce, daily essentials, or packaged groceries today?"
     * Electronics / Tech: e.g. "Are you looking for device specifications, warranty information, or tech recommendations today?"
     * Restaurant / Food: e.g. "Are you inquiring about our chef specials, dining menu, or booking a table reservation today?"
     * Salon / Spa: e.g. "Are you looking to schedule a haircut, styling, skin treatment, or beauty appointment today?"
     * General / Retail: e.g. "How can I assist you with our catalog, services, or order placement today?"
2. GROUNDED VECTORDB RETRIEVAL:
   - Present the grounded facts retrieved from our pgvector vector database and catalog records.
   - If products found: list product name, SKU, price in ${currency}, stock status (✅ In Stock or ⚠️ Out of Stock), and details.
   - If document chunks found: accurately answer using the retrieved knowledge base facts.
   - If asking timings/location: state operating hours (${business.workingHours}) and address (${business.address || 'Main Road'}).
3. HELPFUL NEXT STEP & CALL TO ACTION:
   - Conclude with an encouraging, actionable question or closing (e.g. "Would you like me to reserve a trial session / confirm your order? Reply with your preferred details to proceed!").

Formatting: Use WhatsApp markdown (*bold*, bullet points •, clear blank lines). Do NOT invent products not in the retrieved context.`;

        const userPrompt = `Customer Query: "${query}"

[Retrieved VectorDB Catalog Context]:
${catalogContextText}

[Retrieved VectorDB Document Chunks]:
${docContextText}

[Store Profile]:
• Business: ${business.businessName}
• Category: ${business.categoryLabel || business.category}
• Working Hours: ${business.workingHours}
• Store Location: ${business.address || 'Central Road'}
• Direct Phone: ${business.phone}
• Currency: ${currency}

Please generate the complete 3-part WhatsApp response now.`;

        let groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.35,
            max_tokens: 600
          })
        });

        if (!groqRes.ok) {
          // Fallback to llama-3.3-70b-versatile
          groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              temperature: 0.35,
              max_tokens: 600
            })
          });
        }

        if (groqRes.ok) {
          const data = await groqRes.json();
          synthesizedReply = data.choices?.[0]?.message?.content?.trim() || '';
        }
      } catch (err: any) {
        console.warn('Groq synthesis notice:', err.message);
      }
    }

    // 4. Deterministic High-Quality Fallback if LLM API is unavailable
    if (!synthesizedReply) {
      let greetingAndQuestion = '';
      let closingCta = '';

      if (isGym) {
        greetingAndQuestion = `👋 *Hello! Welcome to ${business.businessName}!* 🏋️\nAre you looking for membership plans, personal workout coaching, or supplement guidance today?`;
        closingCta = `💬 Would you like me to reserve a trial session or guide you through our membership options? Reply with your preference!`;
      } else if (isPharma) {
        greetingAndQuestion = `👋 *Hello! Welcome to ${business.businessName}!* 🌿💊\nAre you looking for medicine availability, prescription fulfillment, dosage details, or healthcare consultations today?`;
        closingCta = `💬 Would you like to place an order or speak directly with our team at *${business.phone}*? Let me know how you'd like to proceed!`;
      } else if (isGrocery) {
        greetingAndQuestion = `👋 *Hello! Welcome to ${business.businessName}!* 🛒🍎\nAre you looking for fresh produce, daily essentials, or packaged groceries today?`;
        closingCta = `💬 Would you like to confirm this order for express home delivery or pickup? Reply with your item list!`;
      } else if (isElectronics) {
        greetingAndQuestion = `👋 *Hello! Welcome to ${business.businessName}!* 💻⚡\nAre you looking for device specifications, warranty information, or tech recommendations today?`;
        closingCta = `💬 Would you like to reserve this device or check in-store stock? Let me know your preferred model!`;
      } else if (isRestaurant) {
        greetingAndQuestion = `👋 *Hello! Welcome to ${business.businessName}!* 🍽️🍕\nAre you inquiring about our chef specials, dining menu, or booking a table reservation today?`;
        closingCta = `💬 Would you like to book a table or place a takeaway order? Let me know your party size or pickup time!`;
      } else if (isSalon) {
        greetingAndQuestion = `👋 *Hello! Welcome to ${business.businessName}!* 💇‍♀️✨\nAre you looking to schedule a haircut, styling, skin treatment, or beauty appointment today?`;
        closingCta = `💬 Would you like to book an appointment with our stylists? Reply with your preferred date and time slot!`;
      } else {
        greetingAndQuestion = `👋 *Hello! Welcome to ${business.businessName}!* 🌟\nHow can I assist you with our catalog, services, or order placement today?`;
        closingCta = `💬 Would you like to place an order or speak directly with our team at *${business.phone}*? Let me know how you'd like to proceed!`;
      }

      let retrievedContent = '';
      if (isHoursQuery) {
        retrievedContent = `🕒 *Operating Hours:* We are open *${business.workingHours}*.\nFeel free to drop by or contact our front desk!`;
      } else if (isLocationQuery) {
        retrievedContent = `📍 *Store Location:* ${business.businessName}\n${business.address || 'Central Avenue'}\n📞 Contact Desk: *${business.phone}*`;
      } else if (topCatalogMatch && topCatalogMatch.similarity > 0.35) {
        const inStock = topCatalogMatch.stock > 0;
        const stockBadge = inStock
          ? `✅ In Stock (*${topCatalogMatch.stock} ${topCatalogMatch.unit}* available)`
          : `⚠️ Currently Out of Stock`;
        retrievedContent = `📦 *${topCatalogMatch.name}* (\`${topCatalogMatch.sku}\`)\n• Category: *${topCatalogMatch.category}*\n• Price: *${currency}${Number(topCatalogMatch.price).toFixed(2)} / ${topCatalogMatch.unit}*\n• Status: ${stockBadge}\n• Details: ${topCatalogMatch.description || 'Available in our active catalog'}`;
      } else if (topDocMatch && topDocMatch.similarity > 0.45) {
        retrievedContent = `📄 *Retrieved from Knowledge Base (${topDocMatch.docName}):*\n${topDocMatch.text}`;
      } else if (catalogMatches.length > 0) {
        const top3 = catalogMatches.slice(0, 3).map((item, idx) => 
          `${idx + 1}. *${item.name}* (${item.sku}) - *${currency}${Number(item.price).toFixed(2)}* (${item.stock > 0 ? 'In Stock' : 'Out of Stock'})`
        ).join('\n');
        retrievedContent = `🔍 *Similar items retrieved from our catalog:*\n${top3}`;
      } else {
        retrievedContent = `I searched our vector database for "${query}". While no exact item matched, you can ask about our catalog items, pricing, or operating hours (${business.workingHours}).`;
      }

      synthesizedReply = `${greetingAndQuestion}\n\n${retrievedContent}\n\n${closingCta}`;
    }

    const matched = (topCatalogMatch && topCatalogMatch.similarity > 0.35) ||
                    (topDocMatch && topDocMatch.similarity > 0.45) ||
                    isHoursQuery ||
                    isLocationQuery;

    return {
      matched: !!matched,
      items: catalogMatches.map((item) => ({
        sku: item.sku,
        name: item.name,
        category: item.category,
        price: Number(item.price),
        stock: item.stock,
        unit: item.unit,
        inStock: item.stock > 0
      })),
      aiGeneratedReply: synthesizedReply
    };
  }
}
