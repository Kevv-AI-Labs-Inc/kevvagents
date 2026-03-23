import type { Request } from "express";

// ─── Auth Types ─────────────────────────────────────────────────────

export interface AuthUser {
  id: number;
  slug: string;
  email: string;
  name: string;
  tier: "free" | "pro" | "premium";
}

/**
 * Extract authenticated user from request.
 * 
 * MVP: No auth implemented — returns null.
 * Future: Integrate with openhouse OAuth system:
 *   1. Parse JWT from Authorization header or cookie
 *   2. Verify token against openhouse OAuth server
 *   3. Look up agentProfiles.oauthId to find the agent
 */
export function getAuthUser(_req: Request): AuthUser | null {
  // TODO: Integrate with openhouse OAuth
  // const token = req.headers.authorization?.replace("Bearer ", "");
  // if (!token) return null;
  // const decoded = await verifyOAuthToken(token);  
  // const agent = await getAgentByOAuthId(decoded.sub);
  // return agent ? { id: agent.id, slug: agent.slug, email: agent.email, name: agent.name, tier: agent.tier } : null;
  return null;
}

/**
 * Generate a URL-friendly slug from a name.
 * "Sarah Chen" → "sarah-chen"
 * "陈美华 Sarah" → "sarah" (strips non-ASCII, ensures uniqueness downstream)
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove non-word chars (except spaces and dashes)
    .replace(/\s+/g, "-")     // spaces → dashes
    .replace(/-+/g, "-")      // collapse multiple dashes
    .replace(/^-|-$/g, "")    // trim leading/trailing dashes
    .slice(0, 60)             // max length
    || "agent";               // fallback
}
