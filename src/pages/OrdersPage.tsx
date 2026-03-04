import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context-definition";
import { useOrders, OrderStatus } from "@/hooks/useOrders";
import OrderCard from "@/components/orders/OrderCard";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Package, 
  Loader2, 
  ArrowLeft,
  Calendar,
  ShoppingBag,
  Tractor,
  TrendingUp,
  ChevronRight
} from "lucide-react";

const STATUS_FILTERS: (OrderStatus | "all")[] = ["all", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

const OrdersPage = () => {
  const { user, userRole } = useAuth();
  const navigate = useNavigate();
  const { orders, loading, updateOrderStatus } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      const matchesSearch = 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.buyer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.farmer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items?.some(item => item.listing_name?.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesStatus && matchesSearch;
    });
  }, [orders, statusFilter, searchQuery]);

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const dashboardPath = userRole === "farmer" ? "/farmer/dashboard" : "/buyer/dashboard";

  return (
    <div className="min-h-screen bg-muted/30 pt-16">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Button variant="ghost" asChild className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
                <Link to={dashboardPath}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
                {userRole === "farmer" ? <Tractor className="w-8 h-8 text-primary" /> : <ShoppingBag className="w-8 h-8 text-secondary" />}
                Your Orders
              </h1>
              <p className="text-muted-foreground">
                {userRole === "farmer" ? "Manage and track sales from your farm" : "Track and manage your purchases from local farmers"}
              </p>
            </div>
            
            {userRole === "farmer" && (
              <Card className="bg-primary/5 border-primary/10 shadow-none">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Sales</p>
                    <p className="text-xl font-bold text-primary">Ksh{orders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.total_amount, 0)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Filters and Search */}
          <Card className="mb-8 border-border/50 shadow-soft">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by Order ID, item, or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map((status) => (
                    <Badge
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      className={`cursor-pointer capitalize px-3 py-1.5 ${
                        statusFilter === status 
                          ? (userRole === "farmer" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground") 
                          : "hover:bg-muted"
                      }`}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="grid gap-6">
            {filteredOrders.length === 0 ? (
              <Card className="border-dashed border-2 border-border/50 bg-transparent">
                <CardContent className="py-20 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-muted-foreground opacity-20" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">No orders found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || statusFilter !== "all" 
                      ? "Try adjusting your filters or search query" 
                      : (userRole === "farmer" ? "You haven't received any orders yet" : "You haven't placed any orders yet")}
                  </p>
                  {userRole === "buyer" && !searchQuery && statusFilter === "all" && (
                    <Button asChild>
                      <Link to="/marketplace">Browse Marketplace</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    viewAs={userRole as "buyer" | "farmer"}
                    onUpdateStatus={updateOrderStatus}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Analytics Preview for Farmers */}
          {userRole === "farmer" && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Sales Insights</h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Best Selling", value: "Organic Tomatoes", sub: "124 kg sold" },
                  { label: "Top Buyer", value: "Hotel Grand", sub: "8 orders" },
                  { label: "Return Rate", value: "2.4%", sub: "Industry low" },
                  { label: "Avg. Rating", value: "4.8/5", sub: "From 42 reviews" }
                ].map((stat, i) => (
                  <Card key={i} className="bg-muted/30 border-border/50 opacity-60 grayscale-[0.5]">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground font-medium uppercase mb-1">{stat.label}</p>
                      <p className="text-lg font-bold text-foreground mb-0.5">{stat.value}</p>
                      <p className="text-[10px] text-muted-foreground">{stat.sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage;
