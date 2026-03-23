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
    document.title = "Heidi Liu | Licensed Real Estate Broker | Homix Realty – Queens, Long Island NY";
    
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

    setMeta("description", "Heidi Liu is a licensed real estate associate broker at Homix Realty Inc serving Queens, Flushing, Astoria, and Long Island NY. 13+ years experience, 5-star Zillow rated. Contact for a free consultation.");
    setMeta("keywords", "real estate, broker, Queens NY, Flushing, Astoria, Long Island, home buying, home selling, Heidi Liu, Homix Realty");
    setOgMeta("og:title", "Heidi Liu | Licensed Real Estate Broker | Homix Realty");
    setOgMeta("og:description", "13+ years of real estate expertise in Queens & Long Island. Platinum Award winner. Chat with AI assistant for instant answers.");
    setOgMeta("og:type", "profile");

    // JSON-LD Structured Data
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "RealEstateAgent",
      "name": "Heidi Liu",
      "jobTitle": "Licensed Real Estate Associate Broker",
      "worksFor": {
        "@type": "RealEstateAgent",
        "name": "Homix Realty Inc",
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "3720 Prince St Ste 3H",
        "addressLocality": "Flushing",
        "addressRegion": "NY",
        "postalCode": "11354",
        "addressCountry": "US",
      },
      "telephone": "+1-516-988-8668",
      "email": "heidi@homixny.com",
      "areaServed": ["Queens", "Flushing", "Astoria", "Great Neck", "Long Island", "Jericho"],
      "knowsLanguage": ["English", "Chinese"],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5.0",
        "reviewCount": "20",
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
          src="/images/heidi-liu.jpg" 
          alt="Heidi Liu - Homix Real Estate Agent" 
          className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
          style={{ objectPosition: '50% 5%' }}
        />
        
        {/* Mobile Overlay Info (Visible only on small screens) */}
        <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent lg:hidden z-20">
          <h1 className="text-3xl font-heading font-bold text-white uppercase tracking-widest mb-1">Heidi Liu</h1>
          <p className="text-sm text-white/90 uppercase tracking-wider">Licensed Real Estate Associate Broker</p>
        </div>
      </div>

      {/* Right Side - Content (Scrollable) */}
      <div className="w-full lg:w-1/2 lg:ml-[50%] bg-background min-h-screen relative z-10">
        
        {/* Navigation Bar */}
        <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-sm shadow-md py-2' : 'bg-transparent py-4'}`}>
            <div className="container mx-auto px-6 flex justify-between items-center">
            <a href="https://www.homixny.com" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="https://images.squarespace-cdn.com/content/v1/686fe7f9a969e208b5dce2a0/8da12a4c-c1e9-4bb6-aff8-2bba049cea18/Weixin+Image_20250812180157_415.png?format=1500w" alt="Homix Logo" className="h-8 w-auto" />
              <span className="font-heading font-bold text-xl tracking-widest hidden sm:block"></span>
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
              Heidi <br/>Liu
            </h1>
            <h2 className="text-lg text-muted-foreground uppercase tracking-widest mb-2">
              Licensed Real Estate Associate Broker
            </h2>
            
            <div className="space-y-3 text-sm font-light tracking-wide mb-8">
              <div className="flex items-center gap-3 group cursor-pointer">
                <Phone className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <a href="tel:5169888668" className="group-hover:text-primary transition-colors">516.988.8668</a>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer">
                <MapPin className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="group-hover:text-primary transition-colors">3720 Prince St Ste 3H, Flushing, NY 11354</span>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer">
                <Mail className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                <a href="mailto:heidi@homixny.com" className="group-hover:text-primary transition-colors">heidi@homixny.com</a>
              </div>
            </div>

            <div className="flex gap-4">
              <SocialIcon icon={<span className="text-lg">🎵</span>} href="#" title="Douyin" />
              <SocialIcon icon={<span className="text-lg">🎬</span>} href="#" title="TikTok" />
              <SocialIcon icon={<span className="text-lg">❤️</span>} href="#" title="Xiaohongshu" />
              <SocialIcon icon={<span className="text-lg">📹</span>} href="#" title="WeChat Video" />
              <SocialIcon icon={<span className="text-lg">🏠</span>} href="https://www.zillow.com/profile/Heidi-Liu6" title="Zillow" />
              <SocialIcon icon={<Instagram className="h-5 w-5" />} href="#" title="Instagram" />
              <SocialIcon icon={<Youtube className="h-5 w-5" />} href="#" title="YouTube" />
            </div>
          </section>

          <Separator className="my-12 bg-border/20" />

          {/* About Section */}
          <section id="about" className="mb-20 scroll-mt-24">
            <h3 className="text-2xl font-heading font-bold uppercase tracking-widest mb-8 border-l-4 border-primary pl-4">
              About Heidi
            </h3>
            <div className="prose prose-invert prose-lg text-muted-foreground font-light leading-relaxed">
              <p className="mb-6 font-bold text-foreground">
                Heidi – Real Estate Broker, branch manager, Coach, Mentor & Co-Founder of Homix Realty Inc
              </p>
              <p className="mb-6">
                With over 13 years of full-time experience, Heidi is a trusted and accomplished real estate broker known for her energy, market expertise, and exceptional attention to detail. Her success is built on a foundation of integrity, relentless follow-up, and a genuine commitment to helping clients achieve their real estate goals with clarity and confidence.
              </p>
              <p className="mb-6">
                Heidi's background in sales, combined with her in-depth knowledge of the New York real estate market, makes her an invaluable guide for buyers, sellers, and investors alike. Whether you're renting, buying, or selling, she provides clear, objective advice tailored to your needs—always putting your best interests first.
              </p>
              <p className="mb-6">
                In addition to her transactional expertise, Heidi has a keen eye for design and space. She regularly supports property owners with staging, photography, and marketing strategies to showcase listings at their best. As an investor and homeowner herself, she brings practical insight that enhances her professional perspective.
              </p>
              <p>
                After serving as a successful Branch Manager in Great Neck, where she led and mentored a team of agents, Heidi is now proud to launch her own brokerage in Queens. This new venture reflects her entrepreneurial spirit and continued dedication to delivering exceptional service—now with the freedom to shape a brand centered around quality, professionalism, and client success.
              </p>
            </div>
            
            <div className="mt-12 space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-sm text-primary font-bold mb-1">2014 - 2024</p>
                <p className="text-lg font-heading font-bold uppercase tracking-wide">Top Producer</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-sm text-primary font-bold mb-1">2022, 2023, 2025</p>
                <p className="text-lg font-heading font-bold uppercase tracking-wide">Platinum Award</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-sm text-primary font-bold mb-1">2018, 2021, 2024</p>
                <p className="text-lg font-heading font-bold uppercase tracking-wide">Gold Award</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-lg font-heading font-bold uppercase tracking-wide">RealTrends Verified Top Agents & Teams</p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-lg font-heading font-bold uppercase tracking-wide">Real Producers Top 500 Agents Long Island</p>
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
                    <td className="py-3 px-4">43 Carriage Court</td>
                    <td className="py-3 px-4">Jericho, NY 11753</td>
                    <td className="py-3 px-4">2025-09-15</td>
                    <td className="py-3 px-4 font-semibold">$1,060,000</td>
                    <td className="py-3 px-4 text-primary">Buyer & Seller</td>
                  </tr>
                  <tr className="border-b border-border/20 hover:bg-card/30 transition-colors">
                    <td className="py-3 px-4">1170 Carlls Straight Path</td>
                    <td className="py-3 px-4">Dix Hills, NY 11746</td>
                    <td className="py-3 px-4">2025-08-21</td>
                    <td className="py-3 px-4 font-semibold">$1,100,000</td>
                    <td className="py-3 px-4 text-primary">Buyer & Seller</td>
                  </tr>
                  <tr className="border-b border-border/20 hover:bg-card/30 transition-colors">
                    <td className="py-3 px-4">5 Saint James St</td>
                    <td className="py-3 px-4">Centereach, NY 11720</td>
                    <td className="py-3 px-4">2025-08-18</td>
                    <td className="py-3 px-4 font-semibold">$725,000</td>
                    <td className="py-3 px-4 text-primary">Buyer</td>
                  </tr>
                  <tr className="border-b border-border/20 hover:bg-card/30 transition-colors">
                    <td className="py-3 px-4">31-16 21st Street #5D</td>
                    <td className="py-3 px-4">Astoria, NY 11106</td>
                    <td className="py-3 px-4">2025-06-26</td>
                    <td className="py-3 px-4 font-semibold">$675,000</td>
                    <td className="py-3 px-4 text-primary">Buyer</td>
                  </tr>
                  <tr className="border-b border-border/20 hover:bg-card/30 transition-colors">
                    <td className="py-3 px-4">31-16 21st Street #4I</td>
                    <td className="py-3 px-4">Astoria, NY 11106</td>
                    <td className="py-3 px-4">2025-06-06</td>
                    <td className="py-3 px-4 font-semibold">$650,000</td>
                    <td className="py-3 px-4 text-primary">Buyer</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Zillow Reviews Section */}
          <section id="zillow" className="mb-20 scroll-mt-24">
            <h3 className="text-2xl font-heading font-bold uppercase tracking-widest mb-8 border-l-4 border-primary pl-4">
              Client Reviews on Zillow
            </h3>
            <div className="bg-card/50 border border-border/40 p-8 rounded-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-2xl font-bold mb-2">⭐⭐⭐⭐⭐ 5.0 Rating</p>
                  <p className="text-sm text-muted-foreground mb-4">Based on verified client reviews from Zillow</p>
                  <p className="text-sm text-foreground/80 mb-4">
                    Heidi consistently receives top ratings from her clients for professionalism, market knowledge, and exceptional service. Her Zillow profile showcases numerous verified reviews from satisfied buyers and sellers.
                  </p>
                </div>
              </div>
              <a href="https://www.zillow.com/profile/Heidi-Liu6" target="_blank" rel="noopener noreferrer" className="inline-block text-primary hover:text-primary/80 font-bold uppercase text-xs tracking-widest border border-primary px-6 py-2 rounded-none hover:bg-primary/10 transition-all">
                View All Reviews on Zillow →
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
                    Heidi provided exceptional service throughout our entire home buying process. Her knowledge of the Queens market is unmatched, and she made us feel comfortable every step of the way. Highly recommended!
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      JW
                    </div>
                    <div>
                      <p className="font-bold text-sm uppercase tracking-wide">J.W.</p>
                      <p className="text-xs text-muted-foreground">Buyer in Flushing</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card/50 border border-border/40 p-8 rounded-sm relative animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
                <div className="absolute top-6 left-6 text-6xl text-primary/20 font-serif">"</div>
                <div className="relative z-10">
                  <p className="text-lg italic font-serif text-foreground/90 mb-6 leading-relaxed">
                    As a first-time seller, I was nervous about the process. Heidi walked me through everything with patience and expertise. She got us the best price and closed quickly. I couldn't have asked for a better broker!
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      SM
                    </div>
                    <div>
                      <p className="font-bold text-sm uppercase tracking-wide">S.M.</p>
                      <p className="text-xs text-muted-foreground">Seller in Great Neck</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card/50 border border-border/40 p-8 rounded-sm relative animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600">
                <div className="absolute top-6 left-6 text-6xl text-primary/20 font-serif">"</div>
                <div className="relative z-10">
                  <p className="text-lg italic font-serif text-foreground/90 mb-6 leading-relaxed">
                    Heidi's market insights and negotiation skills helped us find the perfect investment property. She's not just a broker—she's a trusted advisor who genuinely cares about her clients' success.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                      RC
                    </div>
                    <div>
                      <p className="font-bold text-sm uppercase tracking-wide">R.C.</p>
                      <p className="text-xs text-muted-foreground">Investor in Astoria</p>
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
              <ContactForm targetMember="heidi" targetMemberName="Heidi" />
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-xs text-muted-foreground/40 uppercase tracking-widest pb-8">
            <p>© 2026 Homix Realty Inc. All Rights Reserved.</p>
            <div className="flex justify-center gap-4 mt-4">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" className="hover:text-primary">Terms of Use</a>
              <a href="#" className="hover:text-primary">Fair Housing</a>
            </div>
          </footer>

        </main>
      </div>

      {/* AI Chat Widget */}
      <FloatingChat agentSlug="heidi" agentName="Heidi" />
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

function ListingCard({ image, price, address, specs, status }: { image: string, price: string, address: string, specs: string, status: string }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden aspect-[4/3] mb-4">
        <div className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 z-10">
          {status}
        </div>
        <img 
          src={image} 
          alt={address} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-500"></div>
      </div>
      <h4 className="text-xl font-heading font-bold mb-1">{price}</h4>
      <p className="text-sm text-muted-foreground mb-1">{address}</p>
      <p className="text-xs text-muted-foreground/70 uppercase tracking-wide">{specs}</p>
    </div>
  );
}
