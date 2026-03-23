import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Create tRPC context for each request.
 * Auth is optional — public-facing agent pages don't require login.
 * When agent login is added later, authenticate here.
 */
export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // No auth for now — all procedures are public
  return {
    req: opts.req,
    res: opts.res,
    user: null,
  };
}
