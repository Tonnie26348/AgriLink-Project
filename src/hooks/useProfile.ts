import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context-definition";
import { useToast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  location: string | null;
  avatar_url: string | null;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (isMounted = true) => {
    if (!user) {
      if (isMounted) setLoading(false);
      return;
    }

    try {
      if (isMounted) setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (isMounted) {
        setProfile(data);
      }
    } catch (error: unknown) {
      console.error("Error fetching profile:", error);
      if (isMounted) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        toast({
          title: "Error fetching profile",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [user, toast]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return false;

    try {
      setLoading(true);
      
      // Use the RPC for maximum reliability
      const { error: rpcError } = await supabase.rpc('update_user_profile', {
        p_full_name: updates.full_name,
        p_phone: updates.phone,
        p_location: updates.location,
        p_avatar_url: updates.avatar_url,
        p_email_notifications: updates.email_notifications
      });

      if (rpcError) throw rpcError;

      // Final step: manually fetch the latest profile data
      await fetchProfile();

      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      return true;
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Update failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(fileName, file, {
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("profile-images")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error: unknown) {
      console.error("Error uploading avatar:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
      toast({
        title: "Error uploading image",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchProfile(isMounted);
    return () => { isMounted = false; };
  }, [fetchProfile]);

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    refreshProfile: () => fetchProfile(true),
  };
};
