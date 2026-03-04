
-- Final fix for the update_user_profile RPC syntax
-- This version explicitly qualifies all columns to avoid 42703 ambiguity
CREATE OR REPLACE FUNCTION public.update_user_profile(
    p_full_name TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        user_id, 
        full_name, 
        phone, 
        location, 
        avatar_url, 
        updated_at
    )
    VALUES (
        auth.uid(), 
        p_full_name, 
        p_phone, 
        p_location, 
        p_avatar_url, 
        now()
    )
    ON CONFLICT (user_id) DO UPDATE 
    SET 
        full_name = COALESCE(p_full_name, profiles.full_name),
        phone = COALESCE(p_phone, profiles.phone),
        location = COALESCE(p_location, profiles.location),
        avatar_url = COALESCE(p_avatar_url, profiles.avatar_url),
        updated_at = now();
END;
$$;

-- Ensure permissions are correct
GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, TEXT, TEXT, TEXT) TO service_role;
