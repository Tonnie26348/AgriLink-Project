import { Button } from "@/components/ui/button";
import { ArrowRight, Users, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const stats = [
    { icon: Users, value: "10K+", label: "Farmers Connected" },
    { icon: TrendingUp, value: "40%", label: "Income Increase" },
    { icon: Shield, value: "100%", label: "Transparent Pricing" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center py-24 md:py-36 overflow-hidden pb-32">
      {/* Background Gradient */}
      <div className="absolute inset-0 z-0 bg-gradient-hero" />

      {/* Content */}
      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main Content Block */}
          <div className="text-primary-foreground">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 rounded-full px-4 py-2 mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                Empowering Kenyan Farmers
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold leading-tight mb-6 animate-fade-in delay-100 opacity-0">
              Connect Farm to
              <span className="block text-secondary">Market Directly</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 max-w-xl mx-auto animate-fade-in delay-200 opacity-0">
              AgriLink bridges farmers and buyers with transparent pricing, 
              AI-powered insights, and direct trade — eliminating middlemen 
              and maximizing your profits.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in delay-300 opacity-0">
              <Link to="/signup?role=farmer">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  Start Selling
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/marketplace">
                <Button variant="hero-outline" size="xl" className="w-full sm:w-auto">
                  Find Produce
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-fade-in delay-400 opacity-0 max-w-2xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <stat.icon className="w-6 h-6 text-secondary mb-2 mx-auto" />
                  <div className="text-2xl md:text-3xl font-bold text-primary-foreground">
                    {stat.value}
                  </div>
                  <div className="text-sm text-primary-foreground/70">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
