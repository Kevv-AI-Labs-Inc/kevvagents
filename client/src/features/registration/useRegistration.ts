import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";

export type RegistrationData = {
  // Step 1: Basic
  name: string;
  email: string;
  phone: string;
  title: string;
  brokerage: string;
  licenseState: string;

  // Step 2: Professional
  serviceAreas: string[];
  specialties: string[];
  languages: string[];
  yearsExperience: number;
  bio: string;

  // Step 3: Branding
  photoUrl: string;
  colorScheme: "gold" | "navy" | "emerald" | "burgundy" | "slate";
  socialLinks: Record<string, string>;
  slug: string;
};

const INITIAL_DATA: RegistrationData = {
  name: "",
  email: "",
  phone: "",
  title: "Licensed Real Estate Agent",
  brokerage: "",
  licenseState: "",
  serviceAreas: [],
  specialties: [],
  languages: ["English"],
  yearsExperience: 0,
  bio: "",
  photoUrl: "",
  colorScheme: "gold",
  socialLinks: {},
  slug: "",
};

const SPECIALTY_OPTIONS = [
  "Residential Sales",
  "Luxury Homes",
  "First-time Buyers",
  "Investment Properties",
  "Commercial",
  "New Construction",
  "Property Staging",
  "Relocation",
  "Short Sales & Foreclosures",
  "Land & Lots",
];

const LANGUAGE_OPTIONS = [
  "English", "Spanish", "Mandarin", "Cantonese",
  "Vietnamese", "Korean", "Japanese", "French",
  "Portuguese", "Hindi", "Arabic", "Russian",
];

export { SPECIALTY_OPTIONS, LANGUAGE_OPTIONS };

export function useRegistration() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<RegistrationData>(INITIAL_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);

  const registerMutation = trpc.agent.register.useMutation();

  const updateData = useCallback((partial: Partial<RegistrationData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const nextStep = useCallback(() => {
    setStep((prev) => Math.min(prev + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((s: number) => {
    setStep(Math.max(1, Math.min(s, 4)));
  }, []);

  // Step 1 validation
  const isStep1Valid = data.name.trim().length >= 1 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);

  // Step 2 validation (minimal — at least one service area)
  const isStep2Valid = true; // All professional fields are optional

  // Step 3 validation
  const isStep3Valid = true; // All branding fields are optional

  const canProceed = (s: number) => {
    if (s === 1) return isStep1Valid;
    if (s === 2) return isStep2Valid;
    if (s === 3) return isStep3Valid;
    return true;
  };

  const submit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone || undefined,
        title: data.title || undefined,
        brokerage: data.brokerage || undefined,
        licenseState: data.licenseState || undefined,
        serviceAreas: data.serviceAreas.length > 0 ? data.serviceAreas : undefined,
        specialties: data.specialties.length > 0 ? data.specialties : undefined,
        languages: data.languages.length > 0 ? data.languages : undefined,
        yearsExperience: data.yearsExperience > 0 ? data.yearsExperience : undefined,
        bio: data.bio || undefined,
        photoUrl: data.photoUrl || undefined,
        colorScheme: data.colorScheme,
        socialLinks: Object.keys(data.socialLinks).length > 0 ? data.socialLinks : undefined,
        slug: data.slug || undefined,
      });

      setCreatedSlug(result.slug);

      // Persist agent slug to localStorage for dashboard access
      try {
        localStorage.setItem("kevv-agent-slug", result.slug);
        localStorage.setItem("kevv-agent-email", data.email);
      } catch {}

      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Registration failed. Please try again.";
      setSubmitError(msg);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [data, registerMutation]);

  return {
    step,
    data,
    updateData,
    nextStep,
    prevStep,
    goToStep,
    canProceed,
    submit,
    isSubmitting,
    submitError,
    createdSlug,
  };
}
