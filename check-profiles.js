const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: cols } = await supabase.from('profiles').select('*').limit(1);
  console.log("Cols in profiles:", Object.keys(cols[0] || {}));
}
run();
