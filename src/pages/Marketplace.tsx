import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context-definition";
import { useCart } from "@/contexts/cart-context-definition";
import { useMarketplace, MarketplaceListing } from "@/hooks/useMarketplace";
import { useFavorites } from "@/hooks/useFavorites";
import OrderDialog from "@/components/marketplace/OrderDialog";
import ChatDialog from "@/components/marketplace/ChatDialog";
import ListingDetailSheet from "@/components/marketplace/ListingDetailSheet";
import ProduceCardSkeleton from "@/components/marketplace/ProduceCardSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
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
  ChevronDown,
  X,
  SlidersHorizontal,
  Star,
  ShieldCheck as ShieldIcon,
  Store,
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
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [chatReceiver, setChatReceiver] = useState<{ id: string; name: string } | null>(null);

  const [viewType, setViewType] = useState<"produce" | "shops">("produce");

  const { listings, loading, categories, refetch } = useMarketplace({
    category: selectedCategory,
    search: debouncedSearch,
  });

  const handleCardClick = (listing: MarketplaceListing) => {
    setSelectedListing(listing);
    setDetailSheetOpen(true);
  };

  // Unique locations from listings
  const locations = useMemo(() => {
    const locs = new Set(listings.map(l => l.farmer_location).filter(Boolean));
    return Array.from(locs);
  }, [listings]);

  // Client-side filtering for location and price (as the hook might only do basic cat/search)
  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const matchesPrice = l.price_per_unit >= priceRange[0] && l.price_per_unit <= priceRange[1];
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(l.farmer_location || "");
      return matchesPrice && matchesLocation;
    });
  }, [listings, priceRange, selectedLocations]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setDebouncedSearch(value);
  };

  const handleLocationToggle = (loc: string) => {
    setSelectedLocations(prev => 
      prev.includes(loc) ? prev.filter(l => l !== loc) : [...prev, loc]
    );
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
    <div className="min-h-screen bg-muted/30 pt-16 font-sans">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden md:block w-64 shrink-0 space-y-8">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-primary" />
                  Filters
                </h2>
                {(selectedCategory !== "All" || selectedLocations.length > 0) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] text-muted-foreground hover:text-primary"
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedLocations([]);
                      setPriceRange([0, 10000]);
                    }}
                  >
                    Reset
                  </Button>
                )}
              </div>

              <div className="space-y-8">
                {/* Category Filter */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Categories</h3>
                  <div className="flex flex-col gap-1">
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                          selectedCategory === cat 
                            ? "bg-primary text-primary-foreground font-bold shadow-md" 
                            : "hover:bg-primary/5 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {cat !== "All" && <span>{EMOJI_MAP[cat]}</span>}
                          {cat}
                        </span>
                        {selectedCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Price Range</h3>
                  <div className="px-2 pt-2">
                    <Slider
                      defaultValue={[0, 10000]}
                      max={10000}
                      step={100}
                      value={priceRange}
                      onValueChange={setPriceRange}
                      className="mb-4"
                    />
                    <div className="flex items-center justify-between text-xs font-bold text-primary">
                      <span>Ksh {priceRange[0]}</span>
                      <span>Ksh {priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Location Filter */}
                {locations.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Location</h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                      {locations.map((loc) => (
                        <label key={loc} className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 cursor-pointer group">
                          <Checkbox 
                            checked={selectedLocations.includes(loc)}
                            onCheckedChange={() => handleLocationToggle(loc)}
                          />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{loc}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Search Header */}
            <div className="flex flex-col sm:flex-row gap-4 bg-background/60 backdrop-blur-md p-4 rounded-2xl border border-border/40 shadow-soft">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="What are you looking for? (e.g. Tomatoes, Maize)"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-11 h-12 border-none bg-transparent text-base focus-visible:ring-0"
                />
              </div>
              <Button 
                variant="outline" 
                className="md:hidden h-12 px-6 rounded-xl border-border/50 gap-2"
                onClick={() => setShowMobileFilters(true)}
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button className="h-12 px-8 rounded-xl shadow-soft font-bold">
                Search
              </Button>
            </div>

            {/* Active Filter Badges */}
            {(selectedCategory !== "All" || selectedLocations.length > 0) && (
              <div className="flex flex-wrap gap-2 animate-fade-in">
                {selectedCategory !== "All" && (
                  <Badge variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-1 border-primary/20 bg-primary/5 text-primary">
                    {selectedCategory}
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full p-0 hover:bg-primary/20" onClick={() => setSelectedCategory("All")}>
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                )}
                {selectedLocations.map(loc => (
                  <Badge key={loc} variant="secondary" className="pl-3 pr-1 py-1 rounded-full gap-1 border-secondary/20 bg-secondary/5 text-secondary">
                    {loc}
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full p-0 hover:bg-secondary/20" onClick={() => handleLocationToggle(loc)}>
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProduceCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-background/40 rounded-3xl border border-dashed border-border/60">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
                  <Package className="w-10 h-10 text-muted-foreground/40" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">No matching produce</h3>
                <p className="text-muted-foreground mb-8 max-w-sm">
                  We couldn't find anything matching your current filters. Try adjusting your search or price range.
                </p>
                <Button 
                  variant="outline" 
                  className="rounded-xl px-8"
                  onClick={() => {
                    setSearchQuery("");
                    setDebouncedSearch("");
                    setSelectedCategory("All");
                    setSelectedLocations([]);
                    setPriceRange([0, 10000]);
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    Showing <span className="text-foreground font-bold">{filteredListings.length}</span> results
                  </p>
                  <Select defaultValue="newest">
                    <SelectTrigger className="w-[140px] h-9 text-xs border-none bg-transparent font-bold">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <ProduceCard 
                      key={listing.id} 
                      listing={listing} 
                      onOrder={handleOrderClick} 
                      onAddToCart={handleAddToCart}
                      onMessage={handleMessageClick}
                      onCardClick={() => handleCardClick(listing)}
                      isFavorite={isFavorite(listing.id)}
                      onToggleFavorite={() => toggleFavorite(listing.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <ListingDetailSheet 
        listing={selectedListing}
        open={detailSheetOpen}
        onOpenChange={setDetailSheetOpen}
        onOrder={handleOrderClick}
        onAddToCart={handleAddToCart}
        onMessage={handleMessageClick}
        isFavorite={selectedListing ? isFavorite(selectedListing.id) : false}
        onToggleFavorite={() => selectedListing && toggleFavorite(selectedListing.id)}
      />

      {/* Mobile Filters Drawer - Placeholder logic */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-[60] md:hidden bg-background animate-in slide-in-from-bottom duration-300">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-bold text-lg">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowMobileFilters(false)}>
                <X className="w-6 h-6" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Reuse sidebar contents here */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase text-muted-foreground">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {allCategories.map(cat => (
                    <Button 
                      key={cat} 
                      variant={selectedCategory === cat ? "default" : "outline"}
                      className="justify-start h-11 rounded-xl"
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat !== "All" && <span className="mr-2">{EMOJI_MAP[cat]}</span>}
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>
              {/* ... more mobile filters ... */}
            </div>
            <div className="p-4 border-t bg-muted/20">
              <Button className="w-full h-12 rounded-xl font-bold" onClick={() => setShowMobileFilters(false)}>
                Show {filteredListings.length} Results
              </Button>
            </div>
          </div>
        </div>
      )}

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
  onCardClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ProduceCard = ({ listing, onOrder, onAddToCart, onMessage, onCardClick, isFavorite, onToggleFavorite }: ProduceCardProps) => {
  const categoryEmoji = EMOJI_MAP[listing.category] || "📦";
  
  // Mock rating data for UI polish
  const rating = useMemo(() => (Math.random() * (5 - 4) + 4).toFixed(1), []);
  const reviewCount = useMemo(() => Math.floor(Math.random() * 50) + 5, []);

  return (
    <Card 
      className="overflow-hidden border-border/40 bg-background/60 backdrop-blur-sm hover:border-primary/30 hover:shadow-elevated transition-all duration-300 group rounded-2xl flex flex-col h-full cursor-pointer"
      onClick={onCardClick}
    >
      <div className="relative h-52 bg-muted overflow-hidden">
        {listing.image_url ? (
          <img
            src={listing.image_url}
            alt={listing.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-muted to-muted/50">
            {categoryEmoji}
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge className="bg-background/90 text-foreground backdrop-blur-md border-none shadow-sm font-bold px-3">
            {listing.category}
          </Badge>
          {listing.quantity_available < 10 && (
            <Badge variant="destructive" className="font-bold shadow-sm animate-pulse">
              Low Stock
            </Badge>
          )}
        </div>
        
        {/* Action Buttons Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-xl bg-background/90 backdrop-blur-md shadow-soft hover:bg-primary hover:text-white transition-all"
            onClick={() => onMessage(listing)}
            title="Chat with Farmer"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className={`h-10 w-10 rounded-xl bg-background/90 backdrop-blur-md shadow-soft transition-all hover:scale-110 ${isFavorite ? 'text-red-500' : 'text-muted-foreground'}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            title="Add to Favorites"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Price Tag Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-display font-bold text-white tracking-tight">
              Ksh {listing.price_per_unit}
            </span>
            <span className="text-xs text-white/80 font-medium">/{listing.unit}</span>
          </div>
        </div>
      </div>

      <CardContent className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-display font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {listing.name}
          </h3>
          <div className="flex items-center gap-1 bg-yellow-400/10 text-yellow-600 px-2 py-0.5 rounded-lg text-[10px] font-bold">
            <Star className="w-3 h-3 fill-current" />
            {rating}
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed min-h-[40px]">
          {listing.description || `Premium quality ${listing.name.toLowerCase()} harvested fresh from the fields of ${listing.farmer_location}.`}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5 py-3 border-y border-border/40 mt-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center relative">
              <Leaf className="w-3 h-3 text-primary" />
              <ShieldIcon className="absolute -bottom-1 -right-1 w-2.5 h-2.5 text-blue-500 bg-background rounded-full" />
            </div>
            <span className="truncate">{listing.farmer_name}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center">
              <MapPin className="w-3 h-3 text-secondary" />
            </div>
            <span className="truncate">{listing.farmer_location || "Kenya"}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 rounded-xl h-11 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all font-bold group/btn"
            onClick={() => handleAddToCart(listing)}
          >
            <ShoppingCart className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
            Cart
          </Button>
          <Button 
            className="flex-1 rounded-xl h-11 shadow-soft font-bold transition-all hover:scale-105 active:scale-95" 
            onClick={() => onOrder(listing)}
          >
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Marketplace;
