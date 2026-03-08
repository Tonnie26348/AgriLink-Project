import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context-definition";
import { useToast } from "@/hooks/use-toast";

export interface MarketplaceListing {
  id: string;
  farmer_id: string;
  name: string;
  description: string | null;
  category: string;
  price_per_unit: number;
  unit: string;
  quantity_available: number;
  image_url: string | null;
  harvest_date: string | null;
  created_at: string;
  is_bulk_available: boolean;
  bulk_min_quantity: number;
  bulk_discount_percentage: number;
  farmer_name?: string;
  farmer_location?: string;
  rating?: number;
  review_count?: number;
}

interface UseMarketplaceOptions {
  category?: string;
  search?: string;
}

interface MarketplaceItemResponse extends MarketplaceListing {
  profiles: {
    full_name: string | null;
    location: string | null;
  } | null;
}

export const useMarketplace = (options: UseMarketplaceOptions = {}) => {
  const { toast } = useToast();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from("produce_listings")
        .select(`
          *,
          profiles!produce_listings_farmer_id_fkey (
            full_name,
            location
          )
        `)
        .eq("is_available", true)
        .gt("quantity_available", 0)
        .order("created_at", { ascending: false });

      if (options.category && options.category !== "All") {
        query = query.eq("category", options.category);
      }

      if (options.search) {
        query = query.ilike("name", `%${options.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error fetching listings:", error);
        throw error;
      }

      // Fetch ratings for these listings
      const listingIds = (data || []).map(l => l.id);
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("listing_id, rating")
        .in("listing_id", listingIds);

      // Aggregate ratings
      const ratingMap: Record<string, { total: number, count: number }> = {};
      reviewsData?.forEach(rev => {
        if (!ratingMap[rev.listing_id]) {
          ratingMap[rev.listing_id] = { total: 0, count: 0 };
        }
        ratingMap[rev.listing_id].total += rev.rating;
        ratingMap[rev.listing_id].count += 1;
      });

      const formattedListings = (data as unknown as MarketplaceItemResponse[] || []).map((item) => {
        const ratingStats = ratingMap[item.id];
        return {
          ...item,
          farmer_name: item.profiles?.full_name || "Local Farmer",
          farmer_location: item.profiles?.location || "Kenya",
          rating: ratingStats ? Number((ratingStats.total / ratingStats.count).toFixed(1)) : undefined,
          review_count: ratingStats ? ratingStats.count : 0,
        };
      });
      setListings(formattedListings);
    } catch (error: unknown) {
      console.error("Error fetching marketplace listings:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      const errorCode = (error && typeof error === 'object' && 'code' in error) ? String((error as Record<string, unknown>).code) : "No code";
      toast({
        title: "Error fetching listings",
        description: `${errorMessage} (Code: ${errorCode})`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [options.category, options.search, toast]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("produce_listings")
        .select("category")
        .eq("is_available", true);

      if (error) throw error;

      const uniqueCategories = Array.from(
        new Set((data || []).map((item) => item.category))
      ).sort();
      
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    fetchListings();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('marketplace-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produce_listings'
        },
        () => {
          console.log("Real-time marketplace update received");
          fetchListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchListings]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    listings,
    loading,
    categories,
    refetch: fetchListings,
  };
};
