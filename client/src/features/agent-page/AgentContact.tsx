import ContactForm from "@/components/ContactForm";

type AgentContactProps = {
  agentSlug: string;
  firstName: string;
};

export default function AgentContact({ agentSlug, firstName }: AgentContactProps) {
  return (
    <section id="contact" className="mb-20 scroll-mt-24">
      <h3 className="text-2xl font-heading font-bold uppercase tracking-widest mb-8 border-l-4 border-primary pl-4">
        Get in Touch
      </h3>

      <div className="bg-card border border-border/40 p-8 rounded-sm">
        <ContactForm agentSlug={agentSlug} agentName={firstName} />
      </div>
    </section>
  );
}
