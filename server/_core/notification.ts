import { sendEmail } from "./emailService";
import { ENV } from "./env";

export type NotificationPayload = {
  title: string;
  content: string;
};

/**
 * Send a notification to the project owner / agent.
 * Uses email as the notification channel.
 * 
 * In the future, can be extended to support:
 * - Web Push (via web-push npm package)
 * - SMS (via Twilio)
 * - Slack webhook
 * - Firebase Cloud Messaging
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  // For now, notifications go via email
  // In production, this would look up the agent's notification preferences
  try {
    return await sendEmail({
      to: ENV.emailFrom, // Send to the configured email
      subject: payload.title,
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">${payload.title}</h2>
          <p style="font-size: 16px; line-height: 1.6;">${payload.content}</p>
          <p style="color: #999; font-size: 12px;">— Kevv AI Notification</p>
        </div>
      `,
    });
  } catch (error) {
    console.warn("[Notification] Failed to send notification:", error);
    return false;
  }
}
