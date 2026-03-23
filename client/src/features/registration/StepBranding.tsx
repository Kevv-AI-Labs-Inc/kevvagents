import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { Camera, Check, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import type { RegistrationData } from "./useRegistration";

type Props = {
  data: RegistrationData;
  updateData: (partial: Partial<RegistrationData>) => void;
};

const COLOR_SCHEMES = [
  { id: "gold", label: "Gold", colors: "from-amber-600 to-yellow-500" },
  { id: "navy", label: "Navy", colors: "from-blue-800 to-blue-600" },
  { id: "emerald", label: "Emerald", colors: "from-emerald-700 to-emerald-500" },
  { id: "burgundy", label: "Burgundy", colors: "from-rose-800 to-rose-600" },
  { id: "slate", label: "Slate", colors: "from-slate-700 to-slate-500" },
] as const;

const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/..." },
  { key: "twitter", label: "Twitter / X", placeholder: "https://x.com/..." },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@..." },
];

export default function StepBranding({ data, updateData }: Props) {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done">("idle");
  const slugCheckQuery = trpc.agent.checkSlug.useQuery(
    { slug: data.slug },
    { enabled: data.slug.length >= 2 }
  );

  // Generate slug from name
  const autoSlug = data.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);

  const displaySlug = data.slug || autoSlug;

  const handlePhotoUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB.");
      return;
    }

    setUploadStatus("uploading");

    // For now, use a local data URL preview (R2 upload will be added later)
    const reader = new FileReader();
    reader.onload = (evt) => {
      updateData({ photoUrl: evt.target?.result as string });
      setUploadStatus("done");
    };
    reader.readAsDataURL(file);
  }, [updateData]);

  const updateSocialLink = (platform: string, url: string) => {
    updateData({
      socialLinks: {
        ...data.socialLinks,
        [platform]: url,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold mb-2">Branding & Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize how your agent page looks.</p>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-semibold mb-3">Profile Photo</label>
        <div className="flex items-center gap-6">
          <div className="relative group">
            {data.photoUrl ? (
              <img
                src={data.photoUrl}
                alt="Profile preview"
                className="h-24 w-24 rounded-full object-cover border-2 border-primary"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-border">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploadStatus === "uploading" ? (
                <Loader2 className="h-6 w-6 text-white animate-spin" />
              ) : (
                <Camera className="h-6 w-6 text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Upload a professional headshot</p>
            <p className="text-xs mt-1">JPG, PNG, WebP • Max 5MB</p>
          </div>
        </div>
      </div>

      {/* Color Scheme */}
      <div>
        <label className="block text-sm font-semibold mb-3">Color Scheme</label>
        <div className="flex flex-wrap gap-3">
          {COLOR_SCHEMES.map((scheme) => (
            <button
              key={scheme.id}
              type="button"
              onClick={() => updateData({ colorScheme: scheme.id })}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                data.colorScheme === scheme.id
                  ? "border-primary shadow-md"
                  : "border-transparent hover:border-border"
              }`}
            >
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${scheme.colors}`} />
              <span className="text-xs font-medium">{scheme.label}</span>
              {data.colorScheme === scheme.id && (
                <Check className="absolute top-1 right-1 h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom URL / Slug */}
      <div>
        <label className="block text-sm font-semibold mb-2">Custom URL</label>
        <div className="flex items-center gap-0 bg-muted rounded-md overflow-hidden border border-border">
          <span className="px-3 py-2 text-sm text-muted-foreground bg-muted whitespace-nowrap border-r border-border">
            pages.kevv.ai/agents/
          </span>
          <Input
            value={data.slug}
            onChange={(e) => updateData({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
            placeholder={autoSlug || "your-name"}
            className="border-0 bg-transparent rounded-none"
          />
        </div>
        <div className="mt-1.5 text-xs">
          {data.slug.length >= 2 && (
            slugCheckQuery.isLoading ? (
              <span className="text-muted-foreground">Checking availability...</span>
            ) : slugCheckQuery.data?.available ? (
              <span className="text-green-600">✓ Available</span>
            ) : (
              <span className="text-destructive">✗ Already taken</span>
            )
          )}
          {data.slug.length === 0 && autoSlug && (
            <span className="text-muted-foreground">Will default to: {autoSlug}</span>
          )}
        </div>
      </div>

      {/* Social Links */}
      <div>
        <label className="block text-sm font-semibold mb-3">Social Media Links</label>
        <div className="space-y-3">
          {SOCIAL_PLATFORMS.map((platform) => (
            <div key={platform.key}>
              <label className="block text-xs text-muted-foreground mb-1">{platform.label}</label>
              <Input
                value={data.socialLinks[platform.key] || ""}
                onChange={(e) => updateSocialLink(platform.key, e.target.value)}
                placeholder={platform.placeholder}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
