import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { chatSessions, chatMessages, leads, agentUsage } from "../drizzle/schema";
import { getDb } from "./db";
import { invokeLLM, type Tool, type Message } from "./_core/llm";
import { nanoid } from "nanoid";
import { eq, asc, and, sql } from "drizzle-orm";
import { sendEmail, generateLeadNotificationEmail } from "./_core/emailService";
import { notifyOwner } from "./_core/notification";
import { searchProperties, formatListingsForAI, type PropertySearchParams } from "./propertyService";

// ─── Constants ──────────────────────────────────────────────────
const FREE_TIER_MONTHLY_LIMIT = 20;
const MAX_HISTORY_MESSAGES = 20;

// ─── Agent Profile Type ─────────────────────────────────────────
type AgentProfile = {
  name: string;
  title: string;
  brokerage: string;
  phone: string;
  email: string;
  serviceAreas: string[];
  specialties: string[];
  languages: string[];
  yearsExperience: number;
  awards: string[];
  recentTransactions: Array<{ address: string; city: string; price: string; type: string }>;
  neighborhoodKnowledge: Record<string, string>;
};

// ─── Agent Profiles (in production → DB) ────────────────────────
const AGENT_PROFILES: Record<string, AgentProfile> = {
  jane: {
    name: "Jane Smith",
    title: "Licensed Real Estate Agent",
    brokerage: "Kevv Realty",
    phone: "415.555.0123",
    email: "jane@kevvrealty.com",
    serviceAreas: ["San Francisco", "Bay Area", "Silicon Valley", "Palo Alto", "San Mateo", "Noe Valley", "Pacific Heights", "SOMA"],
    specialties: ["Residential Sales", "Investment Properties", "First-time Buyers", "Luxury Homes", "Property Staging", "Relocation"],
    languages: ["English", "Spanish"],
    yearsExperience: 10,
    awards: ["Top Producer (2018-2025)", "Platinum Circle Award (2023, 2024)", "Gold Award (2020, 2022)", "Bay Area Top 100 Agents"],
    recentTransactions: [
      { address: "742 Evergreen Terrace", city: "San Francisco, CA 94110", price: "$1,850,000", type: "Buyer & Seller" },
      { address: "1200 Pacific Heights Blvd", city: "San Francisco, CA 94115", price: "$2,350,000", type: "Seller" },
      { address: "88 Sunset Drive", city: "Palo Alto, CA 94301", price: "$3,200,000", type: "Buyer" },
      { address: "456 Marina Blvd #12A", city: "San Francisco, CA 94123", price: "$1,450,000", type: "Buyer" },
      { address: "2100 Noe Valley Way", city: "San Francisco, CA 94114", price: "$1,675,000", type: "Buyer & Seller" },
    ],
    neighborhoodKnowledge: {
      "Pacific Heights": "One of SF's most prestigious neighborhoods. Stunning Victorian and Edwardian architecture, Golden Gate Bridge views. Median home price ~$3.5M. Excellent walkability, close to Fillmore Street shops and restaurants.",
      "Noe Valley": "Family-friendly neighborhood with a village feel. Tree-lined streets, sunny microclimate. Median home price ~$2.2M. Known for 24th Street boutiques, farmers markets, and excellent schools.",
      "SOMA": "Vibrant, urban neighborhood popular with tech professionals. Mix of lofts, condos, and new developments. Median condo price ~$1.1M. Close to AT&T Park, Yerba Buena Gardens, and major tech offices.",
      "Marina District": "Scenic waterfront neighborhood. Mediterranean-style homes and condos. Median price ~$2M. Popular for its proximity to the Presidio, Palace of Fine Arts, and Marina Green.",
      "Mission District": "Culturally rich neighborhood with vibrant street art, restaurants, and nightlife. Mix of Victorian homes and modern condos. Median price ~$1.6M. Sunny microclimate.",
      "Palo Alto": "Heart of Silicon Valley. Top-rated schools, tree-lined streets, university town atmosphere. Median home price ~$3.8M. Minutes from Stanford University and major tech campuses.",
      "San Mateo": "Suburban feel with urban amenities. Good schools, diverse dining, convenient Peninsula location. Median home price ~$1.8M. Easy access to both SF and Silicon Valley via Caltrain.",
    },
  },
};

// ─── Language Detection ─────────────────────────────────────────

/**
 * Detect if text contains CJK characters (Chinese, Japanese, Korean).
 * Returns "zh" for Chinese-dominant text, "en" otherwise.
 */
function detectLanguage(text: string): "zh" | "en" {
  const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g;
  const cjkMatches = text.match(cjkRegex);
  const cjkRatio = cjkMatches ? cjkMatches.length / text.length : 0;
  return cjkRatio > 0.15 ? "zh" : "en";
}

// ─── LLM Tools ──────────────────────────────────────────────────

const PROPERTY_SEARCH_TOOL: Tool = {
  type: "function",
  function: {
    name: "search_properties",
    description: "Search for real estate properties for sale. Use when the visitor asks about available properties, listings, or homes in a specific area.",
    parameters: {
      type: "object",
      properties: {
        city: { type: "string", description: "City name, e.g. 'San Francisco'" },
        state: { type: "string", description: "State abbreviation, e.g. 'CA'" },
        minPrice: { type: "number", description: "Minimum price filter" },
        maxPrice: { type: "number", description: "Maximum price filter" },
        bedrooms: { type: "number", description: "Number of bedrooms" },
        propertyType: { type: "string", description: "Property type: single_family, condo, townhouse, multi_family" },
      },
      required: [],
    },
  },
};

const EXTRACT_LEAD_TOOL: Tool = {
  type: "function",
  function: {
    name: "extract_lead_info",
    description: "Extract lead qualification data from the conversation when the visitor reveals their preferences. Call this whenever you learn new information about what the visitor is looking for.",
    parameters: {
      type: "object",
      properties: {
        intent: {
          type: "string",
          enum: ["buying", "selling", "renting", "investing", "browsing"],
          description: "What the visitor intends to do",
        },
        budget: {
          type: "string",
          description: "Budget range mentioned, e.g. '$800K-$1.2M' or 'under $500K'",
        },
        area: {
          type: "string",
          description: "Areas or neighborhoods of interest",
        },
        timeline: {
          type: "string",
          description: "When they plan to buy/sell, e.g. 'next 3 months', 'just looking'",
        },
        urgency: {
          type: "string",
          enum: ["high", "medium", "low"],
          description: "How urgent their need seems",
        },
      },
      required: ["intent"],
    },
  },
};

// ─── System Prompt Builder ──────────────────────────────────────

function buildAgentSystemPrompt(
  agentSlug: string,
  userMessage?: string,
  language: "en" | "zh" = "en"
): string {
  const agent = AGENT_PROFILES[agentSlug] || AGENT_PROFILES.jane;

  // RAG: inject matching neighborhood data
  let neighborhoodCtx = "";
  if (userMessage) {
    const msgLower = userMessage.toLowerCase();
    const matches = Object.entries(agent.neighborhoodKnowledge)
      .filter(([name]) => msgLower.includes(name.toLowerCase()))
      .map(([name, info]) => `### ${name}\n${info}`);
    if (matches.length > 0) {
      neighborhoodCtx = `\n\n## Relevant Neighborhood Data\n${matches.join("\n\n")}`;
    }
  }

  const txCtx = agent.recentTransactions
    .map((t) => `  - ${t.address}, ${t.city} — ${t.price} (${t.type})`)
    .join("\n");

  const langInstructions = language === "zh"
    ? `\n\n## 语言
- 用户使用中文，请用中文回复
- 专业术语可以中英文对照（如：首付 Down Payment）
- 保持友好专业的语气`
    : `\n\n## Language
- Respond in the same language the visitor uses
- If they write in Chinese, respond in Chinese`;

  return `You are an AI real estate assistant (AI ISA) for ${agent.name}, a ${agent.title} at ${agent.brokerage}.

## Your Role
Help website visitors with real estate questions. Demonstrate deep local expertise. Your goal is to qualify leads by understanding what visitors need, then connect them with ${agent.name}.

## Agent Profile
- **Name**: ${agent.name} | **Title**: ${agent.title} | **Brokerage**: ${agent.brokerage}
- **Experience**: ${agent.yearsExperience}+ years | **Contact**: ${agent.phone} | ${agent.email}
- **Service Areas**: ${agent.serviceAreas.join(", ")}
- **Specialties**: ${agent.specialties.join(", ")}
- **Languages**: ${agent.languages.join(", ")}
- **Awards**: ${agent.awards.join(", ")}

## Recent Transactions
${txCtx}

## Known Neighborhoods
${Object.keys(agent.neighborhoodKnowledge).join(", ")}
${neighborhoodCtx}

## Tools
You have access to tools:
1. **search_properties** — Search real property listings. Use when visitors ask about specific properties or available homes.
2. **extract_lead_info** — Extract lead qualification data. Call this PROACTIVELY whenever you learn the visitor's intent, budget, area preference, or timeline. You don't need to tell the visitor you're doing this.

## Response Guidelines
1. Be genuinely helpful — provide real value, not just sales pitches
2. Use neighborhood data when visitors ask about specific areas
3. For pricing: share general market data, note exact pricing needs a CMA
4. Call **extract_lead_info** whenever you learn new visitor preferences (silently)
5. Call **search_properties** when they ask for listings
6. Keep responses concise: 2-3 short paragraphs, use bullet points
7. Naturally encourage sharing contact info after 2-3 exchanges
8. Never fabricate listings or statistics you weren't given
9. Be warm and professional — conversational but not pushy
10. When uncertain, offer to connect them with ${agent.name} directly
${langInstructions}`;
}

// ─── Usage Tracking Helpers ─────────────────────────────────────

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7); // "2026-03"
}

async function incrementUsage(agentSlug: string, field: "conversationCount" | "leadCount"): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const month = getCurrentMonth();
  try {
    // Upsert: increment or create
    const existing = await db
      .select()
      .from(agentUsage)
      .where(and(eq(agentUsage.agentSlug, agentSlug), eq(agentUsage.month, month)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(agentUsage)
        .set({ [field]: sql`${agentUsage[field]} + 1` })
        .where(and(eq(agentUsage.agentSlug, agentSlug), eq(agentUsage.month, month)));
      return (existing[0][field] || 0) + 1;
    } else {
      await db.insert(agentUsage).values({
        agentSlug,
        month,
        [field]: 1,
      });
      return 1;
    }
  } catch (e) {
    console.warn("[Usage] Failed to track usage:", e);
    return 0;
  }
}

async function getMonthlyConversations(agentSlug: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  try {
    const rows = await db
      .select()
      .from(agentUsage)
      .where(and(eq(agentUsage.agentSlug, agentSlug), eq(agentUsage.month, getCurrentMonth())))
      .limit(1);
    return rows[0]?.conversationCount || 0;
  } catch {
    return 0;
  }
}

// ─── Lead Scoring ───────────────────────────────────────────────

type LeadExtraction = {
  intent?: string;
  budget?: string;
  area?: string;
  timeline?: string;
  urgency?: string;
};

function scoreLeadFromExtraction(ext: LeadExtraction): "hot" | "warm" | "cold" {
  let score = 0;
  if (ext.intent && ext.intent !== "browsing") score++;
  if (ext.budget) score++;
  if (ext.area) score++;
  if (ext.timeline && !ext.timeline.toLowerCase().includes("just looking")) score++;
  if (ext.urgency === "high") score += 2;
  else if (ext.urgency === "medium") score++;

  if (score >= 4) return "hot";
  if (score >= 2) return "warm";
  return "cold";
}

// ─── Stored lead extractions per session (in-memory cache) ──────
const sessionLeadData = new Map<string, LeadExtraction>();

// ═════════════════════════════════════════════════════════════════
// Chat Router
// ═════════════════════════════════════════════════════════════════

export const chatRouter = router({
  sendMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string().optional(),
        message: z.string().min(1, "Message is required"),
        agentSlug: z.string().default("jane"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      let currentSessionId = input.sessionId;
      let isNewSession = false;

      // ── Free tier check ──────────────────────────────────
      if (!currentSessionId) {
        const monthlyCount = await getMonthlyConversations(input.agentSlug);
        if (monthlyCount >= FREE_TIER_MONTHLY_LIMIT) {
          return {
            sessionId: "",
            response: "This agent's AI assistant has reached the free tier limit for this month. Please contact the agent directly or try again next month.",
            messageCount: 0,
            leadScore: null,
          };
        }
      }

      // ── Session creation ─────────────────────────────────
      if (!currentSessionId) {
        currentSessionId = nanoid(16);
        isNewSession = true;

        // Detect language from first message
        const detectedLang = detectLanguage(input.message);

        if (db) {
          try {
            await db.insert(chatSessions).values({
              sessionId: currentSessionId,
              agentSlug: input.agentSlug,
              detectedLanguage: detectedLang,
            });
          } catch (e) {
            console.warn("[Chat] Failed to create session in DB:", e);
          }
        }

        // Track usage for new conversation
        await incrementUsage(input.agentSlug, "conversationCount");
      }

      // ── Load conversation history ────────────────────────
      let conversationHistory: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];
      let sessionLanguage: "en" | "zh" = detectLanguage(input.message);

      if (db && !isNewSession) {
        try {
          const existingMessages = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.sessionId, currentSessionId))
            .orderBy(asc(chatMessages.createdAt));

          conversationHistory = existingMessages.map((m) => ({
            role: m.role,
            content: m.content,
          }));

          // Get stored language from session
          const session = await db
            .select()
            .from(chatSessions)
            .where(eq(chatSessions.sessionId, currentSessionId))
            .limit(1);
          if (session[0]?.detectedLanguage) {
            sessionLanguage = session[0].detectedLanguage as "en" | "zh";
          }
        } catch (e) {
          console.warn("[Chat] Failed to load history:", e);
        }
      }

      // Re-detect language if user switches
      const currentLang = detectLanguage(input.message);
      if (currentLang !== sessionLanguage) {
        sessionLanguage = currentLang;
        if (db) {
          try {
            await db
              .update(chatSessions)
              .set({ detectedLanguage: sessionLanguage })
              .where(eq(chatSessions.sessionId, currentSessionId));
          } catch {}
        }
      }

      // ── Build messages with tools ────────────────────────
      const systemPrompt = buildAgentSystemPrompt(input.agentSlug, input.message, sessionLanguage);
      const recentHistory = conversationHistory
        .filter((m) => m.role !== "system")
        .slice(-MAX_HISTORY_MESSAGES);

      const messages: Message[] = [
        { role: "system", content: systemPrompt },
        ...recentHistory,
        { role: "user", content: input.message },
      ];

      // Save user message
      if (db) {
        try {
          await db.insert(chatMessages).values({
            sessionId: currentSessionId,
            role: "user",
            content: input.message,
          });
        } catch (e) {
          console.warn("[Chat] Failed to save user message:", e);
        }
      }

      // ── Call LLM with tools ──────────────────────────────
      const agent = AGENT_PROFILES[input.agentSlug] || AGENT_PROFILES.jane;
      let aiResponse = "";
      let leadExtraction: LeadExtraction | null = null;

      try {
        const result = await invokeLLM({
          messages,
          tools: [PROPERTY_SEARCH_TOOL, EXTRACT_LEAD_TOOL],
          toolChoice: "auto",
          maxTokens: 2048,
        });

        const choice = result.choices[0];
        const toolCalls = choice?.message?.tool_calls;

        // Handle tool calls
        if (toolCalls && toolCalls.length > 0) {
          const toolMessages: Message[] = [...messages, {
            role: "assistant" as const,
            content: choice.message.content || "",
            tool_calls: toolCalls,
          } as any];

          for (const tc of toolCalls) {
            try {
              const args = JSON.parse(tc.function.arguments || "{}");

              if (tc.function.name === "search_properties") {
                const listings = await searchProperties(args as PropertySearchParams);
                const formatted = formatListingsForAI(listings);
                toolMessages.push({
                  role: "tool",
                  content: formatted || "No properties found matching those criteria. The property search service may be temporarily unavailable.",
                  tool_call_id: tc.id,
                });
              }

              if (tc.function.name === "extract_lead_info") {
                leadExtraction = args as LeadExtraction;
                // Merge with existing data
                const existing = sessionLeadData.get(currentSessionId) || {};
                const merged = { ...existing, ...leadExtraction };
                sessionLeadData.set(currentSessionId, merged);
                leadExtraction = merged;

                toolMessages.push({
                  role: "tool",
                  content: "Lead information recorded successfully. Continue the conversation naturally.",
                  tool_call_id: tc.id,
                });
              }
            } catch (toolError) {
              console.warn(`[Chat] Tool ${tc.function.name} failed:`, toolError);
              toolMessages.push({
                role: "tool",
                content: "Tool execution failed. Continue the conversation without this data.",
                tool_call_id: tc.id,
              });
            }
          }

          // Second LLM call with tool results
          const followUp = await invokeLLM({
            messages: toolMessages,
            maxTokens: 1024,
          });
          aiResponse = extractTextContent(followUp.choices[0]?.message?.content);
        } else {
          aiResponse = extractTextContent(choice?.message?.content);
        }
      } catch (error) {
        console.error("[Chat] LLM invocation failed:", error);
        aiResponse = sessionLanguage === "zh"
          ? `抱歉，我暂时遇到了技术问题。请稍后重试，或直接联系 ${agent.name}：${agent.email} 或 ${agent.phone}。`
          : `I apologize, I'm experiencing technical difficulties. Please try again, or contact ${agent.name} directly at ${agent.email} or ${agent.phone}.`;
      }

      // ── Save AI response ─────────────────────────────────
      if (db) {
        try {
          await db.insert(chatMessages).values({
            sessionId: currentSessionId,
            role: "assistant",
            content: aiResponse,
          });
        } catch (e) {
          console.warn("[Chat] Failed to save assistant message:", e);
        }
      }

      // ── Hot lead notification ─────────────────────────────
      const currentScore = leadExtraction ? scoreLeadFromExtraction(leadExtraction) : null;
      if (currentScore === "hot") {
        // Fire-and-forget push notification
        notifyOwner({
          title: `🔥 Hot Lead on ${agent.name}'s page`,
          content: `A visitor is actively looking ${leadExtraction?.area ? `in ${leadExtraction.area}` : ""} ${leadExtraction?.budget ? `with budget ${leadExtraction.budget}` : ""}. Timeline: ${leadExtraction?.timeline || "not specified"}.`,
        }).catch(() => {});
      }

      return {
        sessionId: currentSessionId,
        response: aiResponse,
        messageCount: messages.length - 1,
        leadScore: currentScore,
      };
    }),

  getHistory: publicProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { messages: [] };

      try {
        const messages = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.sessionId, input.sessionId))
          .orderBy(asc(chatMessages.createdAt));

        return {
          messages: messages
            .filter((m) => m.role !== "system")
            .map((m) => ({ role: m.role, content: m.content })),
        };
      } catch (e) {
        console.warn("[Chat] Failed to get history:", e);
        return { messages: [] };
      }
    }),
});

// ═════════════════════════════════════════════════════════════════
// Lead Router
// ═════════════════════════════════════════════════════════════════

export const leadRouter = router({
  capture: publicProcedure
    .input(
      z.object({
        sessionId: z.string().min(1),
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email"),
        phone: z.string().optional(),
        agentSlug: z.string().default("jane"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      const agent = AGENT_PROFILES[input.agentSlug] || AGENT_PROFILES.jane;

      // Get conversation history for summary
      let conversationHistory: Array<{ role: string; content: string }> = [];
      if (db) {
        try {
          const messages = await db
            .select()
            .from(chatMessages)
            .where(eq(chatMessages.sessionId, input.sessionId))
            .orderBy(asc(chatMessages.createdAt));
          conversationHistory = messages
            .filter((m) => m.role !== "system")
            .map((m) => ({ role: m.role, content: m.content }));
        } catch (e) {
          console.warn("[Lead] Failed to load conversation:", e);
        }
      }

      // Get extracted lead signals from session cache
      const extraction = sessionLeadData.get(input.sessionId) || {};
      const leadScore = scoreLeadFromExtraction(extraction);

      // Generate AI summary with structured format
      let conversationSummary = "No conversation history available.";
      if (conversationHistory.length > 0) {
        try {
          const summaryPrompt = `Analyze this real estate chat conversation and produce a CRM lead summary.

FORMAT:
- **Intent**: [buying/selling/renting/investing/general inquiry]
- **Area of Interest**: [neighborhoods or cities mentioned]
- **Budget Range**: [if mentioned, otherwise "Not specified"]
- **Timeline**: [if mentioned, otherwise "Not specified"]
- **Lead Score**: ${leadScore.toUpperCase()}
- **Key Notes**: [2-3 sentences summarizing what they're looking for]

Conversation:
${conversationHistory.map((m) => `${m.role === "user" ? "Visitor" : "AI"}: ${m.content}`).join("\n")}`;

          const summaryResult = await invokeLLM({
            messages: [
              { role: "system", content: "You are a CRM assistant for real estate agents. Create structured, actionable lead summaries. Be concise." },
              { role: "user", content: summaryPrompt },
            ],
            maxTokens: 512,
          });

          const summaryContent = summaryResult.choices[0]?.message?.content;
          if (typeof summaryContent === "string") {
            conversationSummary = summaryContent;
          }
        } catch (e) {
          console.warn("[Lead] Failed to generate AI summary:", e);
          conversationSummary = conversationHistory
            .filter((m) => m.role === "user")
            .map((m) => m.content)
            .join(" | ")
            .slice(0, 500);
        }
      }

      // Save lead to DB with extracted data
      if (db) {
        try {
          await db.insert(leads).values({
            name: input.name,
            email: input.email,
            phone: input.phone || null,
            agentSlug: input.agentSlug,
            source: "ai_chat",
            sessionId: input.sessionId,
            conversationSummary,
            leadScore,
            extractedBudget: extraction.budget || null,
            extractedArea: extraction.area || null,
            extractedTimeline: extraction.timeline || null,
            extractedIntent: extraction.intent || null,
          });

          // Update chat session status
          await db
            .update(chatSessions)
            .set({
              status: "converted",
              visitorName: input.name,
              visitorEmail: input.email,
            })
            .where(eq(chatSessions.sessionId, input.sessionId));

          // Track lead count
          await incrementUsage(input.agentSlug, "leadCount");

          console.log(`[Lead] ${leadScore.toUpperCase()} lead captured: ${input.name} (${input.email})`);
        } catch (e) {
          console.warn("[Lead] Failed to save lead to DB:", e);
        }
      }

      // Clean up session cache
      sessionLeadData.delete(input.sessionId);

      // Push notification + email
      try {
        const scoreEmoji = leadScore === "hot" ? "🔥" : leadScore === "warm" ? "🌟" : "📋";

        // Push notification
        notifyOwner({
          title: `${scoreEmoji} New ${leadScore.toUpperCase()} Lead: ${input.name}`,
          content: `${input.email}${extraction.area ? ` | Area: ${extraction.area}` : ""}${extraction.budget ? ` | Budget: ${extraction.budget}` : ""}`,
        }).catch(() => {});

        // Email notification
        const notificationHtml = generateLeadNotificationEmail(
          input.name,
          input.email,
          input.phone || null,
          conversationSummary,
          agent.name
        );
        await sendEmail({
          to: agent.email,
          subject: `${scoreEmoji} New ${leadScore.toUpperCase()} AI Chat Lead: ${input.name}`,
          html: notificationHtml,
        });
      } catch (e) {
        console.warn("[Lead] Failed to send notifications:", e);
      }

      return {
        success: true,
        message: "Thank you! Your information has been sent to the agent.",
        leadScore,
      };
    }),
});

// ─── Helpers ────────────────────────────────────────────────────

function extractTextContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((c): c is { type: "text"; text: string } => typeof c === "object" && c !== null && "type" in c && c.type === "text")
      .map((c) => c.text)
      .join("");
  }
  return "I apologize, I'm having trouble responding right now. Please try again.";
}
