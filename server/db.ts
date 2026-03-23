import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { agentProfiles, type InsertAgentProfile, type AgentProfile } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Agent Profile Queries ──────────────────────────────────────────

export async function getAgentBySlug(slug: string): Promise<AgentProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(agentProfiles)
    .where(and(
      eq(agentProfiles.slug, slug),
      eq(agentProfiles.status, "active"),
    ))
    .limit(1);

  return result[0];
}

export async function getAgentByEmail(email: string): Promise<AgentProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(agentProfiles)
    .where(eq(agentProfiles.email, email))
    .limit(1);

  return result[0];
}

export async function createAgentProfile(data: InsertAgentProfile): Promise<AgentProfile> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(agentProfiles).values(data).returning();
  return result[0];
}

export async function updateAgentProfile(
  slug: string,
  data: Partial<Omit<InsertAgentProfile, "id" | "slug" | "email" | "createdAt">>
): Promise<AgentProfile | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.update(agentProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(agentProfiles.slug, slug))
    .returning();

  return result[0];
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return true; // optimistic if no DB

  const result = await db.select({ id: agentProfiles.id })
    .from(agentProfiles)
    .where(eq(agentProfiles.slug, slug))
    .limit(1);

  return result.length === 0;
}
