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

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('events')
    .update({ status })
    .eq('id', eventId)

  if (error) {
    console.error('Lỗi khi duyệt sự kiện:', error)
    return { error: `Lỗi: ${error.message || 'Không thể cập nhật trạng thái'}` }
  }

  // Lấy thông tin sự kiện để gửi thông báo
  const { data: eventData } = await adminClient.from('events').select('title, submitted_by').eq('id', eventId).single()
  
  if (eventData?.submitted_by) {
    const { createNotification } = await import('@/app/actions/notifications')
    const actionText = status === 'APPROVED' ? 'đã được duyệt' : 'đã bị từ chối'
    const title = `Sự kiện ${actionText}`
    const content = `Sự kiện "${eventData.title}" của bạn ${actionText} bởi Admin.`
    const link = status === 'APPROVED' ? `/events` : '#' // Link to events if approved
    
    await createNotification(eventData.submitted_by, `EVENT_${status}`, title, content, link, user.id)
  }

  revalidatePath('/admin/events')
  revalidatePath('/events')
  return { success: true }
}

export async function deleteEvent(eventId: string) {
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

  const isAdmin = profile?.roles?.includes('admin')
  
  // Check if owner
  const { data: event } = await supabase.from('events').select('submitted_by').eq('id', eventId).single()
  const isOwner = event?.submitted_by === user.id

  if (!isAdmin && !isOwner) {
    return { error: 'Forbidden: Bạn không có quyền xóa sự kiện này.' }
  }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { error } = await adminClient
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) {
    console.error('Lỗi khi xóa sự kiện:', error)
    return { error: `Lỗi: ${error.message || 'Không thể xóa sự kiện'}` }
  }

  revalidatePath('/admin/events')
  revalidatePath('/events')
  return { success: true }
}
