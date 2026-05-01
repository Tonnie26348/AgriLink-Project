import { useState, useEffect, lazy, Suspense, memo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MarketplaceListing, useMarketplace } from "@/hooks/useMarketplace";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, 
  Star, 
  ShieldCheck, 
  MessageCircle, 
  ShoppingBag, 
  Calendar, 
  ArrowLeft,
  Share2,
  Heart,
  TrendingUp,
  Award,
  Clock
} from "lucide-react";
import { toast } from "sonner";

// Lazy Load
const ListingDetailSheet = lazy(() => import("@/components/marketplace/ListingDetailSheet"));

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  role: string;
}

const FarmerStorefront = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farmer, setFarmer] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);


  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Use the marketplace hook but filtered by this farmer
  const { listings, loading: listingsLoading } = useMarketplace({ 
    // We'll filter client-side for simplicity in this step, 
    // but a real app would use a specific farmer_id query
  });

  const farmerListings = listings.filter(l => l.farmer_id === id);

  useEffect(() => {
    const fetchFarmerProfile = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", id)
          .single();

        if (error) throw error;
        setFarmer(data);
      } catch (err) {
        console.error("Error fetching farmer storefront:", err);
        toast.error("Could not find farmer profile");
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerProfile();
  }, [id]);

  const handleCardClick = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setDetailSheetOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 pt-16">
        <Header />
        <div className="container mx-auto px-4 py-8 space-y-8">
          <Skeleton className="h-[200px] w-full rounded-3xl" />
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="h-[400px] w-full md:w-64 rounded-3xl" />
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-16 font-sans">
      <Header />
      
      {/* Shop Header / Cover */}
      <div className="relative h-48 md:h-64 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop" 
          className="w-full h-full object-cover"
          alt="Farmer Storefront"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 opacity-20">
            <ShoppingBag className="w-20 h-20 text-white" />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-20 relative z-30 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Farmer Info */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            <Card className="border-border/40 shadow-elevated rounded-3xl overflow-hidden backdrop-blur-md bg-background/90 sticky top-24">
              <CardContent className="p-8 text-center">
                <div className="relative inline-block mb-6">
                  <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-4 ring-primary/10">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-2xl font-black">
                      {farmer?.full_name?.[0] || "F"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full shadow-lg border-2 border-background">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>

                <h1 className="text-2xl font-display font-black text-foreground mb-1">
                  {farmer?.full_name}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center justify-center gap-1 mb-6">
                  <MapPin className="w-3.5 h-3.5 text-primary" /> {farmer?.location || "Nairobi, Kenya"}
                </p>

                <div className="flex justify-center gap-4 mb-8 border-y border-border/40 py-4">
                  <div className="text-center">
                    <p className="text-lg font-black text-foreground">4.9</p>
                    <div className="flex text-yellow-500">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                    </div>
                  </div>
                  <div className="w-px h-10 bg-border/50" />
                  <div className="text-center">
                    <p className="text-lg font-black text-foreground">120+</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">Sales</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button className="w-full rounded-2xl h-12 shadow-soft font-bold gap-2">
                    <Heart className="w-4 h-4" />
                    Follow Farmer
                  </Button>
                  <Button variant="outline" className="w-full rounded-2xl h-12 border-border/60 font-bold gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Contact Shop
                  </Button>
                </div>

                <div className="mt-8 pt-6 border-t border-border/40 text-left space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Store Details</h4>
                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">Top Quality Merchant</p>
                      <p className="text-[10px] text-muted-foreground">Certified organic practitioner</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold">Merchant Since</p>
                      <p className="text-[10px] text-muted-foreground">Joined in March 2023</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - Listings */}
          <div className="flex-1 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-display font-black text-foreground mb-1 tracking-tight">Active Produce</h2>
                <p className="text-muted-foreground">Browse all fresh items from this farm</p>
              </div>
              <div className="flex items-center gap-3 bg-background/60 backdrop-blur-md p-1.5 rounded-2xl border border-border/40 shadow-soft">
                <Button variant="ghost" size="sm" className="rounded-xl h-9 text-xs font-bold bg-primary text-primary-foreground">Grid View</Button>
                <Button variant="ghost" size="sm" className="rounded-xl h-9 text-xs font-bold text-muted-foreground">List View</Button>
              </div>
            </div>

            {listingsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-3xl" />)}
              </div>
            ) : farmerListings.length === 0 ? (
              <Card className="border-dashed border-border/60 bg-background/40 p-20 text-center rounded-3xl">
                <p className="text-muted-foreground">No active produce listings found for this shop.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {farmerListings.map((listing) => (
                  <ListingCard 
                    key={listing.id} 
                    listing={listing} 
                    onClick={() => handleCardClick(listing)} 
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Suspense fallback={null}>
        <ListingDetailSheet 
          listing={selectedListing}
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
          onOrder={() => {}} // Placeholder
          onAddToCart={() => {}} // Placeholder
          onMessage={() => {}} // Placeholder
          isFavorite={false}
          onToggleFavorite={() => {}}
        />
      </Suspense>
      <Footer />
    </div>
  );
};

export const ListingCard = memo(({ listing, onClick }: { listing: MarketplaceListing, onClick: () => void }) => {
  return (
    <Card 
      className="overflow-hidden border-border/40 bg-background/60 backdrop-blur-sm hover:border-primary/30 hover:shadow-elevated transition-all duration-300 group rounded-3xl cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={listing.image_url || "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1974&auto=format&fit=crop"} 
          alt={listing.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-background/90 text-foreground backdrop-blur-md border-none shadow-sm font-bold">
            {listing.category}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-2xl font-display font-black text-white tracking-tight">Ksh {listing.price_per_unit} <span className="text-xs font-normal opacity-80">/{listing.unit}</span></p>
        </div>
      </div>
      <CardContent className="p-6">
        <h3 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">{listing.name}</h3>
        <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">
          <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-primary" /> High Demand</span>
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-secondary" /> {listing.quantity_available} left</span>
        </div>
        <Button className="w-full rounded-xl h-11 font-bold shadow-soft">View Details</Button>
      </CardContent>
    </Card>
  );
});
