import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRegistration } from "./useRegistration";
import StepBasicInfo from "./StepBasicInfo";
import StepProfessional from "./StepProfessional";
import StepBranding from "./StepBranding";
import StepPreview from "./StepPreview";

const STEPS = [
  { num: 1, label: "Basic Info" },
  { num: 2, label: "Professional" },
  { num: 3, label: "Branding" },
  { num: 4, label: "Preview" },
];

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const reg = useRegistration();

  // After successful registration, redirect
  if (reg.createdSlug) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background text-foreground p-8">
        <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
          <Check className="h-10 w-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-center">Your Page is Live! 🎉</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Your agent page has been created at{" "}
          <code className="text-primary font-mono">/agents/{reg.createdSlug}</code>
        </p>
        <div className="flex gap-4">
          <Button onClick={() => navigate(`/agents/${reg.createdSlug}`)} size="lg" className="font-bold">
            View My Page
          </Button>
          <Button onClick={() => navigate("/dashboard")} variant="outline" size="lg">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-heading font-bold text-xl tracking-widest">
            KEVV AGENT PAGES
          </a>
          <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </a>
        </div>
      </header>

      {/* Progress */}
      <div className="container mx-auto px-6 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-12">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <button
                onClick={() => reg.goToStep(s.num)}
                disabled={s.num > reg.step + 1}
                className={`flex items-center gap-2 ${
                  s.num <= reg.step ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    s.num < reg.step
                      ? "bg-green-500 text-white"
                      : s.num === reg.step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.num < reg.step ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <span
                  className={`hidden sm:block text-sm font-medium ${
                    s.num === reg.step ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`mx-4 h-px flex-1 min-w-[40px] ${
                    s.num < reg.step ? "bg-green-500" : "bg-border"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {reg.step === 1 && <StepBasicInfo data={reg.data} updateData={reg.updateData} />}
          {reg.step === 2 && <StepProfessional data={reg.data} updateData={reg.updateData} />}
          {reg.step === 3 && <StepBranding data={reg.data} updateData={reg.updateData} />}
          {reg.step === 4 && (
            <StepPreview
              data={reg.data}
              isSubmitting={reg.isSubmitting}
              submitError={reg.submitError}
              onSubmit={reg.submit}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        {reg.step < 4 && (
          <div className="flex justify-between mt-8 pt-8 border-t">
            <Button
              variant="ghost"
              onClick={reg.prevStep}
              disabled={reg.step === 1}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={reg.nextStep}
              disabled={!reg.canProceed(reg.step)}
              className="gap-2 font-bold"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
