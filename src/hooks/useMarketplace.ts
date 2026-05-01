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
  limit?: number;
  offset?: number;
}

export const useMarketplace = (options: UseMarketplaceOptions = {}) => {
  const { toast } = useToast();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const [offset, setOffset] = useState(0);
  const limit = options.limit || 12;

  const fetchListings = useCallback(async (currentOffset: number, isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true);
        setOffset(0);
      }
      
      // Use the optimized view
      let query = supabase
        .from("marketplace_view")
        .select("*")
        .eq("is_available", true)
        .gt("quantity_available", 0)
        .order("created_at", { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (options.category && options.category !== "All") {
        query = query.eq("category", options.category);
      }

      if (options.search) {
        query = query.ilike("name", `%${options.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedListings = (data || []).map((item) => ({
        ...item,
        farmer_name: (item as unknown as { farmer_name?: string }).farmer_name || "Local Farmer",
        farmer_location: (item as unknown as { farmer_location?: string }).farmer_location || "Kenya",
      })) as MarketplaceListing[];

      if (isLoadMore) {
        setListings(prev => [...prev, ...formattedListings]);
      } else {
        setListings(formattedListings);
      }

      setHasMore(formattedListings.length === limit);
    } catch (error: unknown) {
      console.error("Error fetching marketplace listings:", error);
      toast({
        title: "Error fetching listings",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [options.category, options.search, limit, toast]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextOffset = offset + limit;
      setOffset(nextOffset);
      fetchListings(nextOffset, true);
    }
  }, [loading, hasMore, offset, limit, fetchListings]);

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
    fetchListings(0, false);

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
          fetchListings(0, false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options.category, options.search, fetchListings]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    listings,
    loading,
    categories,
    hasMore,
    loadMore,
    refetch: () => fetchListings(0, false),
  };
};
