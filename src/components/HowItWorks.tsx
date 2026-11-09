import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { UserPlus, MessageCircle, Truck } from "lucide-react";

const steps = [
  {
    step: 1,
    icon: UserPlus,
    title: "Register & List",
    description: "Farmers easily create profiles and list their produce with details like type, quantity, and preferred pricing. Buyers register to browse available goods."
  },
  {
    step: 2,
    icon: MessageCircle,
    title: "Connect & Negotiate",
    description: "AI matches buyers with relevant farmers. Users can communicate directly, negotiate prices, and finalize deals transparently within the platform."
  },
  {
    step: 3,
    icon: Truck,
    title: "Secure Transactions",
    description: "Food Supply Chain facilitates secure payment processing and offers logistics support, ensuring smooth and reliable delivery of produce from farm to market."
  }
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 bg-background relative">
      <div className="container mx-auto px-4 text-center">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto mb-20">
          <span className="inline-block px-4 py-1.5 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-sm font-semibold mb-6 shadow-sm">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
            Simple Steps to
            <span className="text-secondary"> Success</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Whether you're a farmer selling produce or a buyer sourcing fresh goods, 
            Food Supply Chain makes the process seamless.
          </p>
        </div>

        {/* How It Works Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-border/50 -z-10" />

          {steps.map((item, index) => (
            <div key={index} className="relative group">
              <div className="bg-background relative z-10 inline-block p-4 rounded-full mb-6 border-4 border-muted group-hover:border-secondary/30 transition-colors duration-300">
                <div className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-8 h-8" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center font-bold border-2 border-background">
                  {item.step}
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-3xl p-8 border border-border/50 hover:border-secondary/30 hover:shadow-soft transition-all duration-300">
                <h3 className="text-2xl font-display font-bold text-foreground mb-4">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16">
          <Link to="/signup">
            <Button size="lg" className="h-12 px-8 rounded-full text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-soft">
              Start Your Journey
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
