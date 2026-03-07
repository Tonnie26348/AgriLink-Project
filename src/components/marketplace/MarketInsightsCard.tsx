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
      const { data: response, error } = await supabase.functions.invoke("price-insights", {
        body: { mode: "general" },
      });

      if (error) throw error;
      if (response && response.guidance) {
        setData(response.guidance);
      }
    } catch (err) {
      console.error("Error fetching market insights:", err);
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
            <div className="p-3 bg-secondary/5 rounded-xl border border-secondary/10">
              <p className="text-[11px] text-foreground leading-relaxed">
                {data.marketOverview}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-1">Price Trends</h4>
              <div className="grid gap-1.5">
                {data.topPerformers.slice(0, 3).map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-full ${
                        item.trend === "Rising" ? "bg-green-100 text-green-600" :
                        item.trend === "Falling" ? "bg-red-100 text-red-600" :
                        "bg-blue-100 text-blue-600"
                      }`}>
                        {item.trend === "Rising" ? <TrendingUp className="w-3 h-3" /> :
                         item.trend === "Falling" ? <TrendingDown className="w-3 h-3" /> :
                         <Minus className="w-3 h-3" />}
                      </div>
                      <span className="text-[11px] font-medium">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[9px] px-1 h-4">{item.priceRange}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {data.recommendations && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <h4 className="text-[9px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 px-1">
                  <TrendingUp className="w-2.5 h-2.5" />
                  Best Future Deals
                </h4>
                <div className="grid gap-1.5">
                  {data.recommendations.slice(0, 2).map((rec) => (
                    <div key={rec.name} className="p-2 rounded-lg bg-secondary/5 border border-secondary/10 group hover:bg-secondary/10 transition-colors">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[11px] font-bold text-foreground">{rec.name}</span>
                        <Badge variant="outline" className="text-[8px] h-3.5 px-1 border-secondary/30 text-secondary bg-secondary/5">
                          In {rec.timeToHarvest}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight line-clamp-1">{rec.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto pt-2 border-t border-border/40">
              <p className="text-[10px] italic text-muted-foreground flex items-center gap-2 px-1">
                <Minus className="w-2.5 h-2.5 text-secondary shrink-0" />
                {data.seasonalAdvice}
              </p>
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
