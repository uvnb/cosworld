DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all constraints on events.submitted_by
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.key_column_usage 
        WHERE table_name = 'events' AND column_name = 'submitted_by'
    ) LOOP
        EXECUTE 'ALTER TABLE public.events DROP CONSTRAINT ' || r.constraint_name;
    END LOOP;

    -- Add the correct constraint
    EXECUTE 'ALTER TABLE public.events ADD CONSTRAINT events_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users(id) ON DELETE CASCADE';

    -- Fix storage.objects if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
        FOR r IN (
            SELECT constraint_name 
            FROM information_schema.key_column_usage 
            WHERE table_schema = 'storage' AND table_name = 'objects' AND column_name = 'owner'
        ) LOOP
            EXECUTE 'ALTER TABLE storage.objects DROP CONSTRAINT ' || r.constraint_name;
        END LOOP;
        EXECUTE 'ALTER TABLE storage.objects ADD CONSTRAINT objects_owner_fkey FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE';
    END IF;
    
    -- Fix storage.buckets if it exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'buckets') THEN
        FOR r IN (
            SELECT constraint_name 
            FROM information_schema.key_column_usage 
            WHERE table_schema = 'storage' AND table_name = 'buckets' AND column_name = 'owner'
        ) LOOP
            EXECUTE 'ALTER TABLE storage.buckets DROP CONSTRAINT ' || r.constraint_name;
        END LOOP;
        EXECUTE 'ALTER TABLE storage.buckets ADD CONSTRAINT buckets_owner_fkey FOREIGN KEY (owner) REFERENCES auth.users(id) ON DELETE CASCADE';
    END IF;
END $$;
