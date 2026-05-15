import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
}

export const useMarketplace = (options: UseMarketplaceOptions = {}) => {
  const { toast } = useToast();
  const limit = options.limit || 12;

  // Query for categories
  const { data: categories = [] } = useQuery({
    queryKey: ["marketplace-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("produce_listings")
        .select("category")
        .eq("is_available", true);

      if (error) throw error;
      return Array.from(new Set((data || []).map((item) => item.category))).sort();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Infinite query for listings
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["marketplace-listings", options.category, options.search],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from("marketplace_view")
        .select("*")
        .eq("is_available", true)
        .gt("quantity_available", 0)
        .order("created_at", { ascending: false })
        .range(pageParam, pageParam + limit - 1);

      if (options.category && options.category !== "All") {
        query = query.eq("category", options.category);
      }

      if (options.search) {
        query = query.ilike("name", `%${options.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).map((item) => ({
        ...item,
        farmer_name: (item as any).farmer_name || "Local Farmer",
        farmer_location: (item as any).farmer_location || "Kenya",
      })) as MarketplaceListing[];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === limit ? allPages.length * limit : undefined;
    },
  });

  const listings = data?.pages.flat() || [];

  return {
    listings,
    loading: isLoading || isFetchingNextPage,
    categories,
    hasMore: !!hasNextPage,
    loadMore: fetchNextPage,
    refetch,
  };
};

