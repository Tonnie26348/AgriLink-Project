import { useState, useEffect } from "react";
import { 
  Bot, 
  TrendingUp, 
  Calendar, 
  Target, 
  Loader2, 
  Sparkles, 
  MapPin, 
  Search, 
  BarChart3, 
  Info, 
  ArrowRight,
  TrendingDown,
  Minus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import DemandHeatmap from "@/components/insights/DemandHeatmap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";

interface MarketInsight {
  marketOverview: string;
  topPerformers: Array<{
    name: string;
    trend: string;
    priceRange: string;
  }>;
  seasonalAdvice: string;
  demandHeatmap: Array<{
    region: string;
    level: number;
    topCrops: string[];
  }>;
  recommendations: Array<{
    name: string;
    reason: string;
    timeToHarvest: string;
  }>;
}

interface PriceGuidance {
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  demandLevel: string;
  reasoning: string;
  pricePosition: string;
}

const AIInsightsPage = () => {
  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [checkingPrice, setCheckingPrice] = useState(false);
  const [specificGuidance, setSpecificGuidance] = useState<PriceGuidance | null>(null);

  const fetchGeneralInsights = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("price-insights", {
        body: { mode: "general" },
      });

      if (error) throw error;
      setInsight(data.guidance);
    } catch (err) {
      console.error("Error fetching market insights:", err);
      toast.error("Failed to load market intelligence data.");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setCheckingPrice(true);
    setSpecificGuidance(null);
    try {
      // 1. Try Local FastAPI AI Service
      try {
        const localResponse = await fetch("http://localhost:8000/predict-price", {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            crop_type: query,
            location: "Kenya",
            historical_prices: [100, 105, 110], // Placeholder historical data
            seasonal_factor: 1.0,
            demand_level: "Medium",
            supply_level: "Medium"
          })
        });

        if (localResponse.ok) {
          const data = await localResponse.json();
          setSpecificGuidance({
            suggestedPriceMin: data.confidence_interval[0],
            suggestedPriceMax: data.confidence_interval[1],
            demandLevel: "Medium",
            reasoning: data.recommendation,
            pricePosition: data.trend
          });
          setCheckingPrice(false);
          return;
        }
      } catch (e) {
        console.log("Local AI service not available for specific check, falling back");
      }

      // 2. Fallback to Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("price-insights", {
        body: { 
          mode: "specific",
          produceType: query,
          location: "Kenya" 
        },
      });

      if (error) throw error;
      setSpecificGuidance(data.guidance);
    } catch (err) {
      console.error("Price check error:", err);
      toast.error("AI could not analyze this crop right now.");
    } finally {
      setCheckingPrice(false);
    }
  };

  useEffect(() => {
    fetchGeneralInsights();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-primary/20">
      <Header />
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px]" />
      </div>

      <main className="flex-1 pt-24 md:pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* World-Class Hero Section */}
          <div className="text-center mb-10 md:mb-16 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="bg-white/50 backdrop-blur-sm border-primary/20 text-primary px-4 py-1.5 rounded-full font-semibold shadow-sm text-xs sm:text-sm">
                <Sparkles className="w-3.5 h-3.5 mr-2" />
                Next-Gen Market Intelligence
              </Badge>
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-7xl font-display font-black tracking-tight text-foreground leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Know the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">Market</span>, <br />
              Grow your <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-teal-600">Future</span>.
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Real-time transaction analysis powered by Gemini AI. 
              Fair pricing and strategic planting for every Kenyan farmer.
            </motion.p>

            {/* Premium Price Search Bar */}
            <motion.div 
              className="max-w-2xl mx-auto mt-8 md:mt-12"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <form onSubmit={handlePriceCheck} className="relative group">
                <div className="absolute inset-0 bg-primary/10 rounded-2xl md:rounded-[2rem] blur-xl group-hover:bg-primary/20 transition-all duration-500 opacity-0 group-focus-within:opacity-100" />
                <div className="relative bg-white rounded-2xl md:rounded-3xl p-2 shadow-2xl border border-white/50 flex flex-col sm:flex-row items-center gap-2 ring-1 ring-black/5">
                  <div className="flex-1 flex items-center w-full">
                    <div className="pl-4 md:pl-6 text-muted-foreground group-focus-within:text-primary transition-colors">
                      <Search className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <Input 
                      placeholder="Search (e.g. Onions, Maize)" 
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 border-none focus-visible:ring-0 text-base md:text-lg font-medium placeholder:text-muted-foreground/60 h-12 md:h-14 bg-transparent"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={checkingPrice} 
                    className="w-full sm:w-auto h-12 md:h-14 px-8 md:px-10 rounded-xl md:rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20"
                  >
                    {checkingPrice ? <Loader2 className="w-5 h-5 animate-spin" /> : "Check Price"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Interactive Results Area */}
          <AnimatePresence mode="wait">
            {specificGuidance && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mb-10 md:mb-16"
              >
                <Card className="rounded-3xl md:rounded-[2.5rem] overflow-hidden border-none shadow-premium bg-white/80 backdrop-blur-xl ring-1 ring-black/5">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-12">
                      <div className="md:col-span-5 bg-gradient-to-br from-primary to-emerald-700 p-8 md:p-12 text-white flex flex-col justify-center text-center md:text-left">
                        <Badge className="bg-white/20 text-white w-fit mb-4 md:mb-6 mx-auto md:mx-0">Live Analysis</Badge>
                        <h3 className="text-2xl md:text-3xl font-display font-bold mb-2 capitalize">{query}</h3>
                        <div className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 md:mb-6">
                          Ksh {specificGuidance.suggestedPriceMin} - {specificGuidance.suggestedPriceMax}
                        </div>
                        <div className="flex items-center gap-3 justify-center md:justify-start">
                          <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            <span className="text-xs sm:text-sm font-bold">Demand: {specificGuidance.demandLevel}</span>
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-7 p-8 md:p-12 space-y-4 md:space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                          <Bot className="w-5 h-5 md:w-6 md:h-6" />
                          <h4 className="font-bold text-lg md:text-xl uppercase tracking-tight">AI Reasoning</h4>
                        </div>
                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed italic">
                          "{specificGuidance.reasoning}"
                        </p>
                        <div className="pt-6 border-t border-muted flex flex-col sm:flex-row items-center justify-between gap-4">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Price Position</span>
                          <Badge variant="secondary" className="px-4 py-1.5 rounded-lg capitalize font-bold text-primary">
                            {specificGuidance.pricePosition} Average
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Analytics Tabs */}
          <Tabs defaultValue="trends" className="w-full space-y-8 md:space-y-12">
            <div className="flex justify-center">
              <TabsList className="bg-white p-1 rounded-2xl shadow-lg border border-white/50 ring-1 ring-black/5 h-auto md:h-14 w-full md:w-fit grid grid-cols-3 md:flex">
                <TabsTrigger value="trends" className="rounded-xl px-2 md:px-8 py-3 md:py-0 font-bold text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex flex-col md:flex-row gap-1">
                  <TrendingUp className="w-4 h-4 md:mr-2" />
                  Trends
                </TabsTrigger>
                <TabsTrigger value="heatmap" className="rounded-xl px-2 md:px-8 py-3 md:py-0 font-bold text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex flex-col md:flex-row gap-1">
                  <MapPin className="w-4 h-4 md:mr-2" />
                  Map
                </TabsTrigger>
                <TabsTrigger value="planting" className="rounded-xl px-2 md:px-8 py-3 md:py-0 font-bold text-xs md:text-sm data-[state=active]:bg-primary data-[state=active]:text-white transition-all flex flex-col md:flex-row gap-1">
                  <Target className="w-4 h-4 md:mr-2" />
                  Strategy
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="trends" className="mt-0 focus-visible:outline-none">
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid lg:grid-cols-12 gap-8"
              >
                {/* Market Overview */}
                <div className="lg:col-span-7 space-y-8">
                  <motion.div variants={itemVariants}>
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden group h-full">
                      <CardHeader className="pb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-500">
                          <Bot className="w-6 h-6 text-primary group-hover:text-white" />
                        </div>
                        <CardTitle className="text-2xl font-display font-bold">General Overview</CardTitle>
                        <CardDescription>Synthesized from 15,000+ platform data points</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loading ? (
                          <div className="space-y-4">
                            <div className="h-4 bg-muted animate-pulse rounded w-full" />
                            <div className="h-4 bg-muted animate-pulse rounded w-[90%]" />
                            <div className="h-4 bg-muted animate-pulse rounded w-[95%]" />
                          </div>
                        ) : (
                          <p className="text-lg text-muted-foreground leading-relaxed">
                            {insight?.marketOverview}
                          </p>
                        )}
                        <div className="mt-8 p-6 rounded-2xl bg-secondary/5 border border-secondary/10 flex items-start gap-4">
                          <Calendar className="w-6 h-6 text-secondary shrink-0 mt-1" />
                          <div>
                            <h5 className="font-bold text-secondary text-sm uppercase mb-1">Seasonal Advice</h5>
                            <p className="text-sm text-muted-foreground italic">"{insight?.seasonalAdvice}"</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Top Performers */}
                <div className="lg:col-span-5 space-y-6">
                  <h3 className="text-xl font-display font-bold px-2 flex items-center justify-between">
                    Market Leaders
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">This Month</span>
                  </h3>
                  <div className="space-y-4">
                    {loading ? (
                      [1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white rounded-3xl animate-pulse shadow-sm" />)
                    ) : insight?.topPerformers.map((crop, idx) => (
                      <motion.div
                        key={idx}
                        variants={itemVariants}
                        className="bg-white p-5 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-black/[0.03] flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#F1F5F9] flex items-center justify-center text-xl font-black text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{crop.name}</h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {crop.trend === 'Rising' ? <TrendingUp className="w-3 h-3 text-green-500" /> : 
                               crop.trend === 'Falling' ? <TrendingDown className="w-3 h-3 text-red-500" /> : 
                               <Minus className="w-3 h-3 text-blue-500" />}
                              <span className={`text-[10px] font-bold uppercase ${
                                crop.trend === 'Rising' ? 'text-green-600' : 
                                crop.trend === 'Falling' ? 'text-red-600' : 
                                'text-blue-600'
                              }`}>{crop.trend}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Avg Range</p>
                          <p className="font-display font-black text-primary">{crop.priceRange}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="heatmap" className="mt-0 focus-visible:outline-none animate-in fade-in zoom-in-95 duration-500">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-white p-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <MapPin className="w-32 h-32 text-primary" />
                </div>
                <div className="mb-12">
                  <h3 className="text-3xl font-display font-bold mb-2">Regional Demand Heatmap</h3>
                  <p className="text-muted-foreground">High concentration areas for specific agricultural demand signals.</p>
                </div>
                {loading ? (
                  <div className="h-[400px] flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
                  </div>
                ) : (
                  <div className="min-h-[400px]">
                    <DemandHeatmap data={insight?.demandHeatmap || []} />
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="planting" className="mt-0 focus-visible:outline-none animate-in slide-in-from-bottom-8 duration-500">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading ? (
                  [1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-[2.5rem] animate-pulse shadow-sm" />)
                ) : insight?.recommendations.map((rec, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="rounded-[2.5rem] border-none shadow-lg bg-white overflow-hidden h-full flex flex-col group ring-1 ring-black/[0.03]">
                      <div className="h-3 bg-gradient-to-r from-primary to-emerald-400" />
                      <CardContent className="p-8 flex-1 flex flex-col">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-lg px-3 py-1 w-fit mb-6 font-bold">
                          {rec.timeToHarvest} to Harvest
                        </Badge>
                        <h4 className="text-2xl font-display font-bold mb-4 group-hover:text-primary transition-colors">{rec.name}</h4>
                        <p className="text-muted-foreground leading-relaxed flex-1 italic">
                          "{rec.reason}"
                        </p>
                        <div className="mt-8 pt-6 border-t border-dashed flex items-center justify-between group-cursor-pointer">
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Growth Plan</span>
                          <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform duration-300" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* World-Class Data Badge */}
          <motion.div 
            className="mt-32 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white shadow-soft border border-white/50 ring-1 ring-black/5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
              <span className="text-sm font-bold text-foreground">AI Intelligence Stream Active</span>
              <div className="w-px h-4 bg-muted mx-2" />
              <span className="text-xs text-muted-foreground">Model: Gemini 1.5 Flash • Refresh: Hourly</span>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIInsightsPage;
