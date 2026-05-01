import { useState, useMemo, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context-definition";
import { useToast } from "@/hooks/use-toast";
import { useProduceListings, ProduceListing, CreateListingInput } from "@/hooks/useProduceListings";
import { useOrders } from "@/hooks/useOrders";
import { useProfile } from "@/hooks/useProfile";
import ProduceListingDialog from "@/components/farmer/ProduceListingDialog";
import { FarmerOverviewTab } from "@/components/farmer/FarmerOverviewTab";
import { FarmerInventoryTab } from "@/components/farmer/FarmerInventoryTab";

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
import AIDiagnosisDialog from "@/components/farmer/AIDiagnosisDialog";
import { HarvestCalendar } from "@/components/farmer/HarvestCalendar";
import OnboardingTour from "@/components/OnboardingTour";
import { format, subMonths, startOfMonth } from "date-fns";
import { 
  Package, 
  ShoppingCart,
  MoreVertical,
  Loader2,
  LayoutDashboard,
  MessageSquare,
  Bot,
  Sparkles,
  Camera,
  Calendar as CalendarIcon,
  DollarSign,
  TrendingUp
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import OrderCard from "@/components/orders/OrderCard";

interface FarmerDashboardProps {
  activeTab?: "overview" | "inventory" | "orders" | "messages" | "ai-insights" | "calendar";
}

const FarmerDashboard = ({ activeTab: propActiveTab = "overview" }: FarmerDashboardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const activeTab = propActiveTab;

  const handleTabChange = (tab: string) => {
    const path = tab === "overview" ? "/farmer/dashboard" : `/farmer/dashboard/${tab}`;
    navigate(path);
  };

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
  const { profile } = useProfile();

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
      
      <div className="animate-fade-in">
        {activeTab === "overview" && (
          <FarmerOverviewTab 
            listings={listings}
            orders={orders}
            profile={profile}
            historicalSalesData={historicalSalesData}
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            onStartDiagnosis={() => setIsDiagnosisOpen(true)}
            onTabChange={handleTabChange}
          />
        )}

        {activeTab === "inventory" && (
          <FarmerInventoryTab 
            listings={listings}
            loading={loading}
            onAddNew={handleAddNew}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleAvailability={toggleAvailability}
          />
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

