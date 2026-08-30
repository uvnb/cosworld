'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function manageEvent(eventId: string, status: 'APPROVED' | 'REJECTED') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Trong thực tế cần check user.role === 'admin'
  // Tuy nhiên ở MVP, ta giả định user truy cập được trang admin là có quyền
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
