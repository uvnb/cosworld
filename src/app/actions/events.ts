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
    let content = `Sự kiện "${eventData.title}" của bạn ${actionText} bởi Admin.`
    const link = status === 'APPROVED' ? `/events` : '#' // Link to events if approved

    if (status === 'APPROVED') {
      // Tăng điểm uy tín cho user
      const { data: userData } = await adminClient.from('profiles').select('reputation_score').eq('id', eventData.submitted_by).single()
      const currentScore = userData?.reputation_score || 0
      await adminClient.from('profiles').update({ reputation_score: currentScore + 5 }).eq('id', eventData.submitted_by)
      content += ` Bạn được thưởng +5 điểm Uy tín!`
    }
    
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

export async function submitEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized: Bạn cần đăng nhập để gửi sự kiện' }
  }

  const title = formData.get('title') as string
  const source_url = formData.get('source_url') as string
  const start_date = formData.get('start_date') as string
  const end_date = formData.get('end_date') as string
  const province = formData.get('province') as string
  const location = formData.get('location') as string
  const description = formData.get('description') as string

  if (!title || !source_url || !start_date || !province) {
    return { error: 'Vui lòng điền đầy đủ các trường bắt buộc' }
  }

  // Generate slug
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    + '-' + Date.now().toString().slice(-6)

  const { error } = await supabase.from('events').insert({
    title,
    slug,
    source_url,
    start_date,
    end_date: end_date || start_date,
    province,
    location: location || province,
    description: description || '',
    is_crawled: false,
    status: 'PENDING',
    submitted_by: user.id
  })

  if (error) {
    // Handling duplicate source_url gracefully for users
    if (error.code === '23505' && error.message.includes('idx_events_unique_source')) {
      return { error: 'Sự kiện với link nguồn này đã tồn tại trong hệ thống.' }
    }
    console.error('Lỗi khi gửi sự kiện:', error)
    return { error: 'Đã có lỗi xảy ra khi gửi sự kiện' }
  }

  return { success: true }
}
