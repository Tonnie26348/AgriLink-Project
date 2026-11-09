import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, DollarSign, Sprout, TrendingUp, ShieldCheck, Truck } from "lucide-react";

const featureList = [
  {
    icon: Package,
    title: "Direct Market Access",
    description: "Connect directly with buyers and sellers, cutting out intermediaries to maximize profits for farmers and get fresh produce for buyers."
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description: "Access real-time market data and AI-driven price predictions, ensuring fair and equitable pricing for all transactions."
  },
  {
    icon: Sprout,
    title: "Sustainable Practices",
    description: "Support and promote environmentally friendly farming methods through informed trading decisions and community initiatives."
  },
  {
    icon: TrendingUp,
    title: "AI-Powered Insights",
    description: "Get predictive analytics on crop demand and seasonal trends to plan your harvest and sales strategy effectively."
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Transact with confidence using our integrated escrow system and M-Pesa support, protecting both buyers and sellers."
  },
  {
    icon: Truck,
    title: "Logistics Support",
    description: "Coordinate delivery and pickup seamlessly with integrated logistics partners to ensure produce arrives fresh."
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 md:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto mb-20 animate-fade-in">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-semibold mb-6 shadow-sm">
            Why Choose Food Supply Chain
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 tracking-tight">
            Everything You Need to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent"> Trade Smarter</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Food Supply Chain provides all the tools farmers and buyers need for transparent,
            efficient agricultural trade. Explore our comprehensive features designed to maximize your success.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-background/50 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-border/50 text-left hover:shadow-elevated hover:border-primary/20 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <Link to="/signup">
            <Button size="lg" className="h-12 px-8 rounded-full text-base shadow-soft hover:shadow-glow">
              Get Started Today
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;
