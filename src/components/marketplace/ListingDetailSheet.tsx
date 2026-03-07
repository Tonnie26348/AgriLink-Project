import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketplaceListing } from "@/hooks/useMarketplace";
import { 
  ShoppingBag, 
  MapPin, 
  User, 
  Calendar, 
  ShieldCheck, 
  Star, 
  MessageCircle, 
  Info,
  Clock,
  ArrowRight,
  Store
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface ListingDetailSheetProps {
  listing: MarketplaceListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrder: (listing: MarketplaceListing) => void;
  onAddToCart: (listing: MarketplaceListing) => void;
  onMessage: (listing: MarketplaceListing) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ListingDetailSheet = ({
  listing,
  open,
  onOpenChange,
  onOrder,
  onAddToCart,
  onMessage,
  isFavorite,
  onToggleFavorite
}: ListingDetailSheetProps) => {
  const navigate = useNavigate();
  if (!listing) return null;

  // Mock extended data for UI polish
  const farmerSince = "2022";
  const totalSales = "450+";
  const rating = (Math.random() * (5 - 4.5) + 4.5).toFixed(1);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[500px] p-0 overflow-y-auto no-scrollbar border-l border-border/40 bg-background/95 backdrop-blur-xl">
        <div className="relative h-[300px] w-full bg-muted">
          {listing.image_url ? (
            <img 
              src={listing.image_url} 
              alt={listing.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-muted to-muted/50">
              📦
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
            <div>
              <Badge className="bg-primary text-primary-foreground mb-2 shadow-lg border-none px-3 font-bold">
                {listing.category}
              </Badge>
              <h2 className="text-3xl font-display font-black text-white tracking-tight leading-none">
                {listing.name}
              </h2>
            </div>
            <div className="bg-background/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-elevated border border-white/20">
              <span className="text-xl font-display font-black text-primary">Ksh {listing.price_per_unit}</span>
              <span className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">/{listing.unit}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8 pb-24">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/30 p-3 rounded-2xl border border-border/50 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Available</p>
              <p className="text-sm font-black text-foreground">{listing.quantity_available} {listing.unit}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-2xl border border-border/50 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Harvested</p>
              <p className="text-sm font-black text-foreground">
                {listing.harvest_date ? format(new Date(listing.harvest_date), "MMM d") : "Today"}
              </p>
            </div>
            <div className="bg-muted/30 p-3 rounded-2xl border border-border/50 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</p>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] h-5 font-bold uppercase">Fresh</Badge>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <Info className="w-5 h-5 text-primary" />
              Produce Details
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {listing.description || `High-quality ${listing.name.toLowerCase()} sourced directly from our farm in ${listing.farmer_location}. We ensure sustainable growing practices and premium freshness for every order.`}
            </p>
          </div>

          {/* Farmer Profile Card */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-secondary" />
              About the Farmer
            </h3>
            <div className="bg-gradient-to-br from-secondary/5 to-transparent p-5 rounded-3xl border border-secondary/10 relative overflow-hidden group">
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-secondary/20 flex items-center justify-center shadow-inner">
                  <User className="w-7 h-7 text-secondary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground">{listing.farmer_name}</h4>
                    <ShieldCheck className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {listing.farmer_location || "Kenya"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-yellow-600 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{rating}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">Verified Seller</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-secondary/10 relative z-10">
                <Button 
                  variant="outline" 
                  className="h-10 rounded-xl border-secondary/20 hover:bg-secondary/10 text-secondary font-bold text-xs gap-2"
                  onClick={() => navigate(`/farmer/${listing.farmer_id}`)}
                >
                  <Store className="w-4 h-4" />
                  Visit Farm Store
                </Button>
                <Button 
                  variant="ghost" 
                  className="h-10 rounded-xl hover:bg-secondary/10 text-secondary font-bold text-xs gap-2 group/btn"
                  onClick={() => onMessage(listing)}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Farmer
                </Button>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/5 text-blue-600 border border-blue-500/10 text-[10px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Direct FairTrade
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/5 text-green-600 border border-green-500/10 text-[10px] font-bold">
              <Clock className="w-3.5 h-3.5" /> 24h Farm-to-Gate
            </div>
          </div>
        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/40 z-20 flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 h-12 rounded-2xl border-border/60 font-bold hover:bg-primary/5 hover:text-primary transition-all shadow-soft"
            onClick={() => onAddToCart(listing)}
          >
            Add to Cart
          </Button>
          <Button 
            className="flex-[2] h-12 rounded-2xl shadow-glow font-black text-base transition-all hover:scale-[1.02] active:scale-95"
            onClick={() => onOrder(listing)}
          >
            Instant Purchase
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ListingDetailSheet;
