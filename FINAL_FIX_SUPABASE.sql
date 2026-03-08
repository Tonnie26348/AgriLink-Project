
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
