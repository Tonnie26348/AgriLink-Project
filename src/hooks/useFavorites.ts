import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context-definition";
import { useToast } from "@/hooks/use-toast";

export interface Favorite {
  id: string;
  listing_id: string;
  created_at: string;
}

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("buyer_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const toggleMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!user) throw new Error("Sign in required");

      const existing = favorites.find((f) => f.listing_id === listingId);

      if (existing) {
        const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
        if (error) throw error;
        return { type: "removed", id: existing.id };
      } else {
        const { data, error } = await supabase
          .from("favorites")
          .insert({ buyer_id: user.id, listing_id: listingId })
          .select()
          .single();
        if (error) throw error;
        return { type: "added", data };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast({
        title: result.type === "added" ? "Added to favorites" : "Removed from favorites",
        description: result.type === "added" ? "Item saved to your favorites list." : "Item removed from your saved list.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating favorites",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    favorites,
    loading: isLoading,
    toggleFavorite: (listingId: string) => toggleMutation.mutate(listingId),
    isFavorite: (listingId: string) => favorites.some((f) => f.listing_id === listingId),
  };
};

