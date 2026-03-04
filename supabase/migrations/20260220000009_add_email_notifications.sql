
-- Add email_notifications to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;

-- Update the RPC to handle email_notifications
CREATE OR REPLACE FUNCTION public.update_user_profile(
    p_full_name TEXT DEFAULT NULL,
    p_phone TEXT DEFAULT NULL,
    p_location TEXT DEFAULT NULL,
    p_avatar_url TEXT DEFAULT NULL,
    p_email_notifications BOOLEAN DEFAULT NULL
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
        email_notifications,
        updated_at
    )
    VALUES (
        auth.uid(), 
        p_full_name, 
        p_phone, 
        p_location, 
        p_avatar_url, 
        COALESCE(p_email_notifications, true),
        now()
    )
    ON CONFLICT (user_id) DO UPDATE 
    SET 
        full_name = COALESCE(p_full_name, profiles.full_name),
        phone = COALESCE(p_phone, profiles.phone),
        location = COALESCE(p_location, profiles.location),
        avatar_url = COALESCE(p_avatar_url, profiles.avatar_url),
        email_notifications = COALESCE(p_email_notifications, profiles.email_notifications),
        updated_at = now();
END;
$$;
