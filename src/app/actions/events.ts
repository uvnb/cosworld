'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function manageEvent(eventId: string, status: 'APPROVED' | 'REJECTED') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('roles')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.roles?.includes('admin')) {
    return { error: 'Forbidden: Bạn không có quyền duyệt bài' }
  }

  const { error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', eventId)

  if (error) {
    console.error('Lỗi khi duyệt sự kiện:', error)
    return { error: 'Không thể cập nhật trạng thái sự kiện.' }
  }

  revalidatePath('/admin/events')
  revalidatePath('/events')
  return { success: true }
}
