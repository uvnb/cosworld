'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitReviewAction(
  bookingId: string, 
  revieweeId: string, 
  rating: number, 
  comment: string, 
  role: 'renter' | 'owner'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Vui lòng đăng nhập' }
  }

  try {
    // 1. Kiểm tra booking có hợp lệ và hoàn tất chưa
    const { data: booking, error: bError } = await supabase
      .from('bookings')
      .select('status')
      .eq('id', bookingId)
      .single()

    if (bError || !booking) return { success: false, error: 'Không tìm thấy booking' }
    if (booking.status !== 'completed') return { success: false, error: 'Giao dịch chưa hoàn tất' }

    // 2. Tạo review
    const { error: rError } = await supabase
      .from('reviews')
      .insert({
        booking_id: bookingId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating,
        comment,
        reviewer_role: role,
        is_published: true
      })

    if (rError) {
      if (rError.code === '23505') return { success: false, error: 'Bạn đã đánh giá giao dịch này rồi' }
      throw rError
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi hệ thống' }
  }
}
