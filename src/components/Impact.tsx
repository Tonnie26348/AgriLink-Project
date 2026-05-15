import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, TrendingUp, DollarSign, Leaf, Loader2 } from "lucide-react";
import { useSystemStats } from "@/hooks/useSystemStats";

const formatNumber = (num: number, suffix = "") => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M+" + suffix;
  if (num >= 1000) return (num / 1000).toFixed(1) + "K+" + suffix;
  return num.toString() + suffix;
};

const Impact = () => {
  const { stats, loading } = useSystemStats();

  const impactMetrics = [
    { 
      icon: Users, 
      value: loading ? "..." : formatNumber(stats.farmerCount), 
      label: "Farmers Connected" 
    },
    { 
      icon: TrendingUp, 
      value: loading ? "..." : stats.buyerCount.toLocaleString(), 
      label: "Active Buyers" 
    },
    { 
      icon: Leaf, 
      value: loading ? "..." : formatNumber(stats.farmerCount), 
      label: "Farmers Empowered" 
    },
    { 
      icon: DollarSign, 
      value: loading ? "..." : formatNumber(stats.totalValue, " KES"), 
      label: "Value Transacted" 
    },
  ];

  return (
    <section id="impact" className="py-20 md:py-28 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_white_0%,_transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,_white_0%,_transparent_50%)]" />
      </div>

      <div className="container mx-auto text-center relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground rounded-full text-sm font-semibold mb-4">
            Our Impact
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
            Transforming
            <span className="text-secondary"> Agriculture</span>
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8">
            AgriLink is more than a platform — it's a movement to empower farmers, 
            create fair markets, and build sustainable food systems.
          </p>
          <Link to="/impact">
            <Button size="lg" variant="secondary">
              Discover Our Impact
            </Button>
          </Link>
        </div>

        {/* Impact Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-primary-foreground">
          {impactMetrics.map((metric, index) => (
            <div key={index} className="text-center">
              {loading ? (
                <Loader2 className="w-10 h-10 animate-spin text-secondary mb-3 mx-auto" />
              ) : (
                <metric.icon className="w-10 h-10 text-secondary mb-3 mx-auto" />
              )}
              <div className="text-3xl md:text-4xl font-display font-bold mb-1 min-h-[44px]">
                {metric.value}
              </div>
              <div className="text-sm text-primary-foreground/70">
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;
