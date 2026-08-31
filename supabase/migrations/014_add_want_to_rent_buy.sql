-- Drop the existing constraint if it exists. Note that sometimes Supabase dashboard creates unnamed CHECK constraints.
-- But typically they are named by standard postgres conventions: table_column_check
ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_listing_type_check;

-- You can also run this to drop ALL check constraints on the column if it was randomly named:
DO $$
DECLARE
    row record;
BEGIN
    FOR row IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.listings'::regclass AND contype = 'c'
    LOOP
        EXECUTE 'ALTER TABLE public.listings DROP CONSTRAINT ' || quote_ident(row.conname);
    END LOOP;
END;
$$;

-- Add the updated constraint including 'want_to_rent' and 'want_to_buy'
ALTER TABLE public.listings 
ADD CONSTRAINT listings_listing_type_check 
CHECK (listing_type IN ('rent', 'sale', 'both', 'want_to_rent', 'want_to_buy'));
