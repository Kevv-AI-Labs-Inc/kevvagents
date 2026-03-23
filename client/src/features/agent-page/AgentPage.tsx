import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import FloatingChat from "@/components/FloatingChat";
import { Loader2 } from "lucide-react";

import { useAgentSEO } from "./AgentSEO";
import AgentHero from "./AgentHero";
import AgentAbout from "./AgentAbout";
import AgentTransactions, { type Transaction } from "./AgentTransactions";
import AgentTestimonials, { type Testimonial } from "./AgentTestimonials";
import AgentContact from "./AgentContact";

// ─── Public Agent Profile type (from tRPC response) ──────────────
export type AgentProfileData = {
  slug: string;
  name: string;
  title?: string | null;
  brokerage?: string | null;
  phone?: string | null;
  email?: string | null;
  licenseState?: string | null;
  serviceAreas?: unknown;
  specialties?: unknown;
  languages?: unknown;
  yearsExperience?: number | null;
  bio?: string | null;
  photoUrl?: string | null;
  colorScheme?: string | null;
  socialLinks?: unknown;
  awards?: unknown;
  transactions?: unknown;
  testimonials?: unknown;
  neighborhoodKnowledge?: unknown;
  templateId?: string | null;
  tier?: string | null;
};

type AgentPageProps = {
  /** Agent profile data — if provided, skips tRPC loading */
  profile?: AgentProfileData | null;
  /** Loading state — for external data loading */
  isLoading?: boolean;
  /** Error state */
  error?: Error | null;
  /** Agent slug — used for chat and contact if profile.slug isn't available */
  slug?: string;
  /** Whether to show the floating chat widget */
  showChat?: boolean;
  /** Whether to show the contact form */
  showContact?: boolean;
  /** Preview mode — used in registration wizard to disable interactive elements */
  preview?: boolean;
};

/**
 * AgentPage — complete agent profile page component.
 *
 * Can be used in two modes:
 * 1. **Standalone** (in route handler): loads data from tRPC via slug
 * 2. **Preview** (in registration wizard): receives profile data as props
 */
export default function AgentPage({
  profile,
  isLoading = false,
  error = null,
  slug,
  showChat = true,
  showContact = true,
  preview = false,
}: AgentPageProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  const agentSlug = profile?.slug || slug || "";
  const agent = profile;

  // Scroll handler for sticky nav
  useEffect(() => {
    if (preview) return;
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [preview]);

  // Dynamic SEO (skip in preview mode)
  useAgentSEO(preview ? null : agent);

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ── Not found ──
  if (!agent || error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-heading font-bold">Agent Not Found</h1>
        <p className="text-muted-foreground">
          This agent page doesn't exist or has been deactivated.
        </p>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          Go Home
        </Button>
      </div>
    );
  }

  // ── Extract typed data from JSONB fields ──
  const serviceAreas = (agent.serviceAreas ?? []) as string[];
  const specialties = (agent.specialties ?? []) as string[];
  const languages = (agent.languages ?? ["English"]) as string[];
  const awards = (agent.awards ?? []) as string[];
  const transactions = (agent.transactions ?? []) as Transaction[];
  const testimonials = (agent.testimonials ?? []) as Testimonial[];
  const socialLinks = (agent.socialLinks ?? {}) as Record<string, string>;
  const firstName = agent.name.split(" ")[0];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground font-sans">
      {/* Left Image Panel */}
      <AgentHero
        name={agent.name}
        firstName={firstName}
        title={agent.title}
        phone={agent.phone}
        email={agent.email}
        photoUrl={agent.photoUrl}
        serviceAreas={serviceAreas}
        socialLinks={socialLinks}
      />

      {/* Right Side - Content */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] bg-background min-h-screen relative z-10">
        {/* Navigation Bar */}
        <header
          className={`sticky top-0 z-50 transition-all duration-300 ${
            isScrolled
              ? "bg-background/95 backdrop-blur-sm shadow-md py-2"
              : "bg-transparent py-4"
          }`}
        >
          <div className="container mx-auto px-6 flex justify-between items-center">
            <a href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="font-heading font-bold text-xl tracking-widest">
                {(agent.brokerage || "KEVV REALTY").toUpperCase()}
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-6 text-xs font-bold tracking-widest uppercase">
              <a href="#about" className="hover:text-primary transition-colors">
                About
              </a>
              {transactions.length > 0 && (
                <a href="#transactions" className="hover:text-primary transition-colors">
                  Transactions
                </a>
              )}
              {testimonials.length > 0 && (
                <a href="#testimonials" className="hover:text-primary transition-colors">
                  Testimonials
                </a>
              )}
              {showContact && (
                <a href="#contact" className="hover:text-primary transition-colors">
                  Contact
                </a>
              )}
            </nav>

            <Button
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground uppercase tracking-widest text-xs font-bold rounded-none px-6"
              onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
            >
              Connect
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-8 py-12 md:px-16 md:py-20 max-w-3xl mx-auto">
          {/* Desktop hero info is rendered inside AgentHero */}

          <Separator className="my-12 bg-border/20" />

          <AgentAbout
            name={agent.name}
            firstName={firstName}
            title={agent.title}
            brokerage={agent.brokerage}
            bio={agent.bio}
            yearsExperience={agent.yearsExperience}
            serviceAreas={serviceAreas}
            specialties={specialties}
            languages={languages}
            awards={awards}
          />

          <AgentTransactions transactions={transactions} />

          <AgentTestimonials testimonials={testimonials} />

          {showContact && <AgentContact agentSlug={agentSlug} firstName={firstName} />}

          {/* Footer */}
          <footer className="text-center text-xs text-muted-foreground/40 uppercase tracking-widest pb-8">
            <p>
              © {new Date().getFullYear()} {agent.brokerage || "Kevv Realty"}. All Rights
              Reserved.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <a href="#" className="hover:text-primary">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-primary">
                Terms of Use
              </a>
              <a href="#" className="hover:text-primary">
                Fair Housing
              </a>
            </div>
            <p className="mt-3 text-muted-foreground/30 normal-case tracking-normal">
              Powered by Kevv AI
            </p>
          </footer>
        </main>
      </div>

      {/* AI Chat Widget */}
      {showChat && !preview && <FloatingChat agentSlug={agentSlug} agentName={firstName} />}
    </div>
  );
}
