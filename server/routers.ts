import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { contactMessages } from "../drizzle/schema";
import { getDb, getAgentBySlug } from "./db";
import { sendEmail, generateContactNotificationEmail, generateConfirmationEmail } from "./_core/emailService";
import { chatRouter, leadRouter } from "./chatRouter";
import { agentRouter, dashboardRouter } from "./agentRouter";

export const appRouter = router({
  system: systemRouter,
  chat: chatRouter,
  lead: leadRouter,
  agent: agentRouter,
  dashboard: dashboardRouter,

  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          senderName: z.string().min(1, "Name is required"),
          senderEmail: z.string().email("Invalid email"),
          senderPhone: z.string().optional(),
          agentSlug: z.string().min(1, "Agent is required"),
          subject: z.string().min(1, "Subject is required"),
          message: z.string().min(1, "Message is required"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Look up agent profile for notification
          const agent = await getAgentBySlug(input.agentSlug);
          const targetEmail = agent?.email ?? "";
          const targetName = agent?.name ?? input.agentSlug;

          // Save message to database
          const db = await getDb();
          if (db) {
            try {
              await db.insert(contactMessages).values({
                senderName: input.senderName,
                senderEmail: input.senderEmail,
                senderPhone: input.senderPhone || null,
                agentSlug: input.agentSlug,
                subject: input.subject,
                message: input.message,
                isRead: false,
              });
              console.log("[Contact] Message saved to database");
            } catch (dbError) {
              console.warn("[Contact] Failed to save to database (non-critical):", dbError);
            }
          }

          // Send notification to agent
          if (targetEmail) {
            const notificationHtml = generateContactNotificationEmail(
              input.senderName,
              input.senderEmail,
              input.senderPhone || null,
              input.subject,
              input.message,
              targetName
            );

            await sendEmail({
              to: targetEmail,
              subject: `New Contact Form Submission: ${input.subject}`,
              html: notificationHtml,
            });
          }

          // Send confirmation to sender
          const confirmationHtml = generateConfirmationEmail(input.senderName, targetName);
          await sendEmail({
            to: input.senderEmail,
            subject: `We've Received Your Message - ${targetName}`,
            html: confirmationHtml,
          });

          return {
            success: true,
            message: "Your message has been sent successfully!",
          };
        } catch (error) {
          console.error("Failed to submit contact message:", error);
          throw new Error("Failed to submit message. Please try again.");
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
