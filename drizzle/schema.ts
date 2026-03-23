import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Contact messages table for storing visitor inquiries
 */
export const contactMessages = mysqlTable("contactMessages", {
  id: int("id").autoincrement().primaryKey(),
  senderName: varchar("senderName", { length: 255 }).notNull(),
  senderEmail: varchar("senderEmail", { length: 320 }).notNull(),
  senderPhone: varchar("senderPhone", { length: 20 }),
  targetMember: varchar("targetMember", { length: 64 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = typeof contactMessages.$inferInsert;

/**
 * AI Chat sessions — tracks each visitor chat conversation
 */
export const chatSessions = mysqlTable("chatSessions", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull().unique(),
  agentSlug: varchar("agentSlug", { length: 64 }).notNull(),
  visitorName: varchar("visitorName", { length: 255 }),
  visitorEmail: varchar("visitorEmail", { length: 320 }),
  detectedLanguage: varchar("detectedLanguage", { length: 10 }).default("en"),
  status: mysqlEnum("status", ["active", "closed", "converted"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

/**
 * AI Chat messages — stores each message in a chat session
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 64 }).notNull(),
  role: mysqlEnum("role", ["system", "user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Leads — captured from AI chat conversations
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  agentSlug: varchar("agentSlug", { length: 64 }).notNull(),
  source: varchar("source", { length: 64 }).default("ai_chat").notNull(),
  sessionId: varchar("sessionId", { length: 64 }),
  conversationSummary: text("conversationSummary"),
  leadScore: mysqlEnum("leadScore", ["hot", "warm", "cold"]).default("cold"),
  extractedBudget: varchar("extractedBudget", { length: 255 }),
  extractedArea: varchar("extractedArea", { length: 255 }),
  extractedTimeline: varchar("extractedTimeline", { length: 255 }),
  extractedIntent: varchar("extractedIntent", { length: 64 }),
  status: mysqlEnum("leadStatus", ["new", "contacted", "qualified", "converted", "lost"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Agent usage tracking — for free/pro tier limits
 */
export const agentUsage = mysqlTable("agentUsage", {
  id: int("id").autoincrement().primaryKey(),
  agentSlug: varchar("agentSlug", { length: 64 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(), // "2026-03"
  conversationCount: int("conversationCount").default(0).notNull(),
  leadCount: int("leadCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentUsage = typeof agentUsage.$inferSelect;
export type InsertAgentUsage = typeof agentUsage.$inferInsert;