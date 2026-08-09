import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const links = {
    platform: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "AI Insights", href: "#ai-insights" },
      { label: "Marketplace", href: "/marketplace" },
    ],
    company: [
      { label: "About Us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Press", href: "#" },
    ],
    support: [
      { label: "Help Center", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  };

  return (
    <footer className="bg-[#0f291e] text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <a href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="AgriLink Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-2xl font-display font-bold text-white">
                Agri<span className="text-primary">Link</span>
              </span>
            </a>
            <p className="text-gray-400 max-w-sm leading-relaxed">
              Empowering Kenyan farmers with direct market access, fair pricing through AI transparency, and secure transactions.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white mb-6">Platform</h4>
            <ul className="space-y-4">
              {links.platform.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-4">
              {links.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-4">
            <h4 className="font-bold text-white mb-6">Stay Updated</h4>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for the latest market trends and platform updates.
            </p>
            <form className="flex gap-2">
              <Input 
                placeholder="Enter your email" 
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-primary"
              />
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>
            
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-4 h-4 text-primary" />
                <span>hello@agrilink.co.ke</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-4 h-4 text-primary" />
                <span>+254 700 123 456</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} AgriLink. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
