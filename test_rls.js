const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  // get admin user
  const { data: users } = await supabase.auth.admin.listUsers();
  const admin = users.users.find(u => u.email === 'quanvu2k3@gmail.com');
  
  if (!admin) return console.log("Admin not found");
  
  // impersonate
  const userClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${admin.id}` } }
  });
  
  // Actually, we can just sign in or mock the token if we had the password, but we don't.
  // Let's use service_role to fetch the event ID, then use SQL to test RLS.
}
test();
