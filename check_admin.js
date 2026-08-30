const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError) {
     console.error('Cannot list auth.users with current key, assuming anon key.');
     // Fallback: just check profiles
     const { data } = await supabase.from('profiles').select('id, username, roles');
     console.log('Profiles:', data);
     return;
  }
  
  const adminUser = users.users.find(u => u.email === 'quanvu2k3@gmail.com');
  console.log('Admin User:', adminUser ? adminUser.id : 'Not found');
  
  const { data } = await supabase.from('profiles').select('*');
  console.log('Profiles:', data);
}
check();
