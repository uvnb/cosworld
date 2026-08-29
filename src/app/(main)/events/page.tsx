import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, MapPin, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function EventsPage() {
  const supabase = await createClient()

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'approved')
    .order('start_date', { ascending: true })

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 w-full flex-1 space-y-8">
      
      {/* Big Hero Banner */}
      <div className="rounded-[2rem] overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-400 p-8 sm:p-12 relative shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-white max-w-2xl">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-4 border border-white/20">
              Lịch Lễ Hội Toàn Quốc 2026
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight">Cosplay Festival Summer Expo 2026</h1>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed mb-6">
              Sự kiện cosplay lớn nhất năm quy tụ hơn 500 cosplayer khách mời, gian hàng merchandise và cuộc thi Cosplay Championship.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-2 bg-white rounded-full text-sm font-bold text-slate-900 shadow-sm flex items-center gap-2">
                📍 Phú Thọ, TP. HCM
              </span>
              <span className="px-4 py-2 bg-pink-500 rounded-full text-sm font-bold text-white shadow-sm flex items-center gap-2">
                📅 15 - 16 Tháng 9, 2026
              </span>
            </div>
          </div>
          <Link href="/events/create" className="shrink-0">
            <button className="px-6 py-3 bg-white text-brand-600 hover:bg-slate-50 rounded-full text-sm font-bold transition flex items-center gap-2 shadow-xl whitespace-nowrap">
              <span className="text-lg leading-none">+</span> Đăng ký sự kiện / Festival mới
            </button>
          </Link>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 mix-blend-overlay" style={{ background: 'radial-gradient(circle at top right, white, transparent)' }}></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events?.map((evt) => (
          <div key={evt.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-brand-500 transition group flex flex-col">
            <div className="relative aspect-video bg-slate-100 overflow-hidden">
              <img 
                src={evt.poster_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80"} 
                alt={evt.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl shadow-sm text-center">
                <div className="text-xs font-bold text-slate-500 uppercase">{new Date(evt.start_date).toLocaleString('vi-VN', { month: 'short' })}</div>
                <div className="text-xl font-black text-brand-600">{new Date(evt.start_date).getDate()}</div>
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 leading-tight group-hover:text-brand-600 transition mb-2">
                  {evt.name}
                </h2>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                  {evt.description || 'Chưa có mô tả chi tiết.'}
                </p>
              </div>
              
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 text-sm font-medium text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {new Date(evt.start_date).toLocaleDateString('vi-VN')} {evt.end_date !== evt.start_date ? `- ${new Date(evt.end_date).toLocaleDateString('vi-VN')}` : ''}
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{evt.venue ? `${evt.venue}, ` : ''}{evt.city}</span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {!events?.length && (
          <div className="col-span-full text-center py-20 text-slate-400">
            Hiện chưa có sự kiện nào được duyệt.
          </div>
        )}
      </div>
    </main>
  )
}
