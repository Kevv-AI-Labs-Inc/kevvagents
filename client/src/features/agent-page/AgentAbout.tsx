type AgentAboutProps = {
  name: string;
  firstName: string;
  title?: string | null;
  brokerage?: string | null;
  bio?: string | null;
  yearsExperience?: number | null;
  serviceAreas: string[];
  specialties: string[];
  languages: string[];
  awards: string[];
};

export default function AgentAbout({
  name,
  firstName,
  title,
  brokerage,
  bio,
  yearsExperience,
  serviceAreas,
  specialties,
  languages,
  awards,
}: AgentAboutProps) {
  return (
    <section id="about" className="mb-20 scroll-mt-24">
      <h3 className="text-2xl font-heading font-bold uppercase tracking-widest mb-8 border-l-4 border-primary pl-4">
        About {firstName}
      </h3>
      <div className="prose prose-invert prose-lg text-muted-foreground font-light leading-relaxed">
        {bio ? (
          bio.split("\n\n").map((paragraph, i) => (
            <p key={i} className="mb-6">
              {paragraph}
            </p>
          ))
        ) : (
          <>
            <p className="mb-6 font-bold text-foreground">
              {name} – {title || "Real Estate Agent"}
              {brokerage ? ` at ${brokerage}` : ""}
            </p>
            <p className="mb-6">
              With {yearsExperience || "several"} years of experience, {firstName} is a trusted
              real estate professional serving{" "}
              {serviceAreas.length > 0 ? serviceAreas.join(", ") : "the local area"}.
              {specialties.length > 0 &&
                ` Specializing in ${specialties.join(", ").toLowerCase()}.`}
            </p>
            {languages.length > 1 && (
              <p className="mb-6">
                {firstName} speaks {languages.join(" and ")}, making it easy to communicate in
                your preferred language.
              </p>
            )}
          </>
        )}
      </div>

      {/* Awards */}
      {awards.length > 0 && (
        <div className="mt-12 space-y-4">
          {awards.map((award, i) => (
            <div key={i} className="border-l-4 border-primary pl-4">
              <p className="text-lg font-heading font-bold uppercase tracking-wide">{award}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
