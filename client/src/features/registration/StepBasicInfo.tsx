import { Input } from "@/components/ui/input";
import type { RegistrationData } from "./useRegistration";

type Props = {
  data: RegistrationData;
  updateData: (partial: Partial<RegistrationData>) => void;
};

export default function StepBasicInfo({ data, updateData }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold mb-2">Basic Information</h2>
        <p className="text-sm text-muted-foreground">Tell us about yourself. This info will appear on your agent page.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Full Name *</label>
          <Input
            value={data.name}
            onChange={(e) => updateData({ name: e.target.value })}
            placeholder="Jane Smith"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Email Address *</label>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => updateData({ email: e.target.value })}
            placeholder="jane@example.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Phone Number</label>
          <Input
            type="tel"
            value={data.phone}
            onChange={(e) => updateData({ phone: e.target.value })}
            placeholder="415.555.0123"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Job Title</label>
          <Input
            value={data.title}
            onChange={(e) => updateData({ title: e.target.value })}
            placeholder="Licensed Real Estate Agent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Brokerage</label>
          <Input
            value={data.brokerage}
            onChange={(e) => updateData({ brokerage: e.target.value })}
            placeholder="Kevv Realty"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">License State</label>
          <Input
            value={data.licenseState}
            onChange={(e) => updateData({ licenseState: e.target.value })}
            placeholder="CA"
            maxLength={2}
          />
        </div>
      </div>
    </div>
  );
}
