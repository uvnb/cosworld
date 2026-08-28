CREATE OR REPLACE FUNCTION search_listings(
    lat double precision,
    lng double precision,
    radius_meters double precision,
    search_query text DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    title text,
    price_per_day integer,
    sale_price integer,
    city text,
    listing_type text,
    size text,
    created_at timestamptz,
    owner_id uuid,
    distance double precision
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        l.id, l.title, l.price_per_day, l.sale_price, l.city, l.listing_type, l.size, l.created_at, l.owner_id,
        ST_Distance(l.location::geography, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) as distance
    FROM listings l
    WHERE l.status = 'active'
      AND (l.location IS NOT NULL)
      AND ST_DWithin(l.location::geography, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, radius_meters)
      AND (search_query IS NULL OR l.title ILIKE '%' || search_query || '%')
    ORDER BY distance ASC;
END;
$$;
