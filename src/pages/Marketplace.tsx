import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context-definition";
import { useCart } from "@/contexts/cart-context-definition";
import { useMarketplace, MarketplaceListing } from "@/hooks/useMarketplace";
import { useFavorites } from "@/hooks/useFavorites";
import OrderDialog from "@/components/marketplace/OrderDialog";
import ChatDialog from "@/components/marketplace/ChatDialog";
import ProduceCardSkeleton from "@/components/marketplace/ProduceCardSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Leaf,
  Search,
  MapPin,
  Package,
  Filter,
  Loader2,
  ShoppingCart,
  ArrowLeft,
  Calendar,
  MessageCircle,
  Heart,
} from "lucide-react";

const EMOJI_MAP: Record<string, string> = {
  Vegetables: "🥬",
  Fruits: "🍎",
  Grains: "🌾",
  Pulses: "🫘",
  Dairy: "🥛",
  Spices: "🌶️",
  Herbs: "🌿",
  Tubers: "🥔",
  Other: "📦",
};

import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Marketplace = () => {
  const { user, userRole } = useAuth();
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [chatReceiver, setChatReceiver] = useState<{ id: string; name: string } | null>(null);

  const { listings, loading, categories, refetch } = useMarketplace({
    category: selectedCategory,
    search: debouncedSearch,
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    // Simple debounce
    setTimeout(() => setDebouncedSearch(value), 300);
  };

  const handleOrderClick = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setOrderDialogOpen(true);
  };

  const handleMessageClick = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setChatReceiver({
      id: listing.farmer_id,
      name: listing.farmer_name || "Local Farmer",
    });
    setChatDialogOpen(true);
  };

  const handleAddToCart = (listing: MarketplaceListing) => {
    addItem({
      listingId: listing.id,
      name: listing.name,
      pricePerUnit: listing.price_per_unit,
      unit: listing.unit,
      farmerId: listing.farmer_id,
      farmerName: listing.farmer_name || "Local Farmer",
      imageUrl: listing.image_url,
      maxQuantity: listing.quantity_available,
    });
    toast.success(`${listing.name} added to cart!`);
  };

  const allCategories = ["All", ...categories];

  return (
    <div className="min-h-screen bg-muted/30 pt-16">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-foreground mb-3">
            Fresh Farm Marketplace 🌽
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse fresh produce directly from local farmers. Quality guaranteed, fair prices.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for produce..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-11 h-12 text-base"
            />
          </div>
          <div className="flex gap-3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] h-12">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat !== "All" && EMOJI_MAP[cat]} {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allCategories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat !== "All" && <span className="mr-1">{EMOJI_MAP[cat]}</span>}
              {cat}
            </Badge>
          ))}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProduceCardSkeleton key={i} />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No produce found</h3>
            <p className="text-muted-foreground mb-4">
              {debouncedSearch
                ? `No results for "${debouncedSearch}"`
                : "Check back soon for fresh listings from farmers"}
            </p>
            {debouncedSearch && (
              <Button variant="outline" onClick={() => { setSearchQuery(""); setDebouncedSearch(""); }}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {listings.length} {listings.length === 1 ? "item" : "items"} available
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <ProduceCard 
                  key={listing.id} 
                  listing={listing} 
                  onOrder={handleOrderClick} 
                  onAddToCart={handleAddToCart}
                  onMessage={handleMessageClick}
                  isFavorite={isFavorite(listing.id)}
                  onToggleFavorite={() => toggleFavorite(listing.id)}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <OrderDialog
        listing={selectedListing}
        open={orderDialogOpen}
        onOpenChange={setOrderDialogOpen}
        onSuccess={refetch}
      />

      {chatReceiver && (
        <ChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          receiverId={chatReceiver.id}
          receiverName={chatReceiver.name}
          listingId={selectedListing?.id}
          listingName={selectedListing?.name}
        />
      )}
      <Footer />
    </div>
  );
};

interface ProduceCardProps {
  listing: MarketplaceListing;
  onOrder: (listing: MarketplaceListing) => void;
  onAddToCart: (listing: MarketplaceListing) => void;
  onMessage: (listing: MarketplaceListing) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ProduceCard = ({ listing, onOrder, onAddToCart, onMessage, isFavorite, onToggleFavorite }: ProduceCardProps) => {
  const categoryEmoji = EMOJI_MAP[listing.category] || "📦";

  return (
    <Card className="overflow-hidden border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300 group relative">
      <div className="relative h-48 bg-muted">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {categoryEmoji}
          </div>
        )}
        <Badge className="absolute top-3 left-3 bg-background/90 text-foreground">
          {listing.category}
        </Badge>
        
        {/* Action Buttons Overlay */}
        <div className="absolute top-3 right-3 flex gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-soft"
            onClick={() => onMessage(listing)}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className={`h-8 w-8 rounded-full shadow-soft transition-all ${isFavorite ? 'text-red-500 opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">
          {listing.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {listing.description || `Fresh ${listing.name.toLowerCase()} from local farm`}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Leaf className="w-3 h-3" />
            {listing.farmer_name}
          </span>
          {listing.farmer_location && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {listing.farmer_location}
              </span>
            </>
          )}
        </div>

        {listing.harvest_date && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3 h-3" />
            Harvested: {new Date(listing.harvest_date).toLocaleDateString()}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-primary">
              Ksh{listing.price_per_unit}
            </span>
            <span className="text-sm text-muted-foreground">/{listing.unit}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {listing.quantity_available} {listing.unit} left
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onAddToCart(listing)}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add
          </Button>
          <Button size="sm" className="flex-1" onClick={() => onOrder(listing)}>
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Marketplace;
