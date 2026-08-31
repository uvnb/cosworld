const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.rpc('get_policies', { table_name: 'listings' }).catch(() => ({}));
  const { data: cols } = await supabase.from('listings').select('*').limit(1);
  console.log("Cols:", cols);
  const { data: schema } = await supabase.rpc('query', { query_text: "SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE conrelid = 'public.listings'::regclass;" }).catch(() => ({}));
  console.log("Constraints:", schema);
}
run();
