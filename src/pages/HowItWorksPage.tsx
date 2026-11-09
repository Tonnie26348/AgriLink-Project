import { UserPlus, Package, Handshake, Truck } from "lucide-react";

const farmerSteps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Account",
    description: "Sign up as a farmer and complete your farm profile with location and crops.",
  },
  {
    icon: Package,
    step: "02",
    title: "List Produce",
    description: "Add your available produce with photos, quantity, quality grades, and your asking price.",
  },
  {
    icon: Handshake,
    step: "03",
    title: "Receive Orders",
    description: "Get notified when buyers place orders. Review and accept offers that work for you.",
  },
  {
    icon: Truck,
    step: "04",
    title: "Complete Sale",
    description: "Coordinate delivery or pickup and receive payment directly to your account.",
  },
];

const buyerSteps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Register",
    description: "Create your buyer account and specify your business type and preferred produce.",
  },
  {
    icon: Package,
    step: "02",
    title: "Browse & Compare",
    description: "Search available produce, compare prices across farmers, and check quality ratings.",
  },
  {
    icon: Handshake,
    step: "03",
    title: "Place Orders",
    description: "Order directly from farmers at transparent prices. Negotiate if needed.",
  },
  {
    icon: Truck,
    step: "04",
    title: "Receive Produce",
    description: "Track your order and receive fresh produce delivered or ready for pickup.",
  },
];

const HowItWorksPage = () => {
  return (
    <section className="py-20 md:py-28 bg-muted/50 pt-16"> {/* Added pt-16 */}
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-secondary/20 text-secondary-foreground rounded-full text-sm font-semibold mb-4">
            How It Works
          </span>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6"> {/* Changed h2 to h1 */}
            Simple Steps to
            <span className="text-primary"> Success</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Whether you're a farmer selling produce or a buyer sourcing fresh goods, 
            Food Supply Chain makes the process seamless.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* For Farmers */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-xl">🌾</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground">
                For Farmers
              </h3>
            </div>
            
            <div className="space-y-6">
              {farmerSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-2xl bg-card shadow-soft border border-border/50 hover:shadow-elevated transition-shadow duration-300"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold font-display">
                        {step.step}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">
                      {step.title}
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* For Buyers */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <span className="text-xl">🛒</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground">
                For Buyers
              </h3>
            </div>
            
            <div className="space-y-6">
              {buyerSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 p-4 rounded-2xl bg-card shadow-soft border border-border/50 hover:shadow-elevated transition-shadow duration-300"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                      <span className="text-secondary font-bold font-display">
                        {step.step}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-foreground mb-1">
                      {step.title}
                    </h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksPage;
