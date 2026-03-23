import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { useEffect, useState } from "react";
import ContactForm from "@/components/ContactForm";
import FloatingChat from "@/components/FloatingChat";

export default function AgentProfile() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // SEO: Set page title and meta description
  useEffect(() => {
    document.title = "Jane Smith | Licensed Real Estate Agent | Kevv Realty – San Francisco, CA";
    
    const setMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name='${name}']`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const setOgMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property='${property}']`) as HTMLMetaElement;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    setMeta("description", "Jane Smith is a licensed real estate agent at Kevv Realty serving San Francisco, Bay Area, and Silicon Valley CA. 10+ years experience, top-rated agent. Contact for a free consultation.");
    setMeta("keywords", "real estate, agent, San Francisco CA, Bay Area, Silicon Valley, home buying, home selling, Jane Smith, Kevv Realty");
    setOgMeta("og:title", "Jane Smith | Licensed Real Estate Agent | Kevv Realty");
    setOgMeta("og:description", "10+ years of real estate expertise in San Francisco & Bay Area. Top Producer award winner. Chat with AI assistant for instant answers.");
    setOgMeta("og:type", "profile");

    // JSON-LD Structured Data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "Jane Smith",
      "jobTitle": "Licensed Real Estate Agent",
      "worksFor": {
        "@type": "RealEstateAgent",
        "name": "Kevv Realty",
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Market Street, Suite 400",
        "addressLocality": "San Francisco",
        "addressRegion": "CA",
        "postalCode": "94105",
        "addressCountry": "US",
      },
      "telephone": "+1-415-555-0123",
      "email": "jane@kevvrealty.com",
      "areaServed": ["San Francisco", "Bay Area", "Silicon Valley", "Palo Alto", "San Mateo"],
      "knowsLanguage": ["English", "Spanish"],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "85",
        "bestRating": "5",
      },
    };

    let scriptEl = document.querySelector('#agent-jsonld') as HTMLScriptElement;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = "agent-jsonld";
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(jsonLd);

    return () => {
      scriptEl?.remove();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground font-sans">
      {/* Left Side - Agent Image (Fixed on Desktop) */}
      <div className="w-full lg:w-1/2 h-[50vh] lg:h-screen lg:fixed lg:left-0 top-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&h=1600&fit=crop&crop=faces" 
          alt="Jane Smith - Kevv Real Estate Agent" 
          className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
          style={{ objectPosition: '50% 20%' }}
        />
        
        {/* Mobile Overlay Info (Visible only on small screens) */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent lg:hidden z-20">
          <h1 className="text-3xl font-heading font-bold text-white uppercase tracking-widest mb-1">Jane Smith</h1>
          <p className="text-sm text-white/90 uppercase tracking-wider">Licensed Real Estate Agent</p>
        </div>
      </div>

      {/* Right Side - Content (Scrollable) */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] bg-background min-h-screen relative z-10">
        
        {/* Navigation Bar */}
        <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-md py-2' : 'bg-transparent py-4'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
            <a href="#" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="font-heading font-bold text-xl tracking-widest">KEVV REALTY</span>
            </a>
            
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold tracking-widest uppercase">
              <a href="#about" className="hover:text-primary transition-colors">About</a>
              <a href="#transactions" className="hover:text-primary transition-colors">Transactions</a>
              <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
              <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            </nav>
            
            <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground uppercase tracking-widest text-xs font-bold rounded-none px-6">
              Connect
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-8 py-12 md:px-16 md:py-20 max-w-3xl mx-auto">
          
          {/* Agent Header Info (Desktop) */}
          <section className="mb-16 hidden lg:block animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-5xl font-heading font-bold uppercase tracking-widest mb-4 leading-tight">
              Jane <br/>Smith
            </h1>
            <h2 className="text-lg text-muted-foreground uppercase tracking-widest mb-2">
              Licensed Real Estate Agent
            </h2>
            
            <div className="space-y-3 text-sm font-light tracking-wide mb-8">
              <div className="flex items-center gap-3 group cursor-pointer">
                <Phone className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <a href="tel:4155550123" className="group-hover:text-primary transition-colors">415.555.0123</a>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer">
                <MapPin className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-primary transition-colors">123 Market Street, Suite 400, San Francisco, CA 94105</span>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer">
                <Mail className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <a href="mailto:jane@kevvrealty.com" className="group-hover:text-primary transition-colors">jane@kevvrealty.com</a>
              </div>
            </div>

            <div className="flex gap-4">
              <SocialIcon icon={<Facebook className="h-5 w-5" />} href="#" title="Facebook" />
              <SocialIcon icon={<Instagram className="h-5 w-5" />} href="#" title="Instagram" />
              <SocialIcon icon={<Linkedin className="h-5 w-5" />} href="#" title="LinkedIn" />
              <SocialIcon icon={<Twitter className="h-5 w-5" />} href="#" title="Twitter" />
              <SocialIcon icon={<Youtube className="h-5 w-5" />} href="#" title="YouTube" />
            </div>
          </section>

          <Separator className="my-12 bg-border/20" />

          {/* About Section */}
          <section id="about" className="mb-20 scroll-mt-24">
            <h3 className="text-2xl font-heading font-bold uppercase tracking-widest mb-8 border-l-4 border-primary pl-4">
              About Jane
            </h3>
            <div className="prose prose-invert prose-lg text-muted-foreground font-light leading-relaxed">
              <p className="mb-6 font-bold text-foreground">
                Jane – Real Estate Agent, Coach & Top Producer at Kevv Realty
              </p>
              <p className="mb-6">
                With over 10 years of full-time experience, Jane is a trusted and accomplished real estate agent known for her energy, market expertise, and exceptional attention to detail. Her success is built on a foundation of integrity, relentless follow-up, and a genuine commitment to helping clients achieve their real estate goals with clarity and confidence.
              </p>
              <p className="mb-6">
                Jane's background in finance, combined with her in-depth knowledge of the San Francisco Bay Area real estate market, makes her an invaluable guide for buyers, sellers, and investors alike. Whether you're renting, buying, or selling, she provides clear, objective advice tailored to your needs—always putting your best interests first.
              </p>
              <p className="mb-6">
                In addition to her transactional expertise, Jane has a keen eye for design and space. She regularly supports property owners with staging, photography, and marketing strategies to showcase listings at their best. As an investor and homeowner herself, she brings practical insight that enhances her professional perspective.
              </p>
              <p>
                Jane is passionate about leveraging technology to provide an unmatched client experience. Through AI-powered tools and data-driven insights, she helps her clients make informed decisions faster and with greater confidence.
              </p>
            </div>
            
            <div className="mt-12 space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-sm text-primary font-bold mb-1">2018 - 2025</p>
                <p className="text-lg font-heading font-bold uppercase tracking-wide">Top Producer</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-sm text-primary font-bold mb-1">2023, 2024</p>
                <p className="text-lg font-heading font-bold uppercase tracking-wide">Platinum Circle Award</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-sm text-primary font-bold mb-1">2020, 2022</p>
                <p className="text-lg font-heading font-bold uppercase tracking-wide">Gold Award</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-lg font-heading font-bold uppercase tracking-wide">Bay Area Top 100 Agents</p>
              </div>
            </div>
          </section>

          {/* Past Transactions Section */}
          <section id="transactions" className="mb-20 scroll-mt-24">
            <h3 className="text-2xl font-heading font-bold uppercase tracking-widest mb-8 border-l-4 border-primary pl-4">
              Past Transactions
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">Address</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">City</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">Closed</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">Price</th>
                    <th className="text-left py-3 px-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">Represented</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/20 hover:bg-card/30 transition-colors">
                    <td className="py-3 px-4">742 Evergreen Terrace</td>
                    <td className="py-3 px-4">San Francisco, CA 94110</td>
                    <td className="py-3 px-4">2025-11-15</td>
                    <td className="py-3 px-4 font-semibold">$1,850,000</td>
                    <td className="py-3 px-4 text-primary">Buyer & Seller</td>
                  </tr>
                  <tr className="border-b border-border/20 hover:bg-card/30 transition-colors">
                    <td className="py-3 px-4">1200 Pacific Heights Blvd</td>
                    <td className="py-3 px-4">San Francisco, CA 94115</td>
                    <td className="py-3 px-4">2025-09-22</td>
                    <td className="py-3 px-4 font-semibold">$2,350,000</td>
                    <td className="py-3 px-4 text-primary">Seller</td>
                  </tr>
                  <tr className="border-b border-border/20 hover:bg-card/30 transition-colors">
                    <td className="py-3 px-4">88 Sunset Drive</td>
                    <td className="py-3 px-4">Palo Alto, CA 94301</td>
                    <td className="py-3 px-4">2025-07-10</td>
                    <td className="py-3 px-4 font-semibold">$3,200,000</td>
                    <td className="py-3 px-4 text-primary">Buyer</td>
                  </tr>
                  <tr className="border-b border-border/20 hover:bg-card/30 transition-colors">
                    <td className="py-3 px-4">456 Marina Blvd #12A</td>
                    <td className="py-3 px-4">San Francisco, CA 94123</td>
                    <td className="py-3 px-4">2025-05-18</td>
                    <td className="py-3 px-4 font-semibold">$1,450,000</td>
                    <td className="py-3 px-4 text-primary">Buyer</td>
                  </tr>
                  <tr className="border-b border-border/20 hover:bg-card/30 transition-colors">
                    <td className="py-3 px-4">2100 Noe Valley Way</td>
                    <td className="py-3 px-4">San Francisco, CA 94114</td>
                    <td className="py-3 px-4">2025-03-25</td>
                    <td className="py-3 px-4 font-semibold">$1,675,000</td>
                    <td className="py-3 px-4 text-primary">Buyer & Seller</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Reviews Section */}
          <section id="reviews" className="mb-20 scroll-mt-24">
            <h3 className="text-2xl font-heading font-bold uppercase tracking-widest mb-8 border-l-4 border-primary pl-4">
              Client Reviews
            </h3>
            <div className="bg-card/50 border border-border/40 p-8 rounded-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-2xl font-bold mb-2">⭐⭐⭐⭐⭐ 4.9 Rating</p>
                  <p className="text-sm text-muted-foreground mb-4">Based on 85 verified client reviews</p>
                  <p className="text-sm text-foreground/80 mb-4">
                    Jane consistently receives top ratings from her clients for professionalism, market knowledge, and exceptional service. Her dedication to going above and beyond has earned her a reputation as one of the Bay Area's most trusted agents.
                  </p>
                </div>
              </div>
              <a href="#contact" className="inline-block text-primary hover:text-primary/80 font-bold uppercase text-xs tracking-widest border border-primary px-6 py-2 rounded-none hover:bg-primary/10 transition-all">
                Work with Jane →
              </a>
            </div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="mb-20 scroll-mt-24">
            <h3 className="text-2xl font-heading font-bold uppercase tracking-widest mb-8 border-l-4 border-primary pl-4">
              Client Stories
            </h3>
            
            <div className="space-y-6 overflow-hidden">
              <div className="bg-card/50 border border-border/40 p-8 rounded-sm relative animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="absolute top-6 left-6 text-6xl text-primary/20 font-serif">"</div>
                <div className="relative z-10">
                  <p className="text-lg italic font-serif text-foreground/90 mb-6 leading-relaxed">
                    Jane made our first home purchase incredibly smooth. She knew every neighborhood inside and out, helped us navigate a competitive market, and negotiated a price we thought was impossible. We couldn't be happier!
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      MR
                    </div>
                    <div>
                      <p className="font-bold text-sm uppercase tracking-wide">M.R.</p>
                      <p className="text-xs text-muted-foreground">First-time Buyer in SOMA</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card/50 border border-border/40 p-8 rounded-sm relative animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <div className="absolute top-6 left-6 text-6xl text-primary/20 font-serif">"</div>
                <div className="relative z-10">
                  <p className="text-lg italic font-serif text-foreground/90 mb-6 leading-relaxed">
                    As a tech executive relocating from New York, I needed someone who understood both the Bay Area market and the urgency of my timeline. Jane delivered beyond expectations — found us the perfect home in Pacific Heights within three weeks.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      TK
                    </div>
                    <div>
                      <p className="font-bold text-sm uppercase tracking-wide">T.K.</p>
                      <p className="text-xs text-muted-foreground">Buyer in Pacific Heights</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card/50 border border-border/40 p-8 rounded-sm relative animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600">
                <div className="absolute top-6 left-6 text-6xl text-primary/20 font-serif">"</div>
                <div className="relative z-10">
                  <p className="text-lg italic font-serif text-foreground/90 mb-6 leading-relaxed">
                    Jane's market insights and staging advice helped us sell our home for 15% over asking price. She's not just an agent — she's a strategic partner who genuinely cares about her clients' success.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      LP
                    </div>
                    <div>
                      <p className="font-bold text-sm uppercase tracking-wide">L.P.</p>
                      <p className="text-xs text-muted-foreground">Seller in Noe Valley</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="mb-20 scroll-mt-24">
            <h3 className="text-2xl font-heading font-bold uppercase tracking-widest mb-8 border-l-4 border-primary pl-4">
              Get in Touch
            </h3>
            
            <div className="bg-card border border-border/40 p-8 rounded-sm">
              <ContactForm targetMember="jane" targetMemberName="Jane" />
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-xs text-muted-foreground/40 uppercase tracking-widest pb-8">
            <p>© 2026 Kevv Realty. All Rights Reserved.</p>
            <div className="flex justify-center gap-4 mt-4">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" className="hover:text-primary">Terms of Use</a>
              <a href="#" className="hover:text-primary">Fair Housing</a>
            </div>
            <p className="mt-3 text-muted-foreground/30 normal-case tracking-normal">Powered by Kevv AI</p>
          </footer>

        </main>
      </div>

      {/* AI Chat Widget */}
      <FloatingChat agentSlug="jane" agentName="Jane" />
    </div>
  );
}

function SocialIcon({ icon, href, title }: { icon: React.ReactNode, href: string, title?: string }) {
  return (
    <a 
      href={href} 
      title={title}
      className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-300"
    >
      {icon}
    </a>
  );
}

function AwardItem({ year, title }: { year: string, title: string }) {
  return (
    <div className="border-l-2 border-primary/30 pl-4 hover:border-primary transition-colors duration-300">
      <p className="text-xs text-primary font-bold mb-1">{year}</p>
      <p className="text-sm font-heading font-medium uppercase tracking-wide">{title}</p>
    </div>
  );
}
