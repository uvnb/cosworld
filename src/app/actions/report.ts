'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitReportAction(
  reportedUserId: string,
  bookingId: string | null,
  reason: string,
  description: string,
  evidenceUrls: string[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Vui lòng đăng nhập' }
  }

  try {
    const { error } = await supabase
      .from('reports')
      .insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        booking_id: bookingId,
        reason,
        description,
        evidence_urls: evidenceUrls,
        status: 'pending'
      })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi hệ thống' }
  }
}
