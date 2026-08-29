-- Enable cascading deletes from auth.users to profiles
-- We must drop the existing constraint and add it back with ON DELETE CASCADE

DO $$ 
DECLARE 
    constraint_name text;
BEGIN
    -- 1. profiles -> auth.users
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass 
      AND confrelid = 'auth.users'::regclass;
      
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT ' || constraint_name;
    END IF;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- 2. follows -> profiles
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.follows'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.follows'::regclass AND attname = 'follower_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.follows DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.follows ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.follows'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.follows'::regclass AND attname = 'following_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.follows DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.follows ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- 3. listings -> profiles
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.listings'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.listings'::regclass AND attname = 'owner_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.listings DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.listings ADD CONSTRAINT listings_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- 4. bookings -> profiles (renter_id, owner_id)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.bookings'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.bookings'::regclass AND attname = 'renter_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.bookings DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.bookings ADD CONSTRAINT bookings_renter_id_fkey FOREIGN KEY (renter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.bookings'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.bookings'::regclass AND attname = 'owner_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.bookings DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.bookings ADD CONSTRAINT bookings_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- 5. reviews -> profiles
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.reviews'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.reviews'::regclass AND attname = 'reviewer_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.reviews DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.reviews'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.reviews'::regclass AND attname = 'reviewee_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.reviews DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.reviews ADD CONSTRAINT reviews_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- 6. reports -> profiles
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.reports'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.reports'::regclass AND attname = 'reporter_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.reports DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.reports ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.reports'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.reports'::regclass AND attname = 'reported_user_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.reports DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.reports ADD CONSTRAINT reports_reported_user_id_fkey FOREIGN KEY (reported_user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- 7. events -> profiles
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.events'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.events'::regclass AND attname = 'submitted_by');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.events DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.events ADD CONSTRAINT events_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- 8. services -> profiles
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.services'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.services'::regclass AND attname = 'owner_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.services DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.services ADD CONSTRAINT services_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- 9. notifications -> profiles
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.notifications'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.notifications'::regclass AND attname = 'user_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.notifications DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- 10. messages -> profiles
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.messages'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.messages'::regclass AND attname = 'sender_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.messages DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.messages'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.messages'::regclass AND attname = 'receiver_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.messages DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    
    -- 11. reputation_votes -> auth.users (already references auth.users in the other migration, but let's make sure it cascades)
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.reputation_votes'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.reputation_votes'::regclass AND attname = 'voter_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.reputation_votes DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.reputation_votes ADD CONSTRAINT reputation_votes_voter_id_fkey FOREIGN KEY (voter_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.reputation_votes'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.reputation_votes'::regclass AND attname = 'profile_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.reputation_votes DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.reputation_votes ADD CONSTRAINT reputation_votes_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES auth.users(id) ON DELETE CASCADE;

    -- 12. listing_images -> listings
    SELECT conname INTO constraint_name FROM pg_constraint WHERE conrelid = 'public.listing_images'::regclass AND conkey[1] = (SELECT attnum FROM pg_attribute WHERE attrelid = 'public.listing_images'::regclass AND attname = 'listing_id');
    IF constraint_name IS NOT NULL THEN EXECUTE 'ALTER TABLE public.listing_images DROP CONSTRAINT ' || constraint_name; END IF;
    ALTER TABLE public.listing_images ADD CONSTRAINT listing_images_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id) ON DELETE CASCADE;

END $$;
