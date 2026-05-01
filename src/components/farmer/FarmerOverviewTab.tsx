
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, ShieldCheck, AlertTriangle, TrendingUp, ChevronRight, Sparkles, Bot, Package, ShoppingCart, DollarSign, Plus } from "lucide-react";
import { SalesAnalytics } from "@/components/farmer/SalesAnalytics";
import SalesForecastChart from "@/components/farmer/SalesForecastChart";
import { WeatherWidget } from "@/components/farmer/WeatherWidget";
import { PriceInsights } from "@/components/insights/PriceInsights";
import { Link } from "react-router-dom";
import { ProduceListing } from "@/hooks/useProduceListings";
import { Order } from "@/hooks/useOrders";
import { Profile } from "@/hooks/useProfile";

interface HistoricalSalesData {
  month: string;
  fullDate: Date;
  sales: number;
}

interface FarmerOverviewTabProps {
  listings: ProduceListing[];
  orders: Order[];
  profile: Profile | null;
  historicalSalesData: HistoricalSalesData[];
  onAddNew: () => void;
  onEdit: (listing: ProduceListing) => void;
  onStartDiagnosis: () => void;
  onTabChange: (tab: string) => void;
}

export const FarmerOverviewTab = ({
  listings,
  orders,
  profile,
  historicalSalesData,
  onAddNew,
  onEdit,
  onStartDiagnosis,
  onTabChange
}: FarmerOverviewTabProps) => {
  const pendingOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));

  const stats = [
    { label: "Total Listings", value: listings.length.toString(), icon: Package, color: "text-primary" },
    { label: "Active Listings", value: listings.filter(l => l.is_available).length.toString(), icon: ShoppingCart, color: "text-secondary" },
    { label: "Total Orders", value: orders.length.toString(), icon: DollarSign, color: "text-accent" },
    { label: "Pending Orders", value: pendingOrders.length.toString(), icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">
            Dashboard Overview 🌾
          </h1>
          <p className="text-muted-foreground">
            Performance summary and recent activity
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={onStartDiagnosis} variant="outline" className="shadow-soft gap-2 border-primary/30 text-primary">
            <Camera className="w-5 h-5" />
            Plant Doctor
          </Button>
          <Button onClick={onAddNew} size="lg" className="shadow-soft">
            <Plus className="w-5 h-5 mr-2" />
            Add New Listing
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 shadow-soft">
            <CardContent className="pt-6 px-4 sm:px-6">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-2 sm:p-3 rounded-xl bg-muted ${stat.color} shrink-0`}>
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* AI Plant Doctor Banner */}
          <Card className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground overflow-hidden shadow-glow border-none">
            <CardContent className="p-8 relative">
              <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-soft shrink-0">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-xl font-display font-bold mb-1">AI Plant Doctor</h2>
                  <p className="text-primary-foreground/80 text-sm mb-4 max-w-md">
                    Upload a photo of your crops to get instant disease diagnosis 
                    and organic treatment recommendations.
                  </p>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="shadow-soft gap-2 h-10 px-6"
                    onClick={onStartDiagnosis}
                  >
                    <Camera className="w-4 h-4" />
                    Start Diagnosis
                  </Button>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50">
            <CardHeader className="pb-3 border-b border-border/10">
              <CardTitle className="text-xl">Sales Insights</CardTitle>
              <CardDescription>Your revenue and performance trends</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <SalesAnalytics orders={orders} />
              <div className="pt-6 border-t border-border/50">
                <SalesForecastChart historicalData={historicalSalesData} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Weather Widget */}
          <WeatherWidget location={profile?.location || "Nakuru, Kenya"} />

          {/* Low Stock Alerts */}
          {listings.filter(l => l.quantity_available <= 10).length > 0 && (
            <Card className="border-amber-200 bg-amber-50/30 shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {listings
                  .filter(l => l.quantity_available <= 10)
                  .map(l => (
                    <div key={l.id} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-amber-100 shadow-sm">
                      <div>
                        <p className="text-xs font-bold text-foreground">{l.name}</p>
                        <p className="text-[10px] text-amber-600 font-medium">{l.quantity_available} {l.unit} remaining</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:bg-amber-100" onClick={() => onEdit(l)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
              </CardContent>
            </Card>
          )}

          <Card className="shadow-soft border-border/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <CardHeader className="pb-3 border-b border-border/10">
              <CardTitle className="text-xl">AI Price Guidance</CardTitle>
              <CardDescription>Get suggested prices for your items</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {listings.length > 0 ? (
                <div className="space-y-4">
                  <PriceInsights
                    listings={listings.map((l) => ({
                      id: l.id,
                      name: l.name,
                      price_per_unit: l.price_per_unit,
                      unit: l.unit,
                      quantity_available: l.quantity_available,
                    }))}
                    location={profile?.location || "Kenya"}
                  />
                  <Button 
                    variant="link" 
                    className="w-full text-primary gap-1"
                    onClick={() => onTabChange("ai-insights")}
                  >
                    View Full Market Analysis <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <TrendingUp className="w-8 h-8 mx-auto text-muted-foreground opacity-30 mb-2" />
                  <p className="text-xs text-muted-foreground">Add listings to see insights</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={() => onTabChange("inventory")} variant="outline" className="w-full justify-start gap-2">
                <Package className="w-4 h-4 text-primary" /> Manage Inventory
              </Button>
              <Button onClick={() => onTabChange("ai-insights")} variant="outline" className="w-full justify-start gap-2 group">
                <Bot className="w-4 h-4 text-primary" /> Full Market Analysis
                <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </Button>
              <Link to="/marketplace" className="block">
                <Button variant="outline" className="w-full justify-start gap-2 group">
                  <TrendingUp className="w-4 h-4 text-primary" /> Browse Marketplace
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
