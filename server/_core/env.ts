export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // ─── LLM Configuration ─────────────────────────────────────────
  // Azure OpenAI (takes priority if AZURE_OPENAI_ENDPOINT is set)
  azureOpenaiEndpoint: process.env.AZURE_OPENAI_ENDPOINT ?? "",   // e.g. https://your-resource.openai.azure.com
  azureOpenaiApiKey: process.env.AZURE_OPENAI_API_KEY ?? "",
  azureOpenaiDeployment: process.env.AZURE_OPENAI_DEPLOYMENT ?? "", // e.g. gpt-4o-mini
  azureOpenaiApiVersion: process.env.AZURE_OPENAI_API_VERSION ?? "2024-12-01-preview",

  // Standard OpenAI (fallback if Azure not configured)
  openaiApiUrl: process.env.OPENAI_API_URL ?? "https://api.openai.com",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",

  // Helper: is Azure configured?
  get useAzure(): boolean {
    return !!this.azureOpenaiEndpoint && !!this.azureOpenaiApiKey;
  },

  // Email — Resend (https://resend.com) or any SMTP-compatible service
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "Kevv Realty <noreply@kevvrealty.com>",

  // Notification — agent's email for lead alerts
  agentNotificationEmail: process.env.AGENT_NOTIFICATION_EMAIL ?? "",

  // Google Maps (optional, for future use)
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
};
