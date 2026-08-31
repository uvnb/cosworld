const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.rpc('get_policies', { table_name: 'reputation_votes' }).catch(() => ({}));
  if (error || !data) {
     // fallback to raw query
     const { data: res, error: e2 } = await supabase.from('pg_policies').select('*').eq('tablename', 'reputation_votes').catch(() => ({}));
     console.log("Policies:", res || e2);
  } else {
     console.log("Policies:", data);
  }
}
run();
