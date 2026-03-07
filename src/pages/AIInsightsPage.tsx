import { useState, useEffect } from "react";
import { Bot, TrendingUp, Calendar, Target, Users, DollarSign, Loader2, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import DemandHeatmap from "@/components/insights/DemandHeatmap";

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
}

const AIInsightsPage = () => {
  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-muted/30 pt-16">
      <section className="py-20 md:py-28 bg-background relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            {/* Left Column - Content */}
            <div className="lg:w-1/2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
                <Bot className="w-4 h-4" />
                AI-Powered Market Intelligence
              </span>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                Real-Time <span className="text-primary">Market Analyst</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our Gemini-powered AI analyzes live platform transactions and regional data 
                to give you a competitive edge. Fair pricing starts with transparency.
              </p>

              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-muted/50 rounded-2xl border border-dashed border-primary/20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground animate-pulse">Consulting Gemini AI for latest trends...</p>
                </div>
              ) : insight ? (
                <div className="space-y-6">
                  <Card className="bg-primary/5 border-primary/10 shadow-soft">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1">Market Overview</h3>
                          <p className="text-muted-foreground leading-relaxed">{insight.marketOverview}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-secondary/5 border-secondary/10 shadow-soft">
                    <CardContent className="pt-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg mb-1">Seasonal Advice</h3>
                          <p className="text-muted-foreground leading-relaxed">{insight.seasonalAdvice}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <DemandHeatmap data={insight.demandHeatmap} />
                </div>
              ) : null}

              <Button onClick={fetchInsights} disabled={loading} size="lg" className="mt-8 shadow-soft gap-2">
                <TrendingUp className="w-4 h-4" />
                Refresh Analysis
              </Button>
            </div>

            {/* Right Column - Top Performers */}
            <div className="lg:w-1/2 w-full">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
                <TrendingUp className="text-primary w-6 h-6" />
                Top Performing Crops
              </h2>
              
              <div className="space-y-4">
                {loading ? (
                   Array.from({ length: 4 }).map((_, i) => (
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
                        <p className="text-xs text-muted-foreground uppercase font-bold">Suggested Range</p>
                        <p className="text-lg font-bold text-primary">{crop.priceRange}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-muted/30 rounded-2xl border border-border/50">
                <div className="flex items-start gap-3">
                  <Bot className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <p className="text-sm text-muted-foreground italic">
                    "This analysis is powered by Gemini 1.5 Flash. It considers seasonal cycles, 
                    current platform listings, and regional demand signals. Use these insights 
                    to optimize your harvests and pricing strategies."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AIInsightsPage;
