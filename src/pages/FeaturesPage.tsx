import { 
  Store, 
  MapPin, 
  MessageCircle, 
  BarChart3, 
  Shield, 
  Truck 
} from "lucide-react";

const features = [
  {
    icon: Store,
    title: "Produce Listing",
    description: "Easily list your farm produce with photos, quantities, and pricing for buyers to discover.",
  },
  {
    icon: MapPin,
    title: "Location Matching",
    description: "Connect with nearby buyers and farmers using smart location-based matching algorithms.",
  },
  {
    icon: MessageCircle,
    title: "Direct Communication",
    description: "Chat directly with buyers or farmers — no middlemen, no hidden fees.",
  },
  {
    icon: BarChart3,
    title: "Price Comparison",
    description: "View real-time market prices and compare offers to get the best deal for your produce.",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "Every transaction is tracked and recorded for transparency and dispute resolution.",
  },
  {
    icon: Truck,
    title: "Order Tracking",
    description: "Track your orders from confirmation to delivery with real-time status updates.",
  },
];

const FeaturesPage = () => {
  return (
    <section className="py-20 md:py-28 bg-background pt-16"> {/* Added pt-16 */}
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
            Platform Features
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6"> {/* Changed h2 to h1 */}
            Everything You Need to
            <span className="text-primary"> Trade Smarter</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Food Supply Chain provides all the tools farmers and buyers need for transparent, 
            efficient agricultural trade.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-card rounded-2xl p-6 md:p-8 shadow-soft hover:shadow-elevated transition-all duration-300 border border-border/50 hover:border-primary/20"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesPage;
