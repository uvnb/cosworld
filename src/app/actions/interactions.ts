'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function toggleSaveEventAction(eventId: string, userId: string, currentlySaved: boolean) {
  // Use admin client for DB operations to bypass RLS quirks, since we authorize here
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  if (currentlySaved) {
    const { error } = await supabaseAdmin.from('saved_events').delete().eq('event_id', eventId).eq('user_id', userId)
    if (error) return { error: error.message }
  } else {
    // Upsert or check to prevent duplicate key errors on double clicks
    const { error } = await supabaseAdmin.from('saved_events')
      .upsert({ event_id: eventId, user_id: userId }, { onConflict: 'event_id,user_id' })
    if (error) return { error: error.message }
  }
  
  return { success: true }
}

export async function toggleLikeProfileAction(profileId: string, userId: string, currentlyLiked: boolean) {
  const supabase = await createClient()
  
  // Verify auth on server
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) {
    return { error: 'Unauthorized' }
  }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  if (currentlyLiked) {
    const { error } = await supabaseAdmin.from('reputation_votes').delete().eq('profile_id', profileId).eq('voter_id', userId)
    if (error) return { error: error.message }
  } else {
    // Use upsert to gracefully handle double-clicks without throwing unique constraint/RLS errors
    const { error } = await supabaseAdmin.from('reputation_votes')
      .upsert({ profile_id: profileId, voter_id: userId, vote_value: 1 }, { onConflict: 'voter_id,profile_id' })
    if (error) return { error: error.message }
  }
  
  return { success: true }
}
