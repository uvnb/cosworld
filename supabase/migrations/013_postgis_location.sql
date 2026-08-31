-- 1. Bật extension PostGIS cho Supabase/PostgreSQL
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Thêm cột location vào bảng listings (nếu chưa có)
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT, 4326);

-- Tạo Index không gian (Spatial Index) để tìm sản phẩm theo tọa độ siêu nhanh
CREATE INDEX IF NOT EXISTS idx_listings_location ON public.listings USING GIST(location);

-- 3. FUNCTION LẤY SẢN PHẨM GẦN NHẤT (ĐÃ XỬ LÝ FUZZY LOCATION)
CREATE OR REPLACE FUNCTION get_nearby_listings(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION DEFAULT 10000,
  filter_category TEXT DEFAULT NULL,
  filter_query TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  price_per_day NUMERIC,
  sale_price NUMERIC,
  city TEXT,
  listing_type TEXT,
  size TEXT,
  created_at TIMESTAMPTZ,
  owner_id UUID,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.title,
    p.price_per_day,
    p.sale_price,
    p.city,
    p.listing_type,
    p.size,
    p.created_at,
    p.owner_id,
    ST_Distance(p.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) AS distance_meters
  FROM public.listings p
  WHERE p.location IS NOT NULL
    AND ST_DWithin(p.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_meters)
    AND p.status = 'active'
    AND (filter_category IS NULL OR p.category = filter_category)
    AND (filter_query IS NULL OR p.title ILIKE '%' || filter_query || '%')
  ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql;
