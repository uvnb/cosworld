const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: cols, error: errCols } = await supabase.from('listings').select('listing_type').limit(1);
  console.log("Cols:", cols, errCols);
  
  // try inserting a dummy want_to_rent listing, then delete it
  const { data: insertData, error: insertErr } = await supabase.from('listings').insert({
     owner_id: '183915f4-d484-4eda-91c1-de9171968527', // existing user
     title: 'Test',
     description: 'test',
     category: 'costume',
     listing_type: 'want_to_rent',
     price_per_day: 1000,
     city: 'Hanoi',
     district: 'Ba Dinh'
  }).select();
  console.log("Insert result:", insertErr);
  if (insertData) await supabase.from('listings').delete().eq('id', insertData[0].id);
}
run();
