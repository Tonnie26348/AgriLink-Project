import { useState, useEffect, useCallback } from "react";
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
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("buyer_id", user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error: unknown) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save items.",
        variant: "destructive",
      });
      return;
    }

    try {
      const existing = favorites.find(f => f.listing_id === listingId);

      if (existing) {
        // Remove favorite
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;

        setFavorites(prev => prev.filter(f => f.id !== existing.id));
        toast({
          title: "Removed from favorites",
          description: "Item removed from your saved list.",
        });
      } else {
        // Add favorite
        const { data, error } = await supabase
          .from("favorites")
          .insert({ buyer_id: user.id, listing_id: listingId })
          .select()
          .single();

        if (error) throw error;

        setFavorites(prev => [...prev, data]);
        toast({
          title: "Added to favorites",
          description: "Item saved to your favorites list.",
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      toast({
        title: "Error updating favorites",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite: (listingId: string) => favorites.some(f => f.listing_id === listingId),
  };
};
