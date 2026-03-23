import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { chatSessions, chatMessages, leads } from "../drizzle/schema";
import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";
import { eq, asc } from "drizzle-orm";
import { sendEmail, generateLeadNotificationEmail } from "./_core/emailService";

/**
 * Agent profile type — in production this would come from DB.
 */
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

/**
 * Agent profiles registry — in production, fetched from a DB / CRM.
 * Each agent's profile acts as the RAG knowledge base for their AI assistant.
 */
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

/**
 * Build a rich system prompt with RAG-style context retrieval.
 * Injects agent profile, neighborhood data, transaction history, and market knowledge.
 */
function buildAgentSystemPrompt(agentSlug: string, userMessage?: string): string {
  const agent = AGENT_PROFILES[agentSlug] || AGENT_PROFILES.jane;

  // RAG-style: retrieve relevant neighborhood context based on user's message
  let relevantNeighborhoodContext = "";
  if (userMessage) {
    const msgLower = userMessage.toLowerCase();
    const matchedNeighborhoods = Object.entries(agent.neighborhoodKnowledge)
      .filter(([name]) => msgLower.includes(name.toLowerCase()))
      .map(([name, info]) => `\n### ${name}\n${info}`);
    
    if (matchedNeighborhoods.length > 0) {
      relevantNeighborhoodContext = `\n\n## Relevant Neighborhood Data (use this to answer accurately):\n${matchedNeighborhoods.join("\n")}`;
    }
  }

  // Build transactions context
  const transactionsContext = agent.recentTransactions
    .map((t) => `  - ${t.address}, ${t.city} — ${t.price} (${t.type})`)
    .join("\n");

  return `You are an AI real estate assistant for ${agent.name}, a ${agent.title} at ${agent.brokerage}.

## Your Role
Help website visitors with real estate questions. Your goal is to be genuinely helpful so visitors trust ${agent.name} and want to work with them. You should demonstrate deep local expertise.

## Agent Profile
- **Name**: ${agent.name}
- **Title**: ${agent.title}
- **Brokerage**: ${agent.brokerage}
- **Experience**: ${agent.yearsExperience}+ years full-time
- **Service Areas**: ${agent.serviceAreas.join(", ")}
- **Specialties**: ${agent.specialties.join(", ")}
- **Languages**: ${agent.languages.join(", ")}
- **Contact**: ${agent.phone} | ${agent.email}
- **Awards**: ${agent.awards.join(", ")}

## Recent Transactions (demonstrates market activity)
${transactionsContext}

## Available Neighborhoods Knowledge
Known neighborhoods: ${Object.keys(agent.neighborhoodKnowledge).join(", ")}
${relevantNeighborhoodContext}

## Response Guidelines
1. **Be genuinely helpful** — provide real value, not just sales pitches
2. **Use neighborhood data** when the visitor asks about specific areas — cite median prices, characteristics, and lifestyle
3. **For pricing questions** — share general market data and trends, note that exact pricing needs a personalized CMA (Comparative Market Analysis)
4. **For showings/specific properties** — warmly encourage sharing contact info so ${agent.name} can arrange it personally
5. **Keep responses concise** — 2-3 short paragraphs max, use bullet points for comparisons
6. **Lead qualification** — note what the visitor seems interested in (buyer vs seller, budget range, timeline, area preferences)
7. **Never fabricate** specific active listings, prices, or statistics you weren't given
8. **Match the visitor's language** — respond in whatever language they use
9. **Be warm and professional** — conversational but not pushy
10. **When uncertain** — be honest and offer to connect them with ${agent.name} directly`;
}

export const chatRouter = router({
  /**
   * Send a message in a chat session.
   * Creates a new session if no sessionId is provided.
   * Uses RAG-style context injection for better responses.
   */
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

      // Create new session if needed
      if (!currentSessionId) {
        currentSessionId = nanoid(16);
        if (db) {
          try {
            await db.insert(chatSessions).values({
              sessionId: currentSessionId,
              agentSlug: input.agentSlug,
            });
          } catch (e) {
            console.warn("[Chat] Failed to create session in DB:", e);
          }
        }
      }

      // Get conversation history from DB (or start fresh)
      let conversationHistory: Array<{ role: "system" | "user" | "assistant"; content: string }> = [];

      if (db) {
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
        } catch (e) {
          console.warn("[Chat] Failed to load history:", e);
        }
      }

      // Build system prompt with RAG context from user's current message
      const systemPrompt = buildAgentSystemPrompt(input.agentSlug, input.message);

      // Keep conversation history trimmed to last 20 messages for context window efficiency
      const recentHistory = conversationHistory
        .filter((m) => m.role !== "system")
        .slice(-20);

      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...recentHistory,
        { role: "user", content: input.message },
      ];

      // Save user message to DB
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

      // Call LLM with optimized settings
      const agent = AGENT_PROFILES[input.agentSlug] || AGENT_PROFILES.jane;
      try {
        const result = await invokeLLM({
          messages,
          maxTokens: 1024, // Keep responses concise
        });
        const aiResponse =
          typeof result.choices[0]?.message?.content === "string"
            ? result.choices[0].message.content
            : Array.isArray(result.choices[0]?.message?.content)
              ? result.choices[0].message.content
                  .filter((c): c is { type: "text"; text: string } => typeof c === "object" && "type" in c && c.type === "text")
                  .map((c) => c.text)
                  .join("")
              : "I apologize, I'm having trouble responding right now. Please try again.";

        // Save assistant response to DB
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

        return {
          sessionId: currentSessionId,
          response: aiResponse,
          messageCount: messages.length - 1, // exclude system prompt
        };
      } catch (error) {
        console.error("[Chat] LLM invocation failed:", error);
        const fallbackResponse = `I apologize, I'm experiencing some technical difficulties. Please try again in a moment, or contact ${agent.name} directly at ${agent.email} or ${agent.phone}.`;

        return {
          sessionId: currentSessionId,
          response: fallbackResponse,
          messageCount: messages.length - 1,
        };
      }
    }),

  /**
   * Get chat history for a session
   */
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
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
        };
      } catch (e) {
        console.warn("[Chat] Failed to get history:", e);
        return { messages: [] };
      }
    }),
});

export const leadRouter = router({
  /**
   * Capture a lead from a chat conversation.
   * Generates AI summary of the conversation and notifies the agent.
   */
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
          console.warn("[Lead] Failed to load conversation for summary:", e);
        }
      }

      // Generate AI conversation summary with structured output prompt
      let conversationSummary = "No conversation history available.";
      if (conversationHistory.length > 0) {
        try {
          const summaryPrompt = `Analyze this real estate chat conversation and produce a brief CRM lead summary.

FORMAT:
- **Intent**: [buying/selling/renting/investing/general inquiry]
- **Area of Interest**: [neighborhoods or cities mentioned]
- **Budget Range**: [if mentioned, otherwise "Not specified"]
- **Timeline**: [if mentioned, otherwise "Not specified"]
- **Key Notes**: [1-2 sentences summarizing what they're looking for]

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
          // Fallback: manual summary from conversation
          conversationSummary = conversationHistory
            .filter((m) => m.role === "user")
            .map((m) => m.content)
            .join(" | ")
            .slice(0, 500);
        }
      }

      // Save lead to DB
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

          console.log(`[Lead] New lead captured: ${input.name} (${input.email})`);
        } catch (e) {
          console.warn("[Lead] Failed to save lead to DB:", e);
        }
      }

      // Send notification email to agent
      try {
        const notificationHtml = generateLeadNotificationEmail(
          input.name,
          input.email,
          input.phone || null,
          conversationSummary,
          agent.name
        );

        await sendEmail({
          to: agent.email,
          subject: `🎯 New AI Chat Lead: ${input.name}`,
          html: notificationHtml,
        });
      } catch (e) {
        console.warn("[Lead] Failed to send notification email:", e);
      }

      return {
        success: true,
        message: "Thank you! Your information has been sent to the agent.",
      };
    }),
});
