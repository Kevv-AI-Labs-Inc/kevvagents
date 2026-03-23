import { pgTable, pgEnum, serial, varchar, text, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";

// ─── Enums ──────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const tierEnum = pgEnum("tier", ["free", "pro", "premium"]);
export const profileStatusEnum = pgEnum("profile_status", ["draft", "active", "suspended"]);
export const chatStatusEnum = pgEnum("chat_status", ["active", "closed", "converted"]);
export const messageRoleEnum = pgEnum("message_role", ["system", "user", "assistant"]);
export const leadScoreEnum = pgEnum("lead_score", ["hot", "warm", "cold"]);
export const leadStatusEnum = pgEnum("lead_status", ["new", "contacted", "qualified", "converted", "lost"]);

// ─── Agent Profiles (core multi-tenant table) ───────────────────────

export const agentProfiles = pgTable("agent_profiles", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull().unique(),

  // Step 1: Basic Info
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  title: varchar("title", { length: 128 }).default("Licensed Real Estate Agent"),
  brokerage: varchar("brokerage", { length: 255 }),
  licenseState: varchar("license_state", { length: 10 }),

  // Step 2: Professional Info — JSONB for flexibility
  serviceAreas: jsonb("service_areas").$type<string[]>().default([]),
  specialties: jsonb("specialties").$type<string[]>().default([]),
  languages: jsonb("languages").$type<string[]>().default(["English"]),
  yearsExperience: integer("years_experience").default(0),
  bio: text("bio"),

  // Step 3: Branding
  photoUrl: varchar("photo_url", { length: 512 }),
  colorScheme: varchar("color_scheme", { length: 20 }).default("gold"),
  socialLinks: jsonb("social_links").$type<Record<string, string>>().default({}),

  // Extended Data (populated in Dashboard)
  awards: jsonb("awards").$type<string[]>().default([]),
  transactions: jsonb("transactions").$type<Array<{
    address: string; city: string; price: string; type: string;
  }>>().default([]),
  testimonials: jsonb("testimonials").$type<Array<{
    name: string; text: string; rating: number;
  }>>().default([]),
  neighborhoodKnowledge: jsonb("neighborhood_knowledge").$type<Record<string, string>>().default({}),

  // Visibility controls — agent chooses what to show publicly
  visibilitySettings: jsonb("visibility_settings").$type<{
    showPhone: boolean;
    showEmail: boolean;
    showTransactions: boolean;
    showAwards: boolean;
    showTestimonials: boolean;
    showAddress: boolean;
  }>().default({
    showPhone: true,
    showEmail: true,
    showTransactions: true,
    showAwards: true,
    showTestimonials: true,
    showAddress: true,
  }),

  // Page template (extensible)
  templateId: varchar("template_id", { length: 32 }).default("classic"),

  // Auth — pre-leave for openhouse OAuth
  oauthProvider: varchar("oauth_provider", { length: 32 }),  // "openhouse" | "google" | null
  oauthId: varchar("oauth_id", { length: 128 }),             // external OAuth user ID
  passwordHash: varchar("password_hash", { length: 255 }),   // temp fallback

  // System
  status: profileStatusEnum("status").default("active"),
  tier: tierEnum("tier").default("free"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AgentProfile = typeof agentProfiles.$inferSelect;
export type InsertAgentProfile = typeof agentProfiles.$inferInsert;

// ─── Users (legacy, kept for auth compatibility) ────────────────────

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("open_id", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("login_method", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Contact Messages ───────────────────────────────────────────────

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  senderName: varchar("sender_name", { length: 255 }).notNull(),
  senderEmail: varchar("sender_email", { length: 320 }).notNull(),
  senderPhone: varchar("sender_phone", { length: 20 }),
  agentSlug: varchar("agent_slug", { length: 64 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

// ─── AI Chat Sessions ───────────────────────────────────────────────

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull().unique(),
  agentSlug: varchar("agent_slug", { length: 64 }).notNull(),
  visitorName: varchar("visitor_name", { length: 255 }),
  visitorEmail: varchar("visitor_email", { length: 320 }),
  detectedLanguage: varchar("detected_language", { length: 10 }).default("en"),
  status: chatStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

// ─── AI Chat Messages ───────────────────────────────────────────────

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 64 }).notNull(),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

// ─── Leads ──────────────────────────────────────────────────────────

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  agentSlug: varchar("agent_slug", { length: 64 }).notNull(),
  source: varchar("source", { length: 64 }).default("ai_chat").notNull(),
  sessionId: varchar("session_id", { length: 64 }),
  conversationSummary: text("conversation_summary"),
  leadScore: leadScoreEnum("lead_score").default("cold"),
  extractedBudget: varchar("extracted_budget", { length: 255 }),
  extractedArea: varchar("extracted_area", { length: 255 }),
  extractedTimeline: varchar("extracted_timeline", { length: 255 }),
  extractedIntent: varchar("extracted_intent", { length: 64 }),
  status: leadStatusEnum("lead_status").default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ─── Agent Usage Tracking ───────────────────────────────────────────

export const agentUsage = pgTable("agent_usage", {
  id: serial("id").primaryKey(),
  agentSlug: varchar("agent_slug", { length: 64 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // "2026-03"
  conversationCount: integer("conversation_count").default(0).notNull(),
  leadCount: integer("lead_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AgentUsage = typeof agentUsage.$inferSelect;
export type InsertAgentUsage = typeof agentUsage.$inferInsert;