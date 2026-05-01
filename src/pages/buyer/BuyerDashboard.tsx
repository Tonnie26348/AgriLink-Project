import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context-definition";
import { useToast } from "@/hooks/use-toast";
import { useOrders } from "@/hooks/useOrders";
import { useMarketplace } from "@/hooks/useMarketplace";
import { useFavorites } from "@/hooks/useFavorites";
import OrderCard from "@/components/orders/OrderCard";
import ConversationList from "@/components/marketplace/ConversationList";
import ChatDialog from "@/components/marketplace/ChatDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Leaf, 
  Search, 
  ShoppingCart, 
  Package, 
  Heart, 
  Clock,
  MapPin,
  Star,
  LogOut,
  Loader2,
  ShoppingBag,
  TrendingUp,
  UserCircle,
  MessageSquare,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

import MarketInsightsCard from "@/components/marketplace/MarketInsightsCard";
import AIAssistantCard from "@/components/marketplace/AIAssistantCard";
import { MarketTrends } from "@/components/marketplace/MarketTrends";
import OnboardingTour from "@/components/OnboardingTour";

import DashboardLayout from "@/components/layout/DashboardLayout";

interface BuyerDashboardProps {
  activeTab?: "overview" | "market" | "orders" | "messages" | "favorites";
}

const BuyerDashboard = ({ activeTab: propActiveTab = "overview" }: BuyerDashboardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const activeTab = propActiveTab;

  const handleTabChange = (tab: string) => {
    const path = tab === "overview" ? "/buyer/dashboard" : `/buyer/dashboard/${tab}`;
    navigate(path);
  };

  const { orders, loading: ordersLoading } = useOrders();
  const { listings, loading: listingsLoading } = useMarketplace();
  const { favorites, toggleFavorite, isFavorite, loading: favoritesLoading } = useFavorites();

  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<{ id: string; name: string } | null>(null);

  const pendingOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));
  const deliveredOrders = orders.filter((o) => o.status === "delivered");

  // Filter listings to show only favorited ones
  const favoritedListings = listings.filter(l => favorites.some(f => f.listing_id === l.id));

  const stats = [
    { label: "Total Orders", value: orders.length.toString(), icon: Package, color: "text-primary" },
    { label: "In Progress", value: pendingOrders.length.toString(), icon: Clock, color: "text-secondary" },
    { label: "Delivered", value: deliveredOrders.length.toString(), icon: ShoppingCart, color: "text-accent" },
    { label: "Saved Items", value: favorites.length.toString(), icon: Heart, color: "text-primary" },
  ];

  const handleSelectConversation = (userId: string, userName: string) => {
    setSelectedChatUser({ id: userId, name: userName });
    setChatDialogOpen(true);
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/buyer/dashboard" },
    { id: "market", label: "Market", icon: Search, path: "/buyer/dashboard/market" },
    { id: "favorites", label: "Saved", icon: Heart, path: "/buyer/dashboard/favorites" },
    { id: "orders", label: "My Orders", icon: ShoppingBag, path: "/buyer/dashboard/orders" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "/buyer/dashboard/messages" },
  ] as const;

   return (
    <DashboardLayout navItems={[...tabs]} role="buyer">
       <OnboardingTour />
       
       {/* Tab Content */}
       <div className="space-y-8 animate-fade-in">
        {activeTab === "overview" && (
            <>
              {/* Welcome Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-display font-bold text-foreground mb-1">
                    Buyer Dashboard 🥬
                  </h1>
                  <p className="text-muted-foreground">
                    Track your orders and find the best farm deals
                  </p>
                </div>
                <Button onClick={() => handleTabChange("market")} size="lg" className="bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-soft">
                  <Search className="w-5 h-5 mr-2" />
                  Find Produce
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                  <Card key={stat.label} className="border-border/50 shadow-soft">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-soft border-border/50">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4">
                    <div>
                      <CardTitle className="text-xl">Recent Orders</CardTitle>
                      <CardDescription>Your latest purchases</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleTabChange("orders")}>View All</Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    {ordersLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-12 px-6">
                        <Package className="w-12 h-12 mx-auto text-muted-foreground opacity-20 mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">You haven't placed any orders yet</p>
                        <Button variant="outline" size="sm" onClick={() => handleTabChange("market")}>Start Shopping</Button>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {(orders || []).slice(0, 3).map((order) => (
                          <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors">
                            <OrderCard order={order} viewAs="buyer" />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <AIAssistantCard />
                  <MarketTrends />
                  <MarketInsightsCard />
                  
                  <Card className="shadow-soft border-border/50">
                    <CardHeader className="pb-3 border-b border-border/10">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Star className="w-5 h-5 text-secondary" />
                        Quick Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-3">
                      <Button onClick={() => handleTabChange("market")} variant="outline" className="w-full justify-start gap-2">
                        <Search className="w-4 h-4 text-secondary" /> Browse Market
                      </Button>
                      <Button onClick={() => handleTabChange("favorites")} variant="outline" className="w-full justify-start gap-2">
                        <Heart className="w-4 h-4 text-secondary" /> Saved Items
                      </Button>
                      <Button onClick={() => handleTabChange("messages")} variant="outline" className="w-full justify-start gap-2">
                        <MessageSquare className="w-4 h-4 text-secondary" /> Inbox
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          {activeTab === "market" && (
            <Card className="shadow-soft border-border/50">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4">
                <div>
                  <CardTitle className="text-2xl">Fresh Produce Market</CardTitle>
                  <CardDescription>Browse items available for immediate purchase</CardDescription>
                </div>
                <Link to="/marketplace">
                  <Button size="sm">Full Marketplace</Button>
                </Link>
              </CardHeader>
              <CardContent className="pt-6">
                {listingsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-secondary" />
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(listings || []).slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-secondary/30 transition-all cursor-pointer group flex flex-col h-full"
                        onClick={() => navigate("/marketplace")}
                      >
                         <div className="flex items-start justify-between mb-3">
                           {item.image_url ? (
                             <img src={item.image_url} alt={item.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover" />
                           ) : (
                             <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-secondary/10 flex items-center justify-center text-2xl">
                               📦
                             </div>
                           )}
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className={`h-8 w-8 rounded-full ${isFavorite(item.id) ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground'}`}
                             aria-label="Save to favorites"
                             onClick={(e) => {
                               e.stopPropagation();
                               toggleFavorite(item.id);
                             }}
                           >
                             <Heart className={`w-4 h-4 ${isFavorite(item.id) ? 'fill-current' : ''}`} />
                           </Button>
                         </div>
                         <h3 className="font-bold text-foreground group-hover:text-secondary transition-colors mb-1">{item.name}</h3>
                         <p className="text-xs text-muted-foreground mb-4">by {item.farmer_name} • {item.farmer_location}</p>
                         <div className="flex items-center justify-between mt-auto">
                           <span className="font-bold text-secondary">Ksh{item.price_per_unit}/{item.unit}</span>
                           <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Shop</Button>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "favorites" && (
            <Card className="shadow-soft border-border/50">
              <CardHeader className="pb-3 border-b border-border/10">
                <CardTitle className="text-2xl">Saved Items</CardTitle>
                <CardDescription>Your favorite produce listings</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {favoritesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground mb-4">You haven't saved any items yet</p>
                    <Button onClick={() => handleTabChange("market")} variant="outline">Browse Market</Button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {favoritedListings.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-secondary/30 transition-all cursor-pointer group flex flex-col h-full"
                        onClick={() => navigate("/marketplace")}
                      >
                         <div className="flex items-start justify-between mb-3">
                           {item.image_url ? (
                             <img src={item.image_url} alt={item.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover" />
                           ) : (
                             <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-secondary/10 flex items-center justify-center text-2xl">
                               📦
                             </div>
                           )}
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-8 w-8 rounded-full text-red-500 hover:text-red-600"
                             onClick={(e) => {
                               e.stopPropagation();
                               toggleFavorite(item.id);
                             }}
                           >
                             <Heart className="w-4 h-4 fill-current" />
                           </Button>
                         </div>
                         <h3 className="font-bold text-foreground group-hover:text-secondary transition-colors mb-1">{item.name}</h3>
                         <p className="text-xs text-muted-foreground mb-4">by {item.farmer_name} • {item.farmer_location}</p>
                         <div className="flex items-center justify-between mt-auto">
                           <span className="font-bold text-secondary">Ksh{item.price_per_unit}/{item.unit}</span>
                           <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Shop</Button>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "orders" && (
            <Card className="shadow-soft border-border/50">
              <CardHeader className="pb-3 border-b border-border/10">
                <CardTitle className="text-2xl">My Orders</CardTitle>
                <CardDescription>Track status and history of your purchases</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {orders.map((order) => (
                      <div key={order.id} className="py-4 first:pt-0 last:pb-0">
                        <OrderCard order={order} viewAs="buyer" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "messages" && (
            <Card className="shadow-soft border-border/50">
              <CardHeader className="pb-3 border-b border-border/10">
                <CardTitle className="text-2xl">Communications</CardTitle>
                <CardDescription>Your messages with farmers</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ConversationList onSelectConversation={handleSelectConversation} />
              </CardContent>
            </Card>
          )}
         </div>

       {/* Chat Dialog */}
      {selectedChatUser && (
        <ChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          receiverId={selectedChatUser.id}
          receiverName={selectedChatUser.name}
        />
      )}
    </DashboardLayout>
  );
};

export default BuyerDashboard;
