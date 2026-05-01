import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Minus, Sparkles, RefreshCw } from "lucide-react";

interface MarketTrend {
  name: string;
  trend: "Rising" | "Stable" | "Falling";
  priceRange: string;
}

interface CropRecommendation {
  name: string;
  reason: string;
  timeToHarvest: string;
}

const MarketInsightsCard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    marketOverview: string;
    topPerformers: MarketTrend[];
    seasonalAdvice: string;
    recommendations?: CropRecommendation[];
  } | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const invokePromise = supabase.functions.invoke("price-insights", {
        body: { mode: "general" },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI Analyst is taking too long. Please try again.")), 30000)
      );

      interface InsightData {
        marketOverview: string;
        topPerformers: MarketTrend[];
        seasonalAdvice: string;
        recommendations?: CropRecommendation[];
      }

      const { data: response, error } = (await Promise.race([invokePromise, timeoutPromise])) as {
        data: { success: boolean; guidance: InsightData; error?: string } | null;
        error: Error | null;
      };

      if (error) {
        throw error;
      }
      
      if (!response || response.success === false) {
        throw new Error(response?.error || "AI Service failure");
      }

      if (response && response.guidance) {
        setData(response.guidance);
      }
    } catch (err) {
      console.error("Failed to fetch market insights:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading && !data) {
    return (
      <Card className="shadow-soft border-border/50 min-h-[200px] flex flex-col items-center justify-center p-6 bg-muted/20">
        <Loader2 className="w-6 h-6 animate-spin text-secondary mb-3" />
        <p className="text-xs text-muted-foreground animate-pulse">Consulting AI Analyst...</p>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-border/50 flex flex-col overflow-hidden max-h-[500px]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-secondary/5">
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            Market Insights
          </CardTitle>
          <CardDescription className="text-[10px]">Powered by AI Analyst</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-muted-foreground hover:text-secondary" 
          onClick={fetchInsights}
          disabled={loading}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="pt-3 pb-3 flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar">
        {data ? (
          <>
            <div className="p-4 bg-secondary/5 rounded-2xl border border-secondary/10 relative overflow-hidden group">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-3 w-3 text-secondary" />
                </div>
                <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Market Flash</p>
              </div>
              <div className="space-y-2">
                {data.marketOverview.split('.').filter(s => s.trim().length > 0).slice(0, 2).map((point, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-1 h-1 rounded-full bg-secondary/30 mt-2 shrink-0" />
                    <p className="text-[11px] text-foreground leading-tight font-medium">{point.trim()}.</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 flex items-center justify-between">
                Live Price Trends
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              </h4>
              <div className="grid gap-2">
                {(data.topPerformers || []).slice(0, 3).map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-2.5 rounded-xl bg-muted/20 border border-border/40 hover:border-secondary/20 transition-all group/item">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        item.trend === "Rising" ? "bg-green-100 text-green-600" :
                        item.trend === "Falling" ? "bg-red-100 text-red-600" :
                        "bg-blue-100 text-blue-600"
                      } group-hover/item:scale-110 transition-transform`}>
                        {item.trend === "Rising" ? <TrendingUp className="w-3.5 h-3.5" /> :
                         item.trend === "Falling" ? <TrendingDown className="w-3.5 h-3.5" /> :
                         <Minus className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-bold text-foreground">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="font-display font-black text-[10px] px-2 h-5 border-secondary/20 bg-secondary/5 text-secondary">{item.priceRange}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {data.recommendations && (
              <div className="space-y-3 pt-3 border-t border-border/40">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 px-1">
                  <Sparkles className="w-3 h-3" />
                  Smart Buys
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {(data.recommendations || []).slice(0, 2).map((rec) => (
                    <div key={rec.name} className="p-3 rounded-xl bg-secondary/5 border border-secondary/10 group hover:bg-secondary/10 transition-all">
                      <p className="text-xs font-black text-foreground mb-1 truncate">{rec.name}</p>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5 text-secondary" />
                        <span className="text-[9px] font-bold text-secondary uppercase">In {rec.timeToHarvest}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-3 border-t border-border/40 bg-muted/10 -mx-3 px-3 -mb-3 pb-3">
              <div className="flex items-start gap-2">
                <Info className="w-3 h-3 text-secondary shrink-0 mt-0.5" />
                <p className="text-[10px] italic text-muted-foreground leading-tight">
                  {data.seasonalAdvice}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center px-4">
            <Sparkles className="w-8 h-8 text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground">Market data currently unavailable.</p>
            <Button variant="link" size="sm" onClick={fetchInsights} className="text-secondary mt-1">Retry</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketInsightsCard;
