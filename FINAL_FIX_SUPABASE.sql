
-- AGRI-LINK COMPREHENSIVE FIX (Run this in Supabase SQL Editor)

-- 1. Ensure Crop Diagnosis Table Exists
CREATE TABLE IF NOT EXISTS public.crop_diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    crop_type TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    confidence NUMERIC(3,2) NOT NULL,
    treatment_advice TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Ensure Storage Buckets Exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('produce-images', 'produce-images', true),
  ('profile-images', 'profile-images', true),
  ('crop-diagnoses', 'crop-diagnoses', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Storage Policies for Crop Diagnosis
DROP POLICY IF EXISTS "Farmers can upload diagnoses" ON storage.objects;
DROP POLICY IF EXISTS "Everyone can view diagnoses" ON storage.objects;

CREATE POLICY "Everyone can view diagnoses" ON storage.objects 
FOR SELECT USING (bucket_id = 'crop-diagnoses');

CREATE POLICY "Farmers can upload diagnoses" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'crop-diagnoses');

-- 4. Table RLS for Crop Diagnosis
ALTER TABLE public.crop_diagnoses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Farmers can view own diagnoses" ON public.crop_diagnoses;
DROP POLICY IF EXISTS "Farmers can insert own diagnoses" ON public.crop_diagnoses;

CREATE POLICY "Farmers can view own diagnoses" ON public.crop_diagnoses 
FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own diagnoses" ON public.crop_diagnoses 
FOR INSERT WITH CHECK (auth.uid() = farmer_id);

-- 5. Fix Profiles & Produce Policies (Consolidated)
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public listings viewable" ON public.produce_listings FOR SELECT USING (true);

-- 6. Robust User Creation & Role Assignment Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role public.app_role;
BEGIN
    -- Extract role from raw_user_meta_data, default to buyer if missing or invalid
    BEGIN
        user_role := (NEW.raw_user_meta_data->>'role')::public.app_role;
    EXCEPTION WHEN OTHERS THEN
        user_role := 'buyer'::public.app_role;
    END;

    IF user_role IS NULL THEN
        user_role := 'buyer'::public.app_role;
    END IF;

    -- Insert into profiles
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'))
    ON CONFLICT (user_id) DO NOTHING;

    -- Insert into user_roles
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role)
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
