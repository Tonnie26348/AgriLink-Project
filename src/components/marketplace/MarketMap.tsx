import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MarketplaceListing } from "@/hooks/useMarketplace";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShoppingBag, Users, TrendingUp } from "lucide-react";

interface MarketMapProps {
  listings: MarketplaceListing[];
  onLocationSelect: (location: string) => void;
  selectedLocations: string[];
}

// Fixed coordinates for common Kenyan agricultural regions to create a "map" effect
const REGION_COORDS: Record<string, { x: number; y: number }> = {
  "Nairobi": { x: 55, y: 70 },
  "Kiambu": { x: 52, y: 65 },
  "Nakuru": { x: 45, y: 60 },
  "Uasin Gishu": { x: 35, y: 50 },
  "Eldoret": { x: 34, y: 48 },
  "Meru": { x: 65, y: 55 },
  "Nyeri": { x: 58, y: 58 },
  "Mombasa": { x: 85, y: 90 },
  "Kisumu": { x: 25, y: 62 },
  "Kakamega": { x: 22, y: 55 },
  "Narok": { x: 40, y: 75 },
  "Trans Nzoia": { x: 30, y: 40 },
  "Kenya": { x: 50, y: 50 }, // Default
};

export const MarketMap = ({ listings, onLocationSelect, selectedLocations }: MarketMapProps) => {
  const locationStats = useMemo(() => {
    const stats: Record<string, { count: number; farmers: Set<string>; categories: Set<string> }> = {};
    
    listings.forEach(listing => {
      const loc = listing.farmer_location || "Kenya";
      if (!stats[loc]) {
        stats[loc] = { count: 0, farmers: new Set(), categories: new Set() };
      }
      stats[loc].count += 1;
      stats[loc].farmers.add(listing.farmer_id);
      stats[loc].categories.add(listing.category);
    });

    return Object.entries(stats).map(([name, data]) => ({
      name,
      count: data.count,
      farmerCount: data.farmers.size,
      categories: Array.from(data.categories),
      coords: REGION_COORDS[name] || { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }
    }));
  }, [listings]);

  return (
    <Card className="relative overflow-hidden border-border/40 bg-background/60 backdrop-blur-md shadow-soft rounded-3xl h-[400px] group">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M10,10 L90,10 L90,90 L10,90 Z" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,2" />
          <path d="M50,0 L50,100 M0,50 L100,50" fill="none" stroke="currentColor" strokeWidth="0.2" />
        </svg>
      </div>

      <div className="absolute top-6 left-6 z-10 space-y-1">
        <h3 className="text-xl font-display font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Market Map
        </h3>
        <p className="text-xs text-muted-foreground font-medium">
          Discover <span className="text-primary font-bold">{listings.length}</span> fresh products across Kenya
        </p>
      </div>

      <div className="absolute top-6 right-6 z-10 flex gap-2">
        <div className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-border/50 flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-tight">Live Supply</span>
        </div>
      </div>

      <div className="relative w-full h-full p-8 cursor-grab active:cursor-grabbing">
        <AnimatePresence>
          {locationStats.map((loc) => {
            const isSelected = selectedLocations.includes(loc.name);
            return (
              <motion.div
                key={loc.name}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1, zIndex: 20 }}
                className="absolute cursor-pointer"
                style={{ left: `${loc.coords.x}%`, top: `${loc.coords.y}%` }}
                onClick={() => onLocationSelect(loc.name)}
              >
                {/* Ping Animation */}
                <div className="absolute inset-0 -translate-x-1/2 -translate-y-1/2">
                  <div className={`w-12 h-12 rounded-full ${isSelected ? 'bg-primary/30' : 'bg-primary/20'} animate-ping`} />
                </div>

                {/* Marker */}
                <div className="relative -translate-x-1/2 -translate-y-1/2 group/marker">
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all shadow-glow ${
                    isSelected 
                      ? "bg-primary text-primary-foreground border-primary scale-110 shadow-primary/20" 
                      : "bg-background/95 text-foreground border-border/50 hover:border-primary/50"
                  }`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-primary/10'}`}>
                      <ShoppingBag className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-primary'}`} />
                    </div>
                    <div className="flex flex-col leading-none">
                      <span className="text-[11px] font-bold truncate max-w-[80px]">{loc.name}</span>
                      <span className={`text-[9px] font-medium opacity-70`}>{loc.count} items</span>
                    </div>
                  </div>

                  {/* Hover Detail Card */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover/marker:opacity-100 pointer-events-none transition-all duration-300 translate-y-2 group-hover/marker:translate-y-0 z-30">
                    <div className="bg-background/95 backdrop-blur-xl border border-border/50 p-3 rounded-2xl shadow-elevated w-40">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">{loc.name} Insights</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" /> Farmers</span>
                          <span className="text-[10px] font-bold">{loc.farmerCount}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Popular</span>
                          <span className="text-[10px] font-bold truncate max-w-[60px]">{loc.categories[0]}</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-border/40 flex flex-wrap gap-1">
                        {(loc.categories || []).slice(0, 2).map(c => (
                          <Badge key={c} variant="secondary" className="text-[8px] px-1 py-0 h-4 bg-muted border-none">
                            {c}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className="bg-background/40 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center justify-between shadow-soft">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-muted flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="Farmer" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white bg-primary flex items-center justify-center text-[10px] font-bold text-white">
              +{locationStats.reduce((acc, l) => acc + l.farmerCount, 0)}
            </div>
          </div>
          <p className="text-[10px] font-medium text-muted-foreground">
            Trusted by farmers in <span className="text-foreground font-bold">{locationStats.length}</span> regions
          </p>
        </div>
      </div>
    </Card>
  );
};
