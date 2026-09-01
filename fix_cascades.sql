DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Fix bookings constraints
    FOR r IN (SELECT constraint_name FROM information_schema.key_column_usage WHERE table_name = 'bookings' AND column_name = 'renter_id') LOOP
        EXECUTE 'ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
    EXECUTE 'ALTER TABLE public.bookings ADD CONSTRAINT bookings_renter_id_fkey FOREIGN KEY (renter_id) REFERENCES public.profiles(id) ON DELETE CASCADE';

    FOR r IN (SELECT constraint_name FROM information_schema.key_column_usage WHERE table_name = 'bookings' AND column_name = 'owner_id') LOOP
        EXECUTE 'ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
    EXECUTE 'ALTER TABLE public.bookings ADD CONSTRAINT bookings_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE';

    FOR r IN (SELECT constraint_name FROM information_schema.key_column_usage WHERE table_name = 'bookings' AND column_name = 'listing_id') LOOP
        EXECUTE 'ALTER TABLE public.bookings DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
    EXECUTE 'ALTER TABLE public.bookings ADD CONSTRAINT bookings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE';

    -- 2. Fix listings constraints
    FOR r IN (SELECT constraint_name FROM information_schema.key_column_usage WHERE table_name = 'listings' AND column_name = 'owner_id') LOOP
        EXECUTE 'ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
    EXECUTE 'ALTER TABLE public.listings ADD CONSTRAINT listings_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE';

    -- 3. Fix reviews constraints
    FOR r IN (SELECT constraint_name FROM information_schema.key_column_usage WHERE table_name = 'reviews' AND column_name = 'reviewer_id') LOOP
        EXECUTE 'ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
    EXECUTE 'ALTER TABLE public.reviews ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE';

    FOR r IN (SELECT constraint_name FROM information_schema.key_column_usage WHERE table_name = 'reviews' AND column_name = 'reviewee_id') LOOP
        EXECUTE 'ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
    EXECUTE 'ALTER TABLE public.reviews ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.profiles(id) ON DELETE CASCADE';

    FOR r IN (SELECT constraint_name FROM information_schema.key_column_usage WHERE table_name = 'reviews' AND column_name = 'booking_id') LOOP
        EXECUTE 'ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
    EXECUTE 'ALTER TABLE public.reviews ADD CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE';

    -- 4. Fix calendar_locks constraints
    FOR r IN (SELECT constraint_name FROM information_schema.key_column_usage WHERE table_name = 'calendar_locks' AND column_name = 'booking_id') LOOP
        EXECUTE 'ALTER TABLE public.calendar_locks DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
    EXECUTE 'ALTER TABLE public.calendar_locks ADD CONSTRAINT calendar_locks_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id) ON DELETE CASCADE';
    
    FOR r IN (SELECT constraint_name FROM information_schema.key_column_usage WHERE table_name = 'calendar_locks' AND column_name = 'listing_id') LOOP
        EXECUTE 'ALTER TABLE public.calendar_locks DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
    EXECUTE 'ALTER TABLE public.calendar_locks ADD CONSTRAINT calendar_locks_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE';

END $$;
