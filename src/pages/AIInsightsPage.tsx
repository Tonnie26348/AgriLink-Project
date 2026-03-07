import { useState, useEffect } from "react";
import { Bot, TrendingUp, Calendar, Target, Loader2, Sparkles, ShieldCheck, ShoppingBag, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import DemandHeatmap from "@/components/insights/DemandHeatmap";
import AIDiagnosisDialog from "@/components/farmer/AIDiagnosisDialog";
import AIChatDialog from "@/components/marketplace/AIChatDialog";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

const AIInsightsPage = () => {
  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const [diagnosisOpen, setDiagnosisOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("price-insights", {
        body: { mode: "general" },
      });

      if (error) throw error;
      setInsight(data.guidance);
    } catch (err) {
      console.error("Error fetching market insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return (
    <div className="min-h-screen bg-muted/30">
      <Header />
      
      <main className="pt-24 pb-20">
        <section className="relative overflow-hidden mb-12">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 px-4 py-1">
                <Sparkles className="w-3 h-3 mr-2" />
                Gemini 1.5 Powered
              </Badge>
              <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
                AgriLink <span className="text-primary">Intelligence</span> Center
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Empowering Kenyan agriculture with real-time AI analytics, 
                computer vision diagnostics, and smart market forecasting.
              </p>
            </div>

            {/* AI Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-20">
              <Card className="border-primary/20 shadow-soft hover:shadow-elevated transition-all group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors">
                    <ShieldCheck className="w-6 h-6 text-primary group-hover:text-white" />
                  </div>
                  <CardTitle>AI Plant Doctor</CardTitle>
                  <CardDescription>Instant disease & pest diagnosis via camera</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setDiagnosisOpen(true)} className="w-full gap-2">
                    Open Diagnosis <Bot className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-secondary/20 shadow-soft hover:shadow-elevated transition-all group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary transition-colors">
                    <MessageSquare className="w-6 h-6 text-secondary group-hover:text-white" />
                  </div>
                  <CardTitle>AI Assistant</CardTitle>
                  <CardDescription>Ask about market trends, prices, or tips</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setChatOpen(true)} variant="secondary" className="w-full gap-2">
                    Chat with AI <Sparkles className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-accent/20 shadow-soft hover:shadow-elevated transition-all group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent transition-colors">
                    <TrendingUp className="w-6 h-6 text-accent group-hover:text-white" />
                  </div>
                  <CardTitle>Price Forecast</CardTitle>
                  <CardDescription>Predicted market values for next 4 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full gap-2" asChild>
                    <a href="#market-analysis">View Trends <Calendar className="w-4 h-4" /></a>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div id="market-analysis" className="flex flex-col lg:flex-row gap-12 items-start">
              {/* Left Column - Market Overview */}
              <div className="lg:w-1/2 w-full space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ShoppingBag className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-3xl font-display font-bold">Market Intelligence</h2>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center p-12 bg-card rounded-3xl border border-dashed border-primary/20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground animate-pulse">Analyzing live marketplace data...</p>
                  </div>
                ) : insight ? (
                  <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/10 shadow-soft overflow-hidden">
                      <CardContent className="pt-6">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-lg mb-1">Current Overview</h3>
                            <p className="text-muted-foreground leading-relaxed">{insight.marketOverview}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="bg-card rounded-3xl p-6 border border-border/50 shadow-soft">
                      <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-secondary" />
                        Regional Demand Signals
                      </h3>
                      <DemandHeatmap data={insight.demandHeatmap} />
                    </div>

                    {insight.recommendations && (
                      <div className="pt-8">
                        <h3 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
                          <Target className="text-primary w-6 h-6" />
                          Recommended for Planting
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {insight.recommendations.map((rec, i) => (
                            <Card key={i} className="border-primary/20 bg-background hover:border-primary/40 transition-all group overflow-hidden shadow-sm">
                              <CardContent className="pt-6">
                                <Badge variant="outline" className="mb-3 bg-primary/10 border-primary/20 text-primary">
                                  {rec.timeToHarvest} harvest
                                </Badge>
                                <h4 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{rec.name}</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{rec.reason}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Right Column - Top Performers */}
              <div className="lg:w-1/2 w-full space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <h2 className="text-3xl font-display font-bold">Top Performing Crops</h2>
                </div>
                
                <div className="space-y-4">
                  {loading ? (
                     Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-24 w-full bg-muted animate-pulse rounded-2xl" />
                     ))
                  ) : insight?.topPerformers.map((crop, index) => (
                    <div
                      key={index}
                      className="bg-card rounded-2xl p-6 shadow-soft border border-border/50 hover:shadow-elevated transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors">
                            <span className="text-xl group-hover:scale-110 transition-transform">
                              {index === 0 ? "🏆" : "📦"}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{crop.name}</h3>
                            <Badge variant="outline" className={
                              crop.trend === 'Rising' ? 'text-green-600 border-green-200 bg-green-50' :
                              crop.trend === 'Falling' ? 'text-red-600 border-red-200 bg-red-50' :
                              'text-blue-600 border-blue-200 bg-blue-50'
                            }>
                              {crop.trend} Trend
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Value Range</p>
                          <p className="text-xl font-display font-bold text-primary">{crop.priceRange}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Card className="bg-muted/30 border-dashed border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Bot className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <p className="text-xs text-muted-foreground italic leading-relaxed">
                        "AgriLink AI model 1.5-flash uses multi-modal processing to combine 
                        satellite data imagery with local market signals. This data is updated 
                        hourly based on transaction volume and listing changes."
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Dialogs */}
      <AIDiagnosisDialog open={diagnosisOpen} onOpenChange={setDiagnosisOpen} />
      <AIChatDialog open={chatOpen} onOpenChange={setChatOpen} initialMessage="How can I assist you with AgriLink market data today?" />
    </div>
  );
};

export default AIInsightsPage;
