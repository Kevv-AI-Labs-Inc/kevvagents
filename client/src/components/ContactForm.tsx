import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface ContactFormProps {
  agentSlug: string;
  agentName: string;
}

export default function ContactForm({ agentSlug, agentName }: ContactFormProps) {
  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const submitMutation = trpc.contact.submit.useMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      await submitMutation.mutateAsync({
        ...formData,
        agentSlug,
      });

      setStatus("success");
      setFormData({
        senderName: "",
        senderEmail: "",
        senderPhone: "",
        subject: "",
        message: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setStatus("idle");
      }, 5000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to send message. Please try again."
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Messages */}
        {status === "success" && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Message sent successfully!</p>
              <p className="text-sm text-green-800">{agentName} will get back to you soon.</p>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Failed to send message</p>
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="senderName" className="block text-sm font-semibold uppercase tracking-wider mb-2">
              Your Name *
            </label>
            <Input
              id="senderName"
              name="senderName"
              type="text"
              value={formData.senderName}
              onChange={handleChange}
              placeholder="John Doe"
              required
              disabled={status === "loading"}
              className="rounded-none border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="senderEmail" className="block text-sm font-semibold uppercase tracking-wider mb-2">
              Email Address *
            </label>
            <Input
              id="senderEmail"
              name="senderEmail"
              type="email"
              value={formData.senderEmail}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              disabled={status === "loading"}
              className="rounded-none border-gray-300"
            />
          </div>
        </div>

        <div>
          <label htmlFor="senderPhone" className="block text-sm font-semibold uppercase tracking-wider mb-2">
            Phone Number (Optional)
          </label>
          <Input
            id="senderPhone"
            name="senderPhone"
            type="tel"
            value={formData.senderPhone}
            onChange={handleChange}
            placeholder="(555) 123-4567"
            disabled={status === "loading"}
            className="rounded-none border-gray-300"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-semibold uppercase tracking-wider mb-2">
            Subject *
          </label>
          <Input
            id="subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Property inquiry"
            required
            disabled={status === "loading"}
            className="rounded-none border-gray-300"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-semibold uppercase tracking-wider mb-2">
            Message *
          </label>
          <Textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us more about your inquiry..."
            required
            disabled={status === "loading"}
            rows={6}
            className="rounded-none border-gray-300 resize-none"
          />
        </div>

        <Button
          type="submit"
          disabled={status === "loading" || status === "success"}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground uppercase tracking-widest text-sm font-bold rounded-none py-3"
        >
          {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {status === "loading" ? "Sending..." : "Send Message"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          * Required fields. We respect your privacy and will never share your information.
        </p>
      </form>
    </div>
  );
}
