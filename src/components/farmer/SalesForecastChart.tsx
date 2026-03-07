import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context-definition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Loader2, TrendingUp, Sparkles, RefreshCw } from "lucide-react";

interface SalesForecastChartProps {
  historicalData: { month: string; sales: number }[];
}

const SalesForecastChart = ({ historicalData }: SalesForecastChartProps) => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>(historicalData);
  const [loading, setLoading] = useState(false);
  const [forecasted, setForecasted] = useState(false);
  const [insight, setInsight] = useState("");

  const handleForecast = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: response, error } = await supabase.functions.invoke("sales-forecast", {
        body: {
          history: historicalData,
          farmerId: user.id,
        },
      });

      if (error) throw error;

      if (response && response.forecast) {
        const newData = [...historicalData];
        response.forecast.forEach((f: any) => {
          newData.push({
            month: f.month,
            sales: f.sales,
            isForecast: true,
          });
        });
        setData(newData);
        setInsight(response.insight);
        setForecasted(true);
      }
    } catch (error) {
      console.error("Forecast error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForecast = () => {
    setData(historicalData);
    setForecasted(false);
    setInsight("");
  };

  return (
    <Card className="shadow-soft border-border/50 relative overflow-hidden h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Sales Forecast
            </CardTitle>
            <CardDescription>
              AI projections based on your sales
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {forecasted ? (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={resetForecast}
                className="h-8 w-8 text-muted-foreground hover:text-primary"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                size="sm" 
                onClick={handleForecast} 
                disabled={loading || historicalData.length === 0}
                className="gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Predict Sales
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {historicalData.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-xl opacity-60">
            <TrendingUp className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-sm">Not enough sales history to generate an accurate forecast yet.</p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(v) => `Ksh${v/1000}k`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  formatter={(value: number, name: string, props: any) => {
                    return [`Ksh ${value.toLocaleString()}`, props.payload.isForecast ? "AI Forecast" : "Actual Sales"];
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  activeDot={{ r: 6 }}
                />
                {forecasted && (
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    data={data.filter(d => d.isForecast || d.month === historicalData[historicalData.length - 1].month)}
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    fillOpacity={1} 
                    fill="url(#colorForecast)" 
                    activeDot={{ r: 6, fill: "#8b5cf6" }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
        
        {insight && (
          <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10 animate-fade-in">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">AI Market Insight</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {insight}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SalesForecastChart;

