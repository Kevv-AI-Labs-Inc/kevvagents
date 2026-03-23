import { AgentPage } from "@/features/agent-page";
import type { RegistrationData } from "./useRegistration";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";

type Props = {
  data: RegistrationData;
  isSubmitting: boolean;
  submitError: string | null;
  onSubmit: () => void;
};

export default function StepPreview({ data, isSubmitting, submitError, onSubmit }: Props) {
  // Transform registration data to AgentProfileData for preview
  const previewProfile = {
    slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    name: data.name || "Your Name",
    title: data.title || null,
    brokerage: data.brokerage || null,
    phone: data.phone || null,
    email: data.email || null,
    licenseState: data.licenseState || null,
    serviceAreas: data.serviceAreas,
    specialties: data.specialties,
    languages: data.languages,
    yearsExperience: data.yearsExperience || null,
    bio: data.bio || null,
    photoUrl: data.photoUrl || null,
    colorScheme: data.colorScheme,
    socialLinks: data.socialLinks,
    awards: [],
    transactions: [],
    testimonials: [],
    neighborhoodKnowledge: {},
    templateId: "default",
    tier: "free",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold mb-2">Preview Your Page</h2>
        <p className="text-sm text-muted-foreground">This is how your agent page will look. You can edit everything later from your dashboard.</p>
      </div>

      {/* Preview Container */}
      <div className="border border-border rounded-lg overflow-hidden bg-background shadow-lg">
        <div className="h-[600px] overflow-y-auto">
          <div className="transform scale-[0.65] origin-top-left w-[154%]">
            <AgentPage
              profile={previewProfile}
              showChat={false}
              showContact={false}
              preview={true}
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex flex-col items-center gap-4 pt-4">
        {submitError && (
          <div className="w-full p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
            <p className="text-sm text-destructive font-medium">{submitError}</p>
          </div>
        )}

        <Button
          onClick={onSubmit}
          disabled={isSubmitting}
          size="lg"
          className="w-full max-w-sm text-base font-bold uppercase tracking-wider py-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Creating Your Page...
            </>
          ) : (
            <>
              <ExternalLink className="mr-2 h-5 w-5" />
              Launch My Agent Page
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Free to create. You can always edit your profile later.
        </p>
      </div>
    </div>
  );
}
