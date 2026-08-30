'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function applyForRecruitment(recruitmentId: string, appliedRole: string, message: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Bạn phải đăng nhập để ứng tuyển.' }
  }

  const { error } = await supabase
    .from('recruitment_applications')
    .insert({
      recruitment_id: recruitmentId,
      applicant_id: user.id,
      applied_role: appliedRole,
      message,
      status: 'PENDING'
    })

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: 'Bạn đã ứng tuyển vào vị trí này rồi.' }
    }
    console.error('Apply error:', error)
    return { error: 'Có lỗi xảy ra khi gửi ứng tuyển.' }
  }

  revalidatePath(`/services/${recruitmentId}`)
  return { success: true }
}

export async function manageApplication(applicationId: string, status: 'ACCEPTED' | 'REJECTED') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Check if current user is the owner of the recruitment
  const { data: application } = await supabase
    .from('recruitment_applications')
    .select('recruitment_id, applicant_id, applied_role, recruitments(author_id)')
    .eq('id', applicationId)
    .single()

  if (!application) return { error: 'Application not found' }
  
  // Type assertion or check since we know the join structure
  const recruitment = application.recruitments as any
  if (recruitment.author_id !== user.id) {
    return { error: 'Chỉ chủ bài đăng mới có quyền duyệt.' }
  }

  const { error } = await supabase
    .from('recruitment_applications')
    .update({ status })
    .eq('id', applicationId)

  if (error) return { error: 'Lỗi khi cập nhật trạng thái.' }

  // If ACCEPTED, add to team_members
  if (status === 'ACCEPTED') {
    await supabase.from('team_members').insert({
      recruitment_id: application.recruitment_id,
      user_id: application.applicant_id,
      role: application.applied_role
    })
  } else {
    // If REJECTED, maybe remove from team_members if they were previously accepted
    await supabase.from('team_members')
      .delete()
      .match({
        recruitment_id: application.recruitment_id,
        user_id: application.applicant_id
      })
  }

  revalidatePath('/services/manage')
  return { success: true }
}

export async function createRecruitment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const location = formData.get('location') as string
  const budget = formData.get('budget') as string
  const deadline = formData.get('deadline') as string
  const roles = formData.getAll('roles') as string[]

  if (!title || !description || !location || !deadline || roles.length === 0) {
    return { error: 'Vui lòng điền đầy đủ các trường bắt buộc.' }
  }

  const { data, error } = await supabase
    .from('recruitments')
    .insert({
      author_id: user.id,
      title,
      description,
      location,
      budget,
      deadline,
      roles
    })
    .select('id')
    .single()

  if (error) {
    console.error('Create recruitment error:', error)
    return { error: 'Lỗi khi tạo bài đăng.' }
  }

  revalidatePath('/services')
  return { success: true, id: data.id }
}
