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

const MarketInsightsCard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    marketOverview: string;
    topPerformers: MarketTrend[];
    seasonalAdvice: string;
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
      <Card className="shadow-soft border-border/50 h-full">
        <CardHeader>
          <CardTitle>Market Insights</CardTitle>
          <CardDescription>Real-time agricultural trends</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-border/50 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-secondary" />
            Market Insights
          </CardTitle>
          <CardDescription>Powered by AI Analyst</CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground" 
          onClick={fetchInsights}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent className="pt-4 flex-1 flex flex-col gap-6">
        {data && (
          <>
            <div className="p-4 bg-secondary/5 rounded-xl border border-secondary/10">
              <p className="text-sm text-foreground leading-relaxed">
                {data.marketOverview}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price Trends</h4>
              <div className="grid gap-2">
                {data.topPerformers.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${
                        item.trend === "Rising" ? "bg-green-100 text-green-600" :
                        item.trend === "Falling" ? "bg-red-100 text-red-600" :
                        "bg-blue-100 text-blue-600"
                      }`}>
                        {item.trend === "Rising" ? <TrendingUp className="w-3.5 h-3.5" /> :
                         item.trend === "Falling" ? <TrendingDown className="w-3.5 h-3.5" /> :
                         <Minus className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">{item.priceRange}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-border/50">
              <p className="text-xs italic text-muted-foreground flex items-center gap-2">
                <Minus className="w-3 h-3 text-secondary" />
                {data.seasonalAdvice}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketInsightsCard;
