import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { X } from "lucide-react";
import type { RegistrationData } from "./useRegistration";
import { SPECIALTY_OPTIONS, LANGUAGE_OPTIONS } from "./useRegistration";

type Props = {
  data: RegistrationData;
  updateData: (partial: Partial<RegistrationData>) => void;
};

export default function StepProfessional({ data, updateData }: Props) {
  const [areaInput, setAreaInput] = useState("");

  const addServiceArea = () => {
    const trimmed = areaInput.trim();
    if (trimmed && !data.serviceAreas.includes(trimmed)) {
      updateData({ serviceAreas: [...data.serviceAreas, trimmed] });
      setAreaInput("");
    }
  };

  const removeServiceArea = (area: string) => {
    updateData({ serviceAreas: data.serviceAreas.filter((a) => a !== area) });
  };

  const toggleSpecialty = (specialty: string) => {
    if (data.specialties.includes(specialty)) {
      updateData({ specialties: data.specialties.filter((s) => s !== specialty) });
    } else {
      updateData({ specialties: [...data.specialties, specialty] });
    }
  };

  const toggleLanguage = (language: string) => {
    if (data.languages.includes(language)) {
      // Don't allow removing the last language
      if (data.languages.length > 1) {
        updateData({ languages: data.languages.filter((l) => l !== language) });
      }
    } else {
      updateData({ languages: [...data.languages, language] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold mb-2">Professional Details</h2>
        <p className="text-sm text-muted-foreground">Help visitors find you by sharing your expertise and service areas.</p>
      </div>

      {/* Service Areas */}
      <div>
        <label className="block text-sm font-semibold mb-2">Service Areas</label>
        <div className="flex gap-2">
          <Input
            value={areaInput}
            onChange={(e) => setAreaInput(e.target.value)}
            placeholder="e.g. San Francisco"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addServiceArea();
              }
            }}
          />
          <button
            type="button"
            onClick={addServiceArea}
            className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/90 transition-colors"
          >
            Add
          </button>
        </div>
        {data.serviceAreas.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {data.serviceAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
              >
                {area}
                <button
                  onClick={() => removeServiceArea(area)}
                  className="hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Specialties */}
      <div>
        <label className="block text-sm font-semibold mb-2">Specialties</label>
        <div className="flex flex-wrap gap-2">
          {SPECIALTY_OPTIONS.map((specialty) => (
            <button
              key={specialty}
              type="button"
              onClick={() => toggleSpecialty(specialty)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                data.specialties.includes(specialty)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/50"
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-semibold mb-2">Languages</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => toggleLanguage(language)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                data.languages.includes(language)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-primary/50"
              }`}
            >
              {language}
            </button>
          ))}
        </div>
      </div>

      {/* Years Experience */}
      <div className="max-w-xs">
        <label className="block text-sm font-semibold mb-2">Years of Experience</label>
        <Input
          type="number"
          min={0}
          max={100}
          value={data.yearsExperience || ""}
          onChange={(e) => updateData({ yearsExperience: parseInt(e.target.value) || 0 })}
          placeholder="10"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-semibold mb-2">Bio</label>
        <Textarea
          value={data.bio}
          onChange={(e) => updateData({ bio: e.target.value })}
          placeholder="Tell visitors about your background, approach, and what makes you a great agent..."
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {data.bio.length > 0 ? `${data.bio.length} characters` : "Optional — we'll auto-generate a bio if left blank"}
        </p>
      </div>
    </div>
  );
}
