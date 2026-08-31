import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MyCalendar } from '@/components/bookings/MyCalendar'

export default async function CalendarPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Lấy các booking của chủ đồ (để hiển thị lịch cho người cho thuê)
  const { data: ownerBookings } = await supabase
    .from('bookings')
    .select('*, listing:listing_id(title)')
    .eq('owner_id', user.id)

  // Cũng lấy các booking mà người dùng đang thuê của người khác (để họ biết lịch đi thuê của mình)
  const { data: renterBookings } = await supabase
    .from('bookings')
    .select('*, listing:listing_id(title)')
    .eq('renter_id', user.id)

  // Lấy danh sách sự kiện đã lưu
  const { data: savedEventsData } = await supabase
    .from('saved_events')
    .select('event:event_id(id, title, start_date, end_date)')
    .eq('user_id', user.id)

  const savedEvents = savedEventsData?.map(se => se.event).filter(Boolean) || []

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-black text-slate-900 mb-6">Lịch Cá Nhân</h1>
      <MyCalendar 
        ownerBookings={ownerBookings || []} 
        renterBookings={renterBookings || []} 
        savedEvents={savedEvents}
      />
    </div>
  )
}
