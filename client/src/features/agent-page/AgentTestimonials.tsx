export type Testimonial = {
  name: string;
  text: string;
  rating: number;
};

type AgentTestimonialsProps = {
  testimonials: Testimonial[];
};

export default function AgentTestimonials({ testimonials }: AgentTestimonialsProps) {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="mb-20 scroll-mt-24">
      <h3 className="text-2xl font-heading font-bold uppercase tracking-widest mb-8 border-l-4 border-primary pl-4">
        Client Stories
      </h3>

      <div className="space-y-6 overflow-hidden">
        {testimonials.map((testimonial, i) => (
          <div
            key={i}
            className="bg-card/50 border border-border/40 p-8 rounded-sm relative animate-in fade-in slide-in-from-bottom-4 duration-1000"
            style={{ animationDelay: `${i * 300}ms` }}
          >
            <div className="absolute top-6 left-6 text-6xl text-primary/20 font-serif">"</div>
            <div className="relative z-10">
              <p className="text-lg italic font-serif text-foreground/90 mb-6 leading-relaxed">
                {testimonial.text}
              </p>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-bold text-sm uppercase tracking-wide">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {"⭐".repeat(Math.min(testimonial.rating, 5))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
