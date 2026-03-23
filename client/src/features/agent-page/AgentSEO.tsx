import { useEffect } from "react";

type AgentSEOData = {
  name: string;
  title?: string | null;
  brokerage?: string | null;
  phone?: string | null;
  email?: string | null;
  serviceAreas?: unknown;
  languages?: unknown;
  yearsExperience?: number | null;
};

/**
 * Dynamic SEO hook — sets page title, meta tags, and JSON-LD structured data
 * based on agent profile data.
 */
export function useAgentSEO(agent: AgentSEOData | null | undefined) {
  useEffect(() => {
    if (!agent) return;

    const areas = ((agent.serviceAreas ?? []) as string[]).join(", ");
    const fullTitle = `${agent.name} | ${agent.title || "Real Estate Agent"} | ${agent.brokerage || ""} – ${areas}`;
    document.title = fullTitle;

    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const setOgMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property='${property}']`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta(
      "description",
      `${agent.name} is a ${agent.title || "real estate agent"} at ${agent.brokerage || ""}. ${agent.yearsExperience || 0}+ years experience. Contact for a free consultation.`
    );
    setMeta(
      "keywords",
      `real estate, agent, ${areas}, home buying, home selling, ${agent.name}, ${agent.brokerage || ""}`
    );
    setOgMeta("og:title", fullTitle);
    setOgMeta(
      "og:description",
      `${agent.yearsExperience || 0}+ years of real estate expertise. Chat with AI assistant for instant answers.`
    );
    setOgMeta("og:type", "profile");

    // JSON-LD Structured Data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      name: agent.name,
      jobTitle: agent.title || "Real Estate Agent",
      worksFor: { "@type": "RealEstateAgent", name: agent.brokerage || "" },
      telephone: agent.phone || "",
      email: agent.email || "",
      areaServed: agent.serviceAreas || [],
      knowsLanguage: agent.languages || ["English"],
    };

    let scriptEl = document.querySelector("#agent-jsonld") as HTMLScriptElement;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = "agent-jsonld";
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);

    return () => {
      scriptEl?.remove();
    };
  }, [agent]);
}
