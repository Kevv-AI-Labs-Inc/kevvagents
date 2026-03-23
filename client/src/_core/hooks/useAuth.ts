/**
 * Auth hook — placeholder for future agent login implementation.
 * Currently returns unauthenticated state since the agent page is public.
 */
export function useAuth() {
  return {
    user: null as { name?: string; email?: string } | null,
    loading: false,
    error: null as Error | null,
    isAuthenticated: false,
    refresh: () => {},
    logout: async () => {},
  };
}
