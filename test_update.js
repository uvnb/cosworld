const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
  const { data, error } = await supabase.from('events').update({ status: 'REJECTED' }).eq('title', 'Hobby Horizon Expo - HCM');
  console.log("UPDATE result:", data, error);
}
test();
