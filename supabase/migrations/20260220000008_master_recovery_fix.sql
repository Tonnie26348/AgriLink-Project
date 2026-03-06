
-- AgriLink Master Recovery Fix (V2 - Idempotent)
-- Resolves: 42703 (Undefined Column), 42710 (Duplicate Policy), and Storage Issues

-- 1. Ensure Profiles Table Structure is Exact
DO $$ 
BEGIN
    -- Add columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='location') THEN
        ALTER TABLE public.profiles ADD COLUMN location TEXT;
    END IF;
END $$;

-- 2. Redefine RPC with ULTIMATE Clarity
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
DECLARE
    current_uid UUID := auth.uid();
BEGIN
    IF current_uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

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
        current_uid, 
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

-- 3. Reset Storage and Permissions
GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_profile(TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO service_role;

-- Ensure buckets exist
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-images', 'profile-images', true) ON CONFLICT (id) DO UPDATE SET public = true;
INSERT INTO storage.buckets (id, name, public) VALUES ('produce-images', 'produce-images', true) ON CONFLICT (id) DO UPDATE SET public = true;

-- Clean up ALL possible conflicting policies
DROP POLICY IF EXISTS "Anyone can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile image" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are public" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Recreate policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING (true);

CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id IN ('profile-images', 'produce-images'));

CREATE POLICY "Authenticated Update" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id IN ('profile-images', 'produce-images'));

CREATE POLICY "Authenticated Delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id IN ('profile-images', 'produce-images'));
