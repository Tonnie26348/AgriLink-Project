import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context-definition";
import { useToast } from "@/hooks/use-toast";
import { useProduceListings, ProduceListing, CreateListingInput } from "@/hooks/useProduceListings";
import { useOrders } from "@/hooks/useOrders";
import OrderCard from "@/components/orders/OrderCard";
import ProduceListingDialog from "@/components/farmer/ProduceListingDialog";
import { SalesAnalytics } from "@/components/farmer/SalesAnalytics";
import SalesForecastChart from "@/components/farmer/SalesForecastChart";

import ConversationList from "@/components/marketplace/ConversationList";
import ChatDialog from "@/components/marketplace/ChatDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PriceInsights } from "@/components/insights/PriceInsights";
import AIDiagnosisDialog from "@/components/farmer/AIDiagnosisDialog";
import { HarvestCalendar } from "@/components/farmer/HarvestCalendar";
import OnboardingTour from "@/components/OnboardingTour";
import { format, subMonths, startOfMonth } from "date-fns";
import { useMemo } from "react";
import { 
  Leaf, 
  Plus, 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart,
  LogOut,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  LayoutDashboard,
  ChevronRight,
  UserCircle,
  MessageSquare,
  Bot,
  Sparkles,
  Camera,
  ShieldCheck,
  AlertTriangle,
  Calendar as CalendarIcon
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";

interface FarmerDashboardProps {
  activeTab?: "overview" | "inventory" | "orders" | "messages" | "ai-insights" | "calendar";
}

const FarmerDashboard = ({ activeTab: propActiveTab = "overview" }: FarmerDashboardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const activeTab = propActiveTab;

  const { 
    listings, 
    loading, 
    createListing, 
    updateListing, 
    deleteListing, 
    toggleAvailability,
    uploadImage,
    refetch
  } = useProduceListings();
  
  const { orders, loading: ordersLoading, updateOrderStatus, refetch: refetchOrders } = useOrders();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<ProduceListing | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [isDiagnosisOpen, setIsDiagnosisOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<{ id: string; name: string } | null>(null);

  const pendingOrders = orders.filter((o) => !["delivered", "cancelled"].includes(o.status));

  const historicalSalesData = useMemo(() => {
    // Group orders by month for the last 6 months
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const date = subMonths(new Date(), 5 - i);
      return {
        month: format(date, "MMM"),
        fullDate: startOfMonth(date),
        sales: 0,
      };
    });

    orders.forEach((order) => {
      if (order.status === "cancelled") return;
      const orderDate = startOfMonth(new Date(order.created_at));
      const monthData = last6Months.find(
        (m) => m.fullDate.getTime() === orderDate.getTime()
      );
      if (monthData) {
        monthData.sales += Number(order.total_amount);
      }
    });

    return last6Months;
  }, [orders]);

  const stats = [
    { label: "Total Listings", value: listings.length.toString(), icon: Package, color: "text-primary" },
    { label: "Active Listings", value: listings.filter(l => l.is_available).length.toString(), icon: ShoppingCart, color: "text-secondary" },
    { label: "Total Orders", value: orders.length.toString(), icon: DollarSign, color: "text-accent" },
    { label: "Pending Orders", value: pendingOrders.length.toString(), icon: TrendingUp, color: "text-primary" },
  ];

  const handleAddNew = () => {
    setEditingListing(null);
    setDialogOpen(true);
  };

  const handleEdit = (listing: ProduceListing) => {
    setEditingListing(listing);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteListing(deletingId);
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleSelectConversation = (userId: string, userName: string) => {
    setSelectedChatUser({ id: userId, name: userName });
    setChatDialogOpen(true);
  };

  const handleSubmit = async (data: CreateListingInput) => {
    if (editingListing) {
      return updateListing(editingListing.id, data);
    }
    return createListing(data);
  };

  const handleLogout = async () => {
    console.log("Farmer logout initiated");
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      // Use window.location for a clean break from the dashboard state
      window.location.href = "/AgriLink/";
    } catch (error: unknown) {
      console.error("Logout error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during logout.";
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: errorMessage,
      });
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, path: "/farmer/dashboard" },
    { id: "inventory", label: "Inventory", icon: Package, path: "/farmer/dashboard/inventory" },
    { id: "orders", label: "Orders", icon: ShoppingCart, path: "/farmer/dashboard/orders" },
    { id: "calendar", label: "Harvests", icon: CalendarIcon, path: "/farmer/dashboard/harvests" },
    { id: "ai-insights", label: "AI Insights", icon: Bot, path: "/farmer/dashboard/ai-insights" },
    { id: "messages", label: "Messages", icon: MessageSquare, path: "/farmer/dashboard/messages" },
  ] as const;

  return (
    <DashboardLayout navItems={[...tabs]} role="farmer">
      <OnboardingTour />
      
      {/* Tab Content */}
      <div className="space-y-8 animate-fade-in">
        {activeTab === "overview" && (
            <>
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
                  <Button onClick={() => setIsDiagnosisOpen(true)} variant="outline" className="shadow-soft gap-2 border-primary/30 text-primary">
                    <Camera className="w-5 h-5" />
                    Plant Doctor
                  </Button>
                  <Button onClick={handleAddNew} size="lg" className="shadow-soft">
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
                            onClick={() => setIsDiagnosisOpen(true)}
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
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-amber-600 hover:bg-amber-100" onClick={() => handleEdit(l)}>
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
                          />
                          <Button 
                            variant="link" 
                            className="w-full text-primary gap-1"
                            onClick={() => setActiveTab("ai-insights")}
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
                      <Button onClick={() => setActiveTab("inventory")} variant="outline" className="w-full justify-start gap-2">
                        <Package className="w-4 h-4 text-primary" /> Manage Inventory
                      </Button>
                      <Button onClick={() => setActiveTab("ai-insights")} variant="outline" className="w-full justify-start gap-2 group">
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
            </>
          )}

          {activeTab === "inventory" && (
            <Card className="shadow-soft border-border/50">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4">
                <div>
                  <CardTitle className="text-2xl">Inventory Management</CardTitle>
                  <CardDescription>Edit, hide, or delete your produce listings</CardDescription>
                </div>
                <Button onClick={handleAddNew} size="sm">
                  <Plus className="w-4 h-4 mr-2" /> New Listing
                </Button>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground mb-4">You haven't listed any produce yet</p>
                    <Button onClick={handleAddNew} variant="outline">Add First Listing</Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {listings.map((listing) => (
                      <div
                        key={listing.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/20 transition-all group gap-4"
                      >
                        <div className="flex items-center gap-4">
                          {listing.image_url ? (
                            <img
                              src={listing.image_url}
                              alt={listing.name}
                              className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Package className="w-6 h-6 sm:w-7 sm:h-7 text-primary opacity-60" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-foreground group-hover:text-primary transition-colors truncate">{listing.name}</p>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                              <span className="text-sm font-semibold text-primary">Ksh{listing.price_per_unit}/{listing.unit}</span>
                              <span className="text-xs text-muted-foreground hidden sm:inline">•</span>
                              <span className="text-xs sm:text-sm text-muted-foreground">{listing.quantity_available} {listing.unit} in stock</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-3 sm:pt-0">
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                              listing.is_available
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {listing.is_available ? "Public" : "Hidden"}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(listing)}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleAvailability(listing.id, !listing.is_available)}>
                                {listing.is_available ? <><EyeOff className="w-4 h-4 mr-2" /> Hide</> : <><Eye className="w-4 h-4 mr-2" /> Show</>}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(listing.id)} className="text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                <CardTitle className="text-2xl">Manage Orders</CardTitle>
                <CardDescription>Update status and track your sales</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                    <p className="text-muted-foreground">No orders received yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {orders.map((order) => (
                      <div key={order.id} className="py-4 first:pt-0 last:pb-0">
                        <OrderCard order={order} viewAs="farmer" onUpdateStatus={updateOrderStatus} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "calendar" && (
            <HarvestCalendar listings={listings} />
          )}

          {activeTab === "ai-insights" && (
            <div className="animate-fade-in">
              <Link to="/ai-insights" className="block">
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center hover:bg-primary/10 transition-all group">
                  <Bot className="w-16 h-16 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                  <h2 className="text-2xl font-display font-bold text-foreground mb-2">Deep Market Analysis</h2>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Access real-time trends, seasonal predictions, and regional demand heatmaps 
                    powered by Gemini AI.
                  </p>
                  <Button size="lg" className="shadow-soft">Open Full Analyst Page</Button>
                </div>
              </Link>
            </div>
          )}

          {activeTab === "messages" && (
            <Card className="shadow-soft border-border/50">
              <CardHeader className="pb-3 border-b border-border/10">
                <CardTitle className="text-2xl">Buyer Messages</CardTitle>
                <CardDescription>Communication with potential customers</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ConversationList onSelectConversation={handleSelectConversation} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <ProduceListingDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          listing={editingListing}
          onSubmit={handleSubmit}
          onUploadImage={uploadImage}
          onSuccess={refetch}
        />

        {/* Chat Dialog */}
        {selectedChatUser && (
          <ChatDialog
            open={chatDialogOpen}
            onOpenChange={setChatDialogOpen}
            receiverId={selectedChatUser.id}
            receiverName={selectedChatUser.name}
          />
        )}

        {/* AI Plant Doctor Dialog */}
        <AIDiagnosisDialog
          open={isDiagnosisOpen}
          onOpenChange={setIsDiagnosisOpen}
        />

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Listing</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this listing? This action cannot be undone and will remove it from the marketplace.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Listing
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Floating AI Assistant FAB */}
        <div className="fixed bottom-6 right-6 z-50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="lg" className="rounded-full h-14 w-14 shadow-glow p-0 overflow-hidden group border-2 border-white/20">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 group-hover:scale-110 transition-transform" />
                <Bot className="relative z-10 w-7 h-7 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mb-2 p-2 shadow-elevated border-border/40 backdrop-blur-xl bg-background/95">
              <div className="px-2 py-2 mb-2 border-b border-border/50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary">AI Assistant</p>
              </div>
              <DropdownMenuItem onClick={() => setIsDiagnosisOpen(true)} className="gap-3 py-3 cursor-pointer rounded-lg">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Camera className="w-4 h-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Plant Doctor</span>
                  <span className="text-[10px] text-muted-foreground">Scan for diseases</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/farmer/dashboard/ai-insights")} className="gap-3 py-3 cursor-pointer rounded-lg">
                <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Market Guidance</span>
                  <span className="text-[10px] text-muted-foreground">AI price predictions</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
    </DashboardLayout>
  );
};

export default FarmerDashboard;

