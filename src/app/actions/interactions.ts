'use server'

import { createClient } from '@/lib/supabase/server'

export async function toggleSaveEventAction(eventId: string, userId: string, currentlySaved: boolean) {
  const supabase = await createClient()
  
  if (currentlySaved) {
    const { error } = await supabase.from('saved_events').delete().eq('event_id', eventId).eq('user_id', userId)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('saved_events').insert({ event_id: eventId, user_id: userId })
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
  
  if (currentlyLiked) {
    const { error } = await supabase.from('reputation_votes').delete().eq('profile_id', profileId).eq('voter_id', userId)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('reputation_votes').insert({ profile_id: profileId, voter_id: userId, vote_value: 1 })
    if (error) return { error: error.message }
  }
  
  return { success: true }
}
