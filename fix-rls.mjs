import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', { sql: `
    -- Fix Admin policies
    DROP POLICY IF EXISTS "Admin can manage all" ON listings;
    CREATE POLICY "Admin select listings" ON listings FOR SELECT USING (is_admin());
    CREATE POLICY "Admin update listings" ON listings FOR UPDATE USING (is_admin());
    CREATE POLICY "Admin delete listings" ON listings FOR DELETE USING (is_admin());
    
    -- Grant service role
    GRANT ALL ON listings TO service_role;
    GRANT ALL ON bookings TO service_role;
    GRANT ALL ON reviews TO service_role;
    GRANT ALL ON recruitments TO service_role;
  `})
  console.log("Result:", data, error)
}
run()
