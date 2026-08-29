import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Call the database function to delete the account
    const { error } = await supabase.rpc('delete_own_account')

    if (error) {
      console.error('delete_own_account RPC error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Sign out (ignore errors since user is already deleted)
    try {
      await supabase.auth.signOut()
    } catch {
      // User already deleted, signOut may fail
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Delete account error:', err)
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
