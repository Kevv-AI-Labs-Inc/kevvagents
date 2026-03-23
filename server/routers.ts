import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { contactMessages } from "../drizzle/schema";
import { getDb } from "./db";
import { sendEmail, generateContactNotificationEmail, generateConfirmationEmail } from "./_core/emailService";
import { chatRouter, leadRouter } from "./chatRouter";

export const appRouter = router({
  system: systemRouter,
  chat: chatRouter,
  lead: leadRouter,

  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          senderName: z.string().min(1, "Name is required"),
          senderEmail: z.string().email("Invalid email"),
          senderPhone: z.string().optional(),
          targetMember: z.string().min(1, "Target member is required"),
          subject: z.string().min(1, "Subject is required"),
          message: z.string().min(1, "Message is required"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Try to save message to database (non-blocking if DB unavailable)
          const db = await getDb();
          if (db) {
            try {
              await db.insert(contactMessages).values({
                senderName: input.senderName,
                senderEmail: input.senderEmail,
                senderPhone: input.senderPhone || null,
                targetMember: input.targetMember,
                subject: input.subject,
                message: input.message,
                isRead: 0,
              });
              console.log("[Contact] Message saved to database");
            } catch (dbError) {
              console.warn("[Contact] Failed to save to database (non-critical):", dbError);
            }
          } else {
            console.warn("[Contact] Database not available, skipping DB save");
          }

          // Contact form routes to agent (single-agent profile)
          const targetMemberEmail = "jane@kevvrealty.com";
          const targetMemberName = "Jane";

          // Send notification email to team member
          const notificationHtml = generateContactNotificationEmail(
            input.senderName,
            input.senderEmail,
            input.senderPhone || null,
            input.subject,
            input.message,
            targetMemberName
          );

          const notificationSent = await sendEmail({
            to: targetMemberEmail,
            subject: `New Contact Form Submission: ${input.subject}`,
            html: notificationHtml,
          });

          // Send confirmation email to sender
          const confirmationHtml = generateConfirmationEmail(input.senderName, targetMemberName);
          const confirmationSent = await sendEmail({
            to: input.senderEmail,
            subject: "We've Received Your Message - Kevv Realty",
            html: confirmationHtml,
          });

          console.log(`[Contact] Notification email sent: ${notificationSent}, Confirmation email sent: ${confirmationSent}`);

          if (!notificationSent && !confirmationSent) {
            console.warn("[Contact] Email service not configured or unavailable");
          }

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
