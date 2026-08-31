import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, DollarSign, ExternalLink, BookmarkPlus } from 'lucide-react'
import { Metadata } from 'next'

import { DeleteEventButton } from '@/components/admin/DeleteEventButton'
import { SaveEventButton } from '@/components/events/SaveEventButton'

// Tối ưu SEO cho trang chi tiết sự kiện
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, description, banner_url')
    .eq('slug', resolvedParams.slug)
    .single()

  if (!event) return { title: 'Không tìm thấy sự kiện' }

  return {
    title: `${event.title} | CosWorld Events`,
    description: event.description?.substring(0, 160),
    openGraph: {
      images: [event.banner_url || ''],
    },
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Check if admin or owner
  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false
  let isOwner = false
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('roles').eq('id', user.id).single()
    if (profile?.roles?.includes('admin')) isAdmin = true
  }

  // Cho phép lookup bằng ID nếu link dạng /events/id/[id] hoặc slug
  let query = supabase.from('events').select('*')
  if (resolvedParams.slug.length === 36 && resolvedParams.slug.includes('-')) {
     // uuid heuristic check
     query = query.eq('id', resolvedParams.slug)
  } else {
     query = query.eq('slug', resolvedParams.slug)
  }

  const { data: event, error } = await query.single()

  if (error || !event) {
    notFound()
  }

  let isSaved = false
  if (user) {
    if (event.submitted_by === user.id) {
      isOwner = true
    }
    const { data: savedEvent } = await supabase.from('saved_events').select('event_id').eq('event_id', event.id).eq('user_id', user.id).maybeSingle()
    if (savedEvent) isSaved = true
  }

  const startDate = new Date(event.start_date)
  const endDate = new Date(event.end_date)
  
  // Tạo link Add to Google Calendar
  const gcalTitle = encodeURIComponent(event.title)
  const gcalDetails = encodeURIComponent(`Nguồn: ${event.source_url || 'CosWorld Platform'}`)
  const gcalLocation = encodeURIComponent(`${event.location}${event.province ? `, ${event.province}` : ''}`)
  // Định dạng ngày YYYYMMDDTHHMMSSZ (UTC)
  const formatGCalDate = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "")
  const gcalDates = `${formatGCalDate(startDate)}/${formatGCalDate(endDate)}`
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${gcalTitle}&dates=${gcalDates}&details=${gcalDetails}&location=${gcalLocation}`

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      <Link href="/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách sự kiện
      </Link>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] relative bg-slate-100">
          <img 
            src={event.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80"} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          {event.is_crawled && (
            <div className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-black uppercase px-3 py-1.5 rounded-xl shadow-lg">
              Được tự động tổng hợp
            </div>
          )}
        </div>
        
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-4">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Thời gian</p>
                    <p className="text-sm font-bold text-slate-900">
                      {startDate.toLocaleDateString('vi-VN')} 
                      {startDate.getTime() !== endDate.getTime() ? ` - ${endDate.toLocaleDateString('vi-VN')}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">Địa điểm</p>
                    <p className="text-sm font-bold text-slate-900">{event.location}</p>
                    {event.province && <p className="text-xs text-slate-500">{event.province}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-fuchsia-50 px-5 py-3 rounded-2xl border border-fuchsia-100">
                  <div className="p-2 bg-white rounded-xl shadow-sm text-fuchsia-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-fuchsia-600/70 uppercase">Giá vé tham khảo</p>
                    <p className="text-sm font-bold text-fuchsia-700">{event.ticket_price || 'Liên hệ BTC'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
              <SaveEventButton eventId={event.id} isSavedInitially={isSaved} userId={user?.id} />
              
              <div className="flex gap-2">
                {event.source_url && (
                  <a href={event.source_url} target="_blank" rel="noreferrer" className="flex-1">
                    <button className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-2">
                      Trang gốc <ExternalLink className="w-4 h-4" />
                    </button>
                  </a>
                )}
                {(isAdmin || isOwner) && <DeleteEventButton eventId={event.id} />}
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-slate-100 mb-8"></div>

          <div className="prose prose-slate prose-indigo max-w-none">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Chi tiết Sự kiện & Festival</h3>
            <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
              {event.description || 'Sự kiện chưa cập nhật mô tả chi tiết. Bạn có thể nhấn vào nút "Xem tại trang gốc" để biết thêm thông tin.'}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
