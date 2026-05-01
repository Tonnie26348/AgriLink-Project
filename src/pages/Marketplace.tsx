import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth-context-definition";
import { useCart } from "@/contexts/cart-context-definition";
import { useMarketplace, MarketplaceListing } from "@/hooks/useMarketplace";
import { useFavorites } from "@/hooks/useFavorites";
import OrderDialog from "@/components/marketplace/OrderDialog";
import ChatDialog from "@/components/marketplace/ChatDialog";
import ProduceCardSkeleton from "@/components/marketplace/ProduceCardSkeleton";
import { ProduceCard } from "@/components/marketplace/ProduceCard";
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
  Search,
  Package,
  Filter,
  ArrowLeft,
  X,
  SlidersHorizontal,
  Star,
  Loader2,
} from "lucide-react";

const EMOJI_MAP: Record<string, string> = {
  Vegetables: "🥬",
  Fruits: "🍎",
  Grains: "🌾",
  Pulses: "🫘",
  Dairy: "🥛",
  Tubers: "🥔",
  Spices: "🌶️",
  Herbs: "🌿",
  Other: "📦",
};

import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Lazy Load heavy components
const MarketMap = lazy(() => import("@/components/marketplace/MarketMap").then(m => ({ default: m.MarketMap })));
const ListingDetailSheet = lazy(() => import("@/components/marketplace/ListingDetailSheet"));

const Marketplace = () => {
  const { user, userRole } = useAuth();
  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [selectedListing, setSelectedListing] = useState<MarketplaceListing | null>(null);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [chatReceiver, setChatReceiver] = useState<{ id: string; name: string } | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [viewType, setViewType] = useState<"produce" | "shops">("produce");

  const { listings, loading, categories, hasMore, loadMore, refetch } = useMarketplace({
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

  // Client-side filtering and sorting
  const filteredListings = useMemo(() => {
    const result = listings.filter(l => {
      const matchesPrice = l.price_per_unit >= priceRange[0] && l.price_per_unit <= priceRange[1];
      const matchesLocation = selectedLocations.length === 0 || selectedLocations.includes(l.farmer_location || "");
      const matchesRating = minRating === null || (l.rating || 0) >= minRating;
      return matchesPrice && matchesLocation && matchesRating;
    });

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price_per_unit - b.price_per_unit);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price_per_unit - a.price_per_unit);
    } else {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [listings, priceRange, selectedLocations, minRating, sortBy]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
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

                {/* Rating Filter */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Minimum Rating</h3>
                  <div className="flex items-center gap-2">
                    {[4, 3, 2, 1].map((star) => (
                      <Button
                        key={star}
                        variant={minRating === star ? "default" : "outline"}
                        size="sm"
                        className={`flex-1 gap-1 rounded-lg ${minRating === star ? 'shadow-md font-bold' : ''}`}
                        onClick={() => setMinRating(minRating === star ? null : star)}
                      >
                        {star}<Star className={`w-3 h-3 ${minRating === star ? 'fill-current' : ''}`} />
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">In Stock Only</h3>
                    <Checkbox id="in-stock" defaultChecked />
                  </div>
                </div>
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

            {/* Market Map Section */}
            <Suspense fallback={<div className="h-64 bg-muted animate-pulse rounded-2xl" />}>
              {!loading && listings.length > 0 && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <MarketMap 
                    listings={listings} 
                    onLocationSelect={handleLocationToggle}
                    selectedLocations={selectedLocations}
                  />
                </div>
              )}
            </Suspense>

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
                  <Select defaultValue="newest" onValueChange={setSortBy}>
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

                {hasMore && (
                  <div className="flex justify-center pt-8 pb-12">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="rounded-xl px-12 border-primary/20 text-primary hover:bg-primary/5 font-bold"
                      onClick={loadMore}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load More Produce"
                      )}
                    </Button>
                  </div>
                )}
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
          onOrder={handleOrderClick}
          onAddToCart={handleAddToCart}
          onMessage={handleMessageClick}
          isFavorite={selectedListing ? isFavorite(selectedListing.id) : false}
          onToggleFavorite={() => selectedListing && toggleFavorite(selectedListing.id)}
        />
      </Suspense>

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

              {/* Price Filter Mobile */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase text-muted-foreground">Price Range</h3>
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

              {/* Rating Filter Mobile */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase text-muted-foreground">Minimum Rating</h3>
                <div className="flex items-center gap-2">
                  {[4, 3, 2, 1].map((star) => (
                    <Button
                      key={star}
                      variant={minRating === star ? "default" : "outline"}
                      size="sm"
                      className="flex-1 gap-1 rounded-xl h-11"
                      onClick={() => setMinRating(minRating === star ? null : star)}
                    >
                      {star}<Star className={`w-3 h-3 ${minRating === star ? 'fill-current' : ''}`} />
                    </Button>
                  ))}
                </div>
              </div>
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

export default Marketplace;
