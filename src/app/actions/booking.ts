'use server'

import { createClient } from '@/lib/supabase/server'

export async function createBookingAction(listingId: string, startDate: string, endDate: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Vui lòng đăng nhập để đặt thuê' }
  }

  try {
    const { data, error } = await supabase.rpc('create_booking', {
      p_listing_id: listingId,
      p_renter_id: user.id,
      p_start_date: startDate,
      p_end_date: endDate
    })

    if (error) {
      console.error('Lỗi khi tạo booking:', error)
      if (error.message.includes('DATES_UNAVAILABLE')) {
        return { success: false, error: 'Ngày bạn chọn đã có người đặt, vui lòng chọn ngày khác.' }
      }
      if (error.message.includes('MAX_PENDING_REACHED')) {
        return { success: false, error: 'Bạn đang có quá nhiều yêu cầu chờ duyệt, vui lòng đợi chủ đồ xử lý bớt.' }
      }
      return { success: false, error: 'Không thể tạo yêu cầu đặt thuê. ' + error.message }
    }

    return { success: true, booking: data }
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi hệ thống' }
  }
}
