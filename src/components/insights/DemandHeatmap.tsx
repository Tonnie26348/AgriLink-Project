import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MapPin, TrendingUp, Info } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface RegionDemand {
  region: string;
  level: number;
  topCrops: string[];
}

interface DemandHeatmapProps {
  data: RegionDemand[];
}

const DemandHeatmap = ({ data }: DemandHeatmapProps) => {
  const sortedData = [...data].sort((a, b) => b.level - a.level);

  return (
    <div className="space-y-6">
      <Card className="shadow-soft border-border/50 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Regional Demand Analysis
          </CardTitle>
          <CardDescription>
            High demand areas based on buyer activity and seasonal trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedData} layout="vertical" margin={{ left: 40, right: 20 }}>
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis 
                  dataKey="region" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 500 }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border p-2 rounded-lg shadow-lg text-xs">
                          <p className="font-bold">{payload[0].payload.region}</p>
                          <p className="text-primary">Demand: {payload[0].value}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="level" radius={[0, 4, 4, 0]} barSize={20}>
                  {sortedData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.level > 70 ? "#10b981" : entry.level > 40 ? "#3b82f6" : "#94a3b8"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {sortedData.map((item) => (
          <Card key={item.region} className="border-border/50 shadow-soft hover:border-primary/20 transition-all">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-sm flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  {item.region}
                </h4>
                <Badge variant={item.level > 70 ? "default" : "secondary"} className="text-[10px] h-5">
                  {item.level > 70 ? "High Demand" : item.level > 40 ? "Steady" : "Emerging"}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-muted-foreground">Market Saturation</span>
                    <span className="font-medium">{item.level}%</span>
                  </div>
                  <Progress value={item.level} className="h-1" />
                </div>
                
                <div className="pt-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Top Needed Crops
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {item.topCrops.map(crop => (
                      <Badge key={crop} variant="outline" className="text-[9px] font-normal py-0 px-2 bg-muted/30">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex gap-3 items-start">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-bold text-foreground">Insight:</span> These regions show a supply-demand gap. Shipping produce to high-demand areas like <span className="text-primary font-bold">{sortedData[0]?.region}</span> can yield up to <span className="text-primary font-bold">15-20% higher</span> margins this month.
        </p>
      </div>
    </div>
  );
};

export default DemandHeatmap;
