import { ENV } from "./env";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Sends an email using the Resend API (https://resend.com).
 * Falls back gracefully if API key is not configured.
 * 
 * To use a different email provider (SendGrid, SES, SMTP), 
 * just replace the fetch call below with your provider's SDK.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!ENV.resendApiKey) {
    console.warn("[Email] Email service not configured (set RESEND_API_KEY)");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ENV.resendApiKey}`,
      },
      body: JSON.stringify({
        from: ENV.emailFrom,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
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

// ─── Email Template Generators ──────────────────────────────────
// These are pure functions that generate HTML — no platform dependency.

const escapeHtml = (str: string): string =>
  str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/**
 * Generate notification email HTML for contact form submissions
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
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">New Contact Form Submission</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>From:</strong> ${escapeHtml(senderName)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(senderEmail)}">${escapeHtml(senderEmail)}</a></p>
        ${senderPhone ? `<p><strong>Phone:</strong> ${escapeHtml(senderPhone)}</p>` : ""}
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
      </div>

      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">This message is for ${escapeHtml(targetMemberName)} from Kevv Realty.</p>
      </div>
    </div>
  `;
}

/**
 * Generate confirmation email HTML for contact form senders
 */
export function generateConfirmationEmail(
  senderName: string,
  targetMemberName: string
): string {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2c3e50;">Thank You for Contacting Us</h2>
      
      <div style="margin: 20px 0;">
        <p>Dear ${escapeHtml(senderName)},</p>
        <p>We've received your message and ${escapeHtml(targetMemberName)} will get back to you shortly.</p>
        <p>Thank you for reaching out!</p>
        <p>Best regards,<br/>${escapeHtml(targetMemberName)}</p>
      </div>

      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">© 2026 Kevv Realty. All rights reserved.</p>
      </div>
    </div>
  `;
}

/**
 * Generate lead notification email for AI chat captures
 */
export function generateLeadNotificationEmail(
  name: string,
  email: string,
  phone: string | null,
  conversationSummary: string,
  targetMemberName: string
): string {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #2c3e50; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">🎯 New AI Chat Lead</h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
      </div>

      <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #856404;">AI Conversation Summary</h3>
        <p style="white-space: pre-wrap;">${escapeHtml(conversationSummary)}</p>
      </div>

      <div style="background-color: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; color: #666; font-size: 12px;">
        <p style="margin: 0;">This lead was captured by Kevv AI for ${escapeHtml(targetMemberName)} | Kevv Realty.</p>
      </div>
    </div>
  `;
}
