
-- 1. Ensure storage buckets exist and are public
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-images', 'profile-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('produce-images', 'produce-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Storage Policies for profile-images
DROP POLICY IF EXISTS "Authenticated users can upload profile images" ON storage.objects;
CREATE POLICY "Authenticated users can upload profile images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
CREATE POLICY "Users can update their own profile images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Profile images are public" ON storage.objects;
CREATE POLICY "Profile images are public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-images');

-- 3. Storage Policies for produce-images
DROP POLICY IF EXISTS "Farmers can upload produce images" ON storage.objects;
CREATE POLICY "Farmers can upload produce images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'produce-images' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Produce images are public" ON storage.objects;
CREATE POLICY "Produce images are public"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'produce-images');

-- 4. Robust RLS for Produce Listings
ALTER TABLE public.produce_listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can insert their own produce" ON public.produce_listings;
CREATE POLICY "Farmers can insert their own produce"
ON public.produce_listings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can update their own produce" ON public.produce_listings;
CREATE POLICY "Farmers can update their own produce"
ON public.produce_listings FOR UPDATE
TO authenticated
USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Farmers can delete their own produce" ON public.produce_listings;
CREATE POLICY "Farmers can delete their own produce"
ON public.produce_listings FOR DELETE
TO authenticated
USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Produce listings are viewable by everyone" ON public.produce_listings;
CREATE POLICY "Produce listings are viewable by everyone"
ON public.produce_listings FOR SELECT
TO public
USING (true);

-- 5. Robust RLS for Orders and Order Items
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers can insert their own orders" ON public.orders;
CREATE POLICY "Buyers can insert their own orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = buyer_id);

DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

DROP POLICY IF EXISTS "Buyers can insert items for their own orders" ON public.order_items;
CREATE POLICY "Buyers can insert items for their own orders"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE id = order_id AND buyer_id = auth.uid()
    )
);

DROP POLICY IF EXISTS "Users can view items for their own orders" ON public.order_items;
CREATE POLICY "Users can view items for their own orders"
ON public.order_items FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.orders
        WHERE id = order_id AND (buyer_id = auth.uid() OR farmer_id = auth.uid())
    )
);

-- 6. RPC Fix: Ensure the function name and parameters match what useProfile calls
-- useProfile calls: p_full_name, p_phone, p_location, p_avatar_url
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
    INSERT INTO public.profiles (user_id, full_name, phone, location, avatar_url, updated_at)
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
