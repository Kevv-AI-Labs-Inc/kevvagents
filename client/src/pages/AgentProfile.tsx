import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { AgentPage } from "@/features/agent-page";

/**
 * Route handler for /agents/:slug
 * Thin wrapper that loads agent data from tRPC and passes to AgentPage component.
 */
export default function AgentProfileRoute() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: agent, isLoading, error } = trpc.agent.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  return (
    <AgentPage
      profile={agent}
      isLoading={isLoading}
      error={error ?? null}
      slug={slug}
    />
  );
}
