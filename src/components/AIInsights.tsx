import { 
  Bot, 
  TrendingUp, 
  ShieldCheck, 
  MessageSquare, 
  Search, 
  ArrowRight, 
  Sparkles,
  Zap,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const aiSystems = [
  {
    icon: ShieldCheck,
    title: "AI Plant Doctor",
    description: "Upload crop photos for instant computer-vision diagnosis of diseases and pests with organic treatment plans.",
    feature: "Vision Intelligence",
    color: "primary"
  },
  {
    icon: MessageSquare,
    title: "AI Smart Assistant",
    description: "Your 24/7 agricultural companion. Ask about best practices, local market tips, or nutritional advice.",
    feature: "Personalized Chat",
    color: "secondary"
  },
  {
    icon: BarChart3,
    title: "Market Analyst",
    description: "Live monitoring of transaction signals across Kenya to provide real-time price ranges and demand heatmaps.",
    feature: "Market Data",
    color: "accent"
  },
  {
    icon: TrendingUp,
    title: "Sales Predictor",
    description: "Sophisticated revenue forecasting for the next 4 months based on historical data and seasonal rain patterns.",
    feature: "Future Insights",
    color: "primary"
  },
];

const AIInsights = () => {
  return (
    <section id="ai-insights" className="py-24 md:py-32 bg-white relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Column - Core Pitch */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                The Food Supply Chain Intelligence Suite
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-black text-foreground tracking-tight leading-[1.1]">
                Four AIs.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">
                  One Mission.
                </span>
              </h2>
            </motion.div>

            <motion.p 
              className="text-lg text-muted-foreground leading-relaxed font-medium"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              We've deployed four specialized Gemini-powered agents to transform how 
              you farm, sell, and buy. From the soil to the shelf, intelligence is built-in.
            </motion.p>

            <motion.div 
              className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-start gap-5 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
              <div>
                <h4 className="font-bold text-foreground mb-1">Human-in-the-loop</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our AIs are advisory tools. You retain 100% control over every 
                  pricing and farming decision. We provide the data, you provide the wisdom.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link to="/ai-insights">
                <Button size="lg" className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 group">
                  Access Intelligence Center
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Right Column - The 4 AI Agents Grid */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
            {aiSystems.map((ai, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group"
              >
                <div className="bg-white rounded-[2.5rem] p-8 h-full shadow-premium border border-white/50 ring-1 ring-black/[0.03] hover:ring-primary/20 transition-all duration-500 flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3
                    ${ai.color === 'primary' ? 'bg-primary/10' : 
                      ai.color === 'secondary' ? 'bg-secondary/10' : 'bg-accent/10'}`}
                  >
                    <ai.icon className={`w-8 h-8
                      ${ai.color === 'primary' ? 'text-primary' : 
                        ai.color === 'secondary' ? 'text-secondary' : 'text-accent'}`} />
                  </div>
                  
                  <Badge variant="outline" className="mb-4 bg-slate-50 text-[10px] font-black uppercase tracking-widest border-slate-200">
                    {ai.feature}
                  </Badge>
                  
                  <h3 className="text-xl font-display font-black text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
                    {ai.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed font-medium mb-6">
                    {ai.description}
                  </p>

                  <div className="mt-auto pt-4 w-full border-t border-slate-50">
                    <span className="text-[10px] font-bold text-primary flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Learn More <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default AIInsights;
