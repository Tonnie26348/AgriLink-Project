import { TrendingUp, Users, Leaf, Globe, Target, CheckCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const impacts = [
  {
    icon: TrendingUp,
    stat: "40%",
    label: "Income Increase",
    description: "Average farmer income increase after joining AgriLink",
  },
  {
    icon: Users,
    stat: "10K+",
    label: "Users Connected",
    description: "Farmers and buyers actively trading on the platform",
  },
  {
    icon: Leaf,
    stat: "30%",
    label: "Less Waste",
    description: "Reduction in post-harvest losses through better market access",
  },
  {
    icon: Globe,
    stat: "47",
    label: "Counties",
    description: "Kenyan counties with active AgriLink users",
  },
];

const objectives = [
  "Improve farmer access to reliable markets",
  "Enhance price transparency and decision-making",
  "Reduce reliance on exploitative middlemen",
  "Minimize post-harvest losses",
  "Promote fair and efficient agricultural trade",
];

const ImpactPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Header />
      <main className="flex-1">
        <section id="impact" className="py-24 md:py-32 bg-primary text-primary-foreground relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,_white_0%,_transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,_white_0%,_transparent_50%)]" />
            <div className="absolute inset-0" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
              <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full text-sm font-semibold mb-6 shadow-sm">
                Our Mission & Impact
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-bold mb-8 tracking-tight leading-tight">
                Transforming
                <span className="text-secondary block mt-2">Agriculture Together</span>
              </h1>
              <p className="text-xl text-primary-foreground/80 leading-relaxed font-light">
                AgriLink is more than a platform — it's a movement to empower farmers, 
                create fair markets, and build sustainable food systems across Africa.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-24">
              {impacts.map((impact, index) => (
                <div
                  key={index}
                  className="text-center p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <impact.icon className="w-8 h-8 text-secondary" />
                  </div>
                  <div className="text-4xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">
                    {impact.stat}
                  </div>
                  <div className="text-lg font-bold text-white/90 mb-2">
                    {impact.label}
                  </div>
                  <div className="text-sm text-white/70 leading-snug">
                    {impact.description}
                  </div>
                </div>
              ))}
            </div>

            {/* Objectives */}
            <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-xl">
              <div className="text-center mb-10">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-3xl font-display font-bold mb-2">
                  Strategic Objectives
                </h3>
                <p className="text-white/70">What we aim to achieve by 2030</p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                {objectives.map((objective, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-secondary" />
                    </div>
                    <p className="text-white/90 text-base font-medium leading-snug">
                      {objective}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ImpactPage;
