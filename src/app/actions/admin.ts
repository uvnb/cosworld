'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return data?.role === 'admin'
}

export async function resolveReportAction(reportId: number, action: 'ban' | 'dismiss', reportedUserId: string) {
  const supabase = await createClient()
  if (!(await checkAdmin(supabase))) return { success: false, error: 'Unauthorized' }

  try {
    if (action === 'ban') {
      // Banning a user: We can set a flag on profiles, e.g. is_banned (need to add this column in the future)
      // For now, MVP: Drop their reputation score to 0
      await supabase.from('profiles').update({ reputation_score: 0 }).eq('id', reportedUserId)
    }

    // Resolve report
    await supabase.from('reports').update({ status: 'resolved' }).eq('id', reportId)
    revalidatePath('/admin')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function resolveEventAction(eventId: number, action: 'approve' | 'reject') {
  const supabase = await createClient()
  if (!(await checkAdmin(supabase))) return { success: false, error: 'Unauthorized' }

  try {
    if (action === 'reject') {
      await supabase.from('events').update({ status: 'rejected' }).eq('id', eventId)
    } else {
      await supabase.from('events').update({ status: 'approved' }).eq('id', eventId)
    }
    
    revalidatePath('/admin')
    revalidatePath('/events')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
