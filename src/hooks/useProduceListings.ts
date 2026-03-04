import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context-definition";
import { useToast } from "@/hooks/use-toast";
import { resizeImage } from "@/lib/image-utils";
import { PostgrestError } from "@supabase/supabase-js";

export interface ProduceListing {
  id: string;
  farmer_id: string;
  name: string;
  description: string | null;
  category: string;
  price_per_unit: number;
  unit: string;
  quantity_available: number;
  image_url: string | null;
  is_available: boolean;
  harvest_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateListingInput {
  name: string;
  description?: string;
  category: string;
  price_per_unit: number;
  unit: string;
  quantity_available: number;
  harvest_date?: string;
  image_url?: string;
}

export const useProduceListings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<ProduceListing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("produce_listings")
        .select("*")
        .eq("farmer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error: unknown) {
      toast({
        title: "Error fetching listings",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const createListing = async (input: CreateListingInput) => {
    if (!user) {
      return { error: new Error("Not authenticated") };
    }

    // Create a controller to handle a timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out. Please check your internet and Supabase RLS policies.")), 15000)
    );

    try {
      console.log("CreateListing: Attempting insert...", input);
      
      const insertPromise = supabase
        .from("produce_listings")
        .insert({
          farmer_id: user.id,
          name: input.name,
          description: input.description || null,
          category: input.category,
          price_per_unit: input.price_per_unit,
          unit: input.unit,
          quantity_available: input.quantity_available,
          harvest_date: input.harvest_date || null,
          image_url: input.image_url || null,
        })
        .select();

      // Race the insert against our 15-second timeout
      const { data, error } = (await Promise.race([insertPromise, timeoutPromise])) as { data: ProduceListing[] | null; error: PostgrestError | null };

      if (error) {
        console.error("CreateListing: Supabase error:", error);
        throw error;
      }

      const newListing = data?.[0];
      if (newListing) {
        setListings((prev) => [newListing, ...prev]);
      }
      
      toast({
        title: "Listing created!",
        description: `${input.name} has been added to your listings.`,
      });
      
      return { data: newListing, error: null };
    } catch (error: unknown) {
      const err = error as Error;
      console.error("CreateListing: Process failed:", err);
      toast({
        title: "Could not add listing",
        description: err.message || "The database didn't respond in time.",
        variant: "destructive",
      });
      return { data: null, error: err };
    }
  };

  const updateListing = async (id: string, updates: Partial<CreateListingInput> & { is_available?: boolean }) => {
    try {
      const { data, error } = await supabase
        .from("produce_listings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setListings((prev) =>
        prev.map((listing) => (listing.id === id ? data : listing))
      );
      toast({
        title: "Listing updated!",
        description: "Your changes have been saved.",
      });
      return { data, error: null };
    } catch (error: unknown) {
      toast({
        title: "Error updating listing",
        description: (error as Error).message,
        variant: "destructive",
      });
      return { data: null, error: error as Error };
    }
  };

  const deleteListing = async (id: string) => {
    try {
      const { error } = await supabase
        .from("produce_listings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setListings((prev) => prev.filter((listing) => listing.id !== id));
      toast({
        title: "Listing deleted",
        description: "The listing has been removed.",
      });
      return { error: null };
    } catch (error: unknown) {
      toast({
        title: "Error deleting listing",
        description: (error as Error).message,
        variant: "destructive",
      });
      return { error: error as Error };
    }
  };

  const toggleAvailability = async (id: string, isAvailable: boolean) => {
    return updateListing(id, { is_available: isAvailable });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      // Compress and resize image before upload
      const resizedBlob = await resizeImage(file);
      const fileExt = "jpg"; // We convert to jpeg in resizeImage
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("produce-images")
        .upload(fileName, resizedBlob, {
          contentType: "image/jpeg",
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("produce-images")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: unknown) {
      toast({
        title: "Error uploading image",
        description: (error as Error).message,
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchListings();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('produce-listings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'produce_listings',
          filter: `farmer_id=eq.${user?.id}`
        },
        () => {
          console.log("Real-time listing update received");
          fetchListings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchListings, user?.id]);

  return {
    listings,
    loading,
    createListing,
    updateListing,
    deleteListing,
    toggleAvailability,
    uploadImage,
    refetch: fetchListings,
  };
};
