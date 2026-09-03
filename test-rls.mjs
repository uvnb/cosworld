import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY // using ANON KEY
)

async function test() {
  const { data, error } = await supabase.from('notifications').select('*')
  console.log("Anon select:", data, error)
}
test()
