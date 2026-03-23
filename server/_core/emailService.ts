import { ENV } from "./env";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends an email using the Manus built-in email service
 * Returns true if successful, false if the service is unavailable
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
    console.warn("[Email] Email service not configured");
    return false;
  }

  try {
    const endpoint = new URL(
      "webdevtoken.v1.WebDevService/SendEmail",
      ENV.forgeApiUrl.endsWith("/") ? ENV.forgeApiUrl : `${ENV.forgeApiUrl}/`
    ).toString();

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1",
      },
      body: JSON.stringify({
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text || payload.html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Email] Failed to send email (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Email] Error sending email:", error);
    return false;
  }
}

/**
 * Generate HTML email template for contact form submission notification
 */
export function generateContactNotificationEmail(
  senderName: string,
  senderEmail: string,
  senderPhone: string | null,
  subject: string,
  message: string,
  targetMemberName: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0 0 10px 0;">New Contact Form Submission</h2>
        <p style="color: #666; margin: 0;">You have received a new message from your website.</p>
      </div>

      <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Sender Information</h3>
        <p style="margin: 8px 0;"><strong>Name:</strong> ${escapeHtml(senderName)}</p>
        <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(senderEmail)}">${escapeHtml(senderEmail)}</a></p>
        ${senderPhone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${escapeHtml(senderPhone)}</p>` : ""}

        <h3 style="color: #333; margin-top: 20px;">Message Details</h3>
        <p style="margin: 8px 0;"><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p style="margin: 8px 0;"><strong>Message:</strong></p>
        <div style="background-color: #f9f9f9; padding: 12px; border-left: 4px solid #d4af37; margin: 10px 0;">
          <p style="margin: 0; white-space: pre-wrap; color: #555;">${escapeHtml(message)}</p>
        </div>
      </div>

      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">This message is for ${escapeHtml(targetMemberName)} from Homix Realty Inc.</p>
      </div>
    </div>
  `;
}

/**
 * Generate HTML email template for sender confirmation
 */
export function generateConfirmationEmail(
  senderName: string,
  targetMemberName: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0 0 10px 0;">Thank You for Contacting Us</h2>
        <p style="color: #666; margin: 0;">We've received your message and will get back to you shortly.</p>
      </div>

      <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <p style="color: #333; margin: 0 0 10px 0;">Hi ${escapeHtml(senderName)},</p>
        <p style="color: #555; line-height: 1.6; margin: 0 0 10px 0;">
          Thank you for reaching out to us! We have received your message and ${escapeHtml(targetMemberName)} will review it shortly and get back to you as soon as possible.
        </p>
        <p style="color: #555; line-height: 1.6; margin: 0;">
          If you have any urgent matters, please feel free to call us directly.
        </p>
      </div>

      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">© 2025 Homix Realty Inc. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Generate HTML email for new AI chat lead notification
 */
export function generateLeadNotificationEmail(
  visitorName: string,
  visitorEmail: string,
  visitorPhone: string | null,
  conversationSummary: string,
  targetMemberName: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #d4af37, #c9a227); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #fff; margin: 0 0 10px 0;">🎯 New AI Chat Lead</h2>
        <p style="color: #fff; margin: 0; opacity: 0.9;">A website visitor engaged with your AI assistant and shared their contact info.</p>
      </div>

      <div style="background-color: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h3 style="color: #333; margin-top: 0;">Lead Information</h3>
        <p style="margin: 8px 0;"><strong>Name:</strong> ${escapeHtml(visitorName)}</p>
        <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${escapeHtml(visitorEmail)}">${escapeHtml(visitorEmail)}</a></p>
        ${visitorPhone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${escapeHtml(visitorPhone)}</p>` : ""}

        <h3 style="color: #333; margin-top: 20px;">AI Conversation Summary</h3>
        <div style="background-color: #f9f9f9; padding: 12px; border-left: 4px solid #d4af37; margin: 10px 0;">
          <p style="margin: 0; white-space: pre-wrap; color: #555;">${escapeHtml(conversationSummary)}</p>
        </div>
      </div>

      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">This lead was captured by Kevv AI for ${escapeHtml(targetMemberName)} | Homix Realty Inc.</p>
      </div>
    </div>
  `;
}

/**
 * Escape HTML special characters to prevent injection
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
