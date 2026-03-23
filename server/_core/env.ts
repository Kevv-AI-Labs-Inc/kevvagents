export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "dev-secret-change-me",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // LLM — any OpenAI-compatible endpoint (OpenAI, Azure, Gemini, local Ollama, etc.)
  openaiApiUrl: process.env.OPENAI_API_URL ?? "https://api.openai.com",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",

  // Email — Resend (https://resend.com) or any SMTP-compatible service
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "Kevv Realty <noreply@kevvrealty.com>",

  // Google Maps (optional, for future use)
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? "",
};
