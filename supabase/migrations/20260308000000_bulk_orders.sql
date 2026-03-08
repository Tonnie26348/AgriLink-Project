-- Bulk Order System Support
ALTER TABLE public.produce_listings 
ADD COLUMN IF NOT EXISTS is_bulk_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS bulk_min_quantity INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS bulk_discount_percentage INTEGER DEFAULT 10;

-- Comments explaining the new columns
COMMENT ON COLUMN public.produce_listings.is_bulk_available IS 'Whether the item can be ordered in bulk';
COMMENT ON COLUMN public.produce_listings.bulk_min_quantity IS 'Minimum quantity required for a bulk discount';
COMMENT ON COLUMN public.produce_listings.bulk_discount_percentage IS 'Percentage discount for bulk orders';
