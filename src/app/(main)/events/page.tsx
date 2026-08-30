import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Calendar, MapPin, Search, Filter, Plus, ExternalLink, BookmarkPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ q?: string, province?: string, time?: string }> }) {
  const resolvedParams = await searchParams
  const q = resolvedParams?.q || ''
  const province = resolvedParams?.province || ''
  const time = resolvedParams?.time || ''

  const supabase = await createClient()

  let query = supabase
    .from('events')
    .select('*')
    .eq('status', 'APPROVED')

  // Search logic
  if (q) {
    query = query.ilike('title', `%${q}%`)
  }
  
  if (province) {
    query = query.eq('province', province)
  }

  // Time logic
  const now = new Date().toISOString()
  if (time === 'upcoming') {
    query = query.gte('start_date', now).order('start_date', { ascending: true })
  } else if (time === 'past') {
    query = query.lt('end_date', now).order('end_date', { ascending: false })
  } else {
    // default: upcoming first
    query = query.gte('end_date', now).order('start_date', { ascending: true })
  }

  const { data: events } = await query

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 w-full flex-1 space-y-8">
      
      {/* Big Hero Banner */}
      <div className="rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-fuchsia-600 p-8 sm:p-12 relative shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-white max-w-2xl">
            <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-black mb-5 border border-white/20 uppercase tracking-widest text-indigo-100">
              Lịch Lễ Hội & Sự Kiện Cosplay Toàn Quốc
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 leading-tight">Manga Comic Con 2026</h1>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed mb-6">
              Khám phá hàng trăm sự kiện hấp dẫn, nơi kết nối cộng đồng yêu thích văn hóa 2D, game và cosplay lớn nhất Việt Nam.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-sm font-bold text-white shadow-sm flex items-center gap-2 border border-white/20">
                <MapPin className="w-4 h-4" /> TP. HCM
              </span>
              <span className="px-4 py-2 bg-fuchsia-500 rounded-xl text-sm font-bold text-white shadow-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Sắp diễn ra
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 shrink-0">
            <Link href="/events/create" className="w-full">
              <button className="w-full px-8 py-3.5 bg-white text-indigo-900 hover:bg-indigo-50 rounded-full text-base font-black transition flex items-center justify-center gap-2 shadow-xl hover:scale-105 active:scale-95">
                <Plus className="w-5 h-5" /> Đăng sự kiện
              </button>
            </Link>
            <Link href="/admin/events" className="w-full">
              <button className="w-full px-8 py-3 bg-indigo-900/50 hover:bg-indigo-900 text-white rounded-full text-sm font-bold transition flex items-center justify-center gap-2 border border-white/20">
                Quản lý / Duyệt bài
              </button>
            </Link>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-40 mix-blend-overlay" style={{ background: 'radial-gradient(circle at top right, white, transparent)' }}></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-fuchsia-500/30 blur-3xl rounded-full pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Filters */}
        <aside className="xl:col-span-3 space-y-6 sticky top-24">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                BỘ LỌC SỰ KIỆN
              </h3>
              <Link href="/events" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Làm mới</Link>
            </div>

            <form className="space-y-6" action="/events" method="GET">
              
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-3">Tên sự kiện / Từ khóa</h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="q"
                    defaultValue={q}
                    placeholder="Manga, Winter, Fes..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-3">Khu vực</h4>
                <select name="province" defaultValue={province} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none">
                  <option value="">Tất cả tỉnh thành</option>
                  <option value="Hà Nội">Hà Nội (Miền Bắc)</option>
                  <option value="TP. HCM">TP. HCM (Miền Nam)</option>
                  <option value="Đà Nẵng">Đà Nẵng (Miền Trung)</option>
                </select>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-3">Thời gian</h4>
                <select name="time" defaultValue={time} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none">
                  <option value="upcoming">Sắp diễn ra & Hôm nay</option>
                  <option value="past">Đã kết thúc</option>
                  <option value="">Tất cả thời gian</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">
                Tìm kiếm sự kiện
              </button>
            </form>
          </div>
        </aside>

        {/* Right Feed */}
        <section className="xl:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Danh sách Sự kiện</h2>
            <div className="text-sm font-medium text-slate-500">
              Tìm thấy {events?.length || 0} kết quả
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events?.map((evt) => (
              <div key={evt.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-indigo-300 transition group flex flex-col">
                <Link href={evt.slug ? `/events/${evt.slug}` : `/events/id/${evt.id}`} className="relative aspect-video bg-slate-100 overflow-hidden block">
                  <img 
                    src={evt.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80"} 
                    alt={evt.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl shadow-sm text-center border border-white">
                    <div className="text-[10px] font-black text-slate-500 uppercase">{new Date(evt.start_date).toLocaleString('vi-VN', { month: 'short' })}</div>
                    <div className="text-lg font-black text-indigo-600">{new Date(evt.start_date).getDate()}</div>
                  </div>
                  {evt.is_crawled && (
                    <div className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg shadow-sm">
                      Auto-Crawl
                    </div>
                  )}
                </Link>
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={evt.slug ? `/events/${evt.slug}` : `/events/id/${evt.id}`}>
                      <h2 className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition mb-2 line-clamp-2">
                        {evt.title}
                      </h2>
                    </Link>
                    <div className="space-y-2 mt-3 mb-5 text-sm font-medium text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(evt.start_date).toLocaleDateString('vi-VN')} {new Date(evt.end_date).getTime() !== new Date(evt.start_date).getTime() ? `- ${new Date(evt.end_date).toLocaleDateString('vi-VN')}` : ''}
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{evt.location} {evt.province ? ` - ${evt.province}` : ''}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button className="flex-1 px-4 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2">
                      <BookmarkPlus className="w-4 h-4" /> Lưu lịch
                    </button>
                    {evt.source_url ? (
                      <a href={evt.source_url} target="_blank" rel="noreferrer" className="flex-1 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-slate-200">
                        Nguồn <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <Link href={evt.slug ? `/events/${evt.slug}` : `/events/id/${evt.id}`} className="flex-1">
                        <button className="w-full px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 border border-slate-200">
                          Chi tiết
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!events?.length && (
            <div className="py-20 text-center bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">Chưa có sự kiện nào</h3>
              <p className="text-sm text-slate-500 mt-1">Vui lòng điều chỉnh bộ lọc hoặc quay lại sau.</p>
            </div>
          )}
        </section>

      </div>
    </main>
  )
}
