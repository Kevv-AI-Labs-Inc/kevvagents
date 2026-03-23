import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { chatSessions, chatMessages, leads } from "../drizzle/schema";
import { getDb } from "./db";
import { invokeLLM } from "./_core/llm";
import { nanoid } from "nanoid";
import { eq, asc } from "drizzle-orm";
import { sendEmail, generateLeadNotificationEmail } from "./_core/emailService";

/**
 * Build a system prompt for the agent's AI assistant.
 * This gives the AI context about the specific agent so it can answer
 * real estate questions intelligently.
 */
function buildAgentSystemPrompt(agentSlug: string): string {
  // For now, we have Heidi's profile hardcoded.
  // In the future, this will be fetched from the agent's profile in the DB.
  const agentProfiles: Record<string, {
    name: string;
    title: string;
    brokerage: string;
    phone: string;
    email: string;
    serviceAreas: string[];
    specialties: string[];
    languages: string[];
  }> = {
    heidi: {
      name: "Heidi Liu",
      title: "Licensed Real Estate Associate Broker",
      brokerage: "Homix Realty Inc",
      phone: "516.988.8668",
      email: "heidi@homixny.com",
      serviceAreas: ["Queens", "Flushing", "Astoria", "Great Neck", "Long Island", "Jericho", "Dix Hills"],
      specialties: ["Residential Sales", "Investment Properties", "First-time Buyers", "Luxury Homes", "Property Staging"],
      languages: ["English", "Mandarin Chinese"],
    },
  };

  const agent = agentProfiles[agentSlug] || agentProfiles.heidi;

  return `You are an AI assistant for ${agent.name}, a ${agent.title} at ${agent.brokerage}.

Your role is to help website visitors with real estate questions and connect them with ${agent.name}.

About ${agent.name}:
- Over 13 years of full-time real estate experience
- Service areas: ${agent.serviceAreas.join(", ")}
- Specialties: ${agent.specialties.join(", ")}
- Languages: ${agent.languages.join(", ")}
- Contact: ${agent.phone} | ${agent.email}
- Multiple award winner: Top Producer (2014-2024), Platinum Award, Gold Award
- RealTrends Verified Top Agent

Guidelines:
- Be warm, professional, and helpful
- Answer questions about the local real estate market, neighborhoods, home buying/selling process
- For specific pricing questions, provide general market trends but note that exact pricing requires a personalized consultation
- For scheduling showings or specific property inquiries, encourage the visitor to share their contact info
- Keep responses concise (2-3 paragraphs max)
- If you don't know something specific, say so and offer to connect them with ${agent.name} directly
- Never make up specific property listings or prices
- Respond in the same language the visitor uses (English or Chinese)`;
}

export const chatRouter = router({
  /**
   * Send a message in a chat session.
   * Creates a new session if no sessionId is provided.
   */
  sendMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string().optional(),
        message: z.string().min(1, "Message is required"),
        agentSlug: z.string().default("heidi"),
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

      // Build messages array for LLM
      const systemPrompt = buildAgentSystemPrompt(input.agentSlug);
      const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.filter((m) => m.role !== "system"),
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

      // Call LLM
      try {
        const result = await invokeLLM({ messages });
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
        const fallbackResponse = "I apologize, I'm experiencing some technical difficulties. Please try again in a moment, or contact us directly at heidi@homixny.com or 516.988.8668.";

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
        agentSlug: z.string().default("heidi"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();

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

      // Generate AI conversation summary
      let conversationSummary = "No conversation history available.";
      if (conversationHistory.length > 0) {
        try {
          const summaryPrompt = `Summarize this real estate chat conversation in 2-3 sentences. Focus on what the visitor is looking for (property type, area, budget, timeline). Be concise and actionable for the agent.

Conversation:
${conversationHistory.map((m) => `${m.role === "user" ? "Visitor" : "AI"}: ${m.content}`).join("\n")}`;

          const summaryResult = await invokeLLM({
            messages: [
              { role: "system", content: "You are a CRM assistant that creates brief, actionable lead summaries for real estate agents." },
              { role: "user", content: summaryPrompt },
            ],
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
        const targetEmail = "heidi@homixny.com";
        const notificationHtml = generateLeadNotificationEmail(
          input.name,
          input.email,
          input.phone || null,
          conversationSummary,
          "Heidi"
        );

        await sendEmail({
          to: targetEmail,
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
