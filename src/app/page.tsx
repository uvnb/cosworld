import { ListingsGrid } from '@/components/listings/ListingsGrid'
import { Shirt, Smile, Sword, Footprints, Gem, Camera, MoreHorizontal, ChevronRight, Users, Calendar, LayoutGrid, AlertCircle, Compass } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { HeroCarousel } from '@/components/home/HeroCarousel'

import Link from 'next/link'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string, category?: string }> }) {
  const resolvedParams = await searchParams
  const q = resolvedParams?.q || ''
  const category = resolvedParams?.category || ''

  const supabase = await createClient()
  
  // 1. Lấy 3 Sự kiện HOT (dựa trên lượt quan tâm) làm Hero Banner
  const { data: hotEvents } = await supabase
    .from('events')
    .select('*, event_interests(count)')
    .eq('status', 'approved')
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('created_at', { ascending: false }) // Fallback order, actual interest sorting would require a view/rpc, so we just get latest hot events
    .limit(3)
    
  // Tính điểm quan tâm
  const formattedHotEvents = hotEvents?.map(evt => ({
    ...evt,
    interested_count: evt.event_interests?.[0]?.count || 0
  })).sort((a, b) => b.interested_count - a.interested_count) || []

  // 2. Lấy 3 Sự kiện sắp diễn ra gần nhất cho Widget
  const { data: upcomingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'approved')
    .gte('start_date', new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: true })
    .limit(3)

  // 3. Lấy 3 Bài Tuyển Staff/Lập team mới nhất
  const { data: recentRecruitments } = await supabase
    .from('recruitments')
    .select('id, title, location, roles, created_at')
    .eq('status', 'OPEN')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 w-full flex-1">
      <div className="space-y-8">
        
        {/* Hero Carousel */}
        {!category && !q && (
          <section>
            <HeroCarousel events={formattedHotEvents} />
          </section>
        )}

        {/* Category Icon Bar */}
        <section className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4">
          {[
            { id: '', icon: LayoutGrid, label: 'Tất cả', color: 'text-brand-600', bg: 'bg-brand-50' },
            { id: 'costume', icon: Shirt, label: 'Trang phục', color: 'text-purple-600', bg: 'bg-purple-50' },
            { id: 'wig', icon: Smile, label: 'Tóc giả', color: 'text-pink-500', bg: 'bg-pink-50' },
            { id: 'props', icon: Sword, label: 'Vũ khí', color: 'text-blue-600', bg: 'bg-blue-50' },
            { id: 'shoes', icon: Footprints, label: 'Giày dép', color: 'text-rose-500', bg: 'bg-rose-50' },
            { id: 'accessories', icon: Gem, label: 'Phụ kiện', color: 'text-amber-600', bg: 'bg-amber-50' },
            { id: 'studio', icon: Camera, label: 'Studio', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((cat, i) => {
            const isActive = category === cat.id
            return (
              <Link 
                href={cat.id ? `/?category=${cat.id}` : '/'} 
                key={cat.id || i}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border shadow-sm cursor-pointer transition ${
                  isActive ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500 shadow-md scale-105' : 'bg-white border-slate-200 hover:border-brand-300 hover:-translate-y-1'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 ${cat.bg} ${cat.color} ${isActive ? 'shadow-sm' : ''}`}>
                  <cat.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-semibold ${isActive ? 'text-brand-700' : 'text-slate-700'}`}>{cat.label}</span>
              </Link>
            )
          })}
        </section>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start mt-8">
          
          {/* Left: Listing Grid (9 Cols) */}
          <section className="xl:col-span-9 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {category 
                    ? `Danh mục: ${
                        { costume: 'Trang phục', wig: 'Tóc giả', props: 'Vũ khí / Đạo cụ', shoes: 'Giày dép', accessories: 'Phụ kiện', studio: 'Studio' }[category] || category
                      }` 
                    : q ? `Kết quả tìm kiếm cho "${q}"` : 'Đồ đang cho thuê nổi bật'}
                </h2>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  Vị trí bảo mật Fuzzy (±500m) • PostGIS Matching (Coming soon)
                </p>
              </div>
            </div>
            
            <ListingsGrid filters={{ query: q, category }} />
          </section>

          {/* Right: Sticky Sidebar (3 Cols) */}
          <aside className="xl:col-span-3 space-y-5 sticky top-24">
            
            {/* Widget Tuyển Staff */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center"><Users className="w-3.5 h-3.5" /></span>
                  Lập team / Tuyển staff
                </h3>
                <Link href="/services" className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center">
                  Xem tất cả <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3.5">
                {recentRecruitments && recentRecruitments.length > 0 ? recentRecruitments.map(rec => (
                  <Link href={`/services/${rec.id}`} key={rec.id} className="block group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition">
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition">{rec.title}</h4>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span className="truncate max-w-[120px]">📍 {rec.location}</span>
                      <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{rec.roles?.[0] || 'Member'}</span>
                    </div>
                  </Link>
                )) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                      <AlertCircle className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Chưa có bài đăng nào</p>
                    <p className="text-xs text-slate-400 mb-3">Hiện đang trống, hãy là người tiên phong!</p>
                    <Link href="/services/new" className="text-xs bg-brand-50 text-brand-600 font-bold px-3 py-1.5 rounded-full hover:bg-brand-100 transition">Đăng tuyển ngay</Link>
                  </div>
                )}
              </div>
            </div>

            {/* Widget Sự kiện sắp diễn ra */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm transition hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-md flex items-center justify-center"><Calendar className="w-3.5 h-3.5" /></span>
                  Sự kiện sắp diễn ra
                </h3>
                <Link href="/events" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center">
                  Xem tất cả <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3.5">
                {upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents.map(evt => (
                  <Link href={`/events/${evt.slug}`} key={evt.id} className="flex gap-3 items-center group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition">
                    <img src={evt.poster_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&auto=format&fit=crop&q=80"} className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-sm" alt="Event" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition">{evt.name}</h4>
                      <div className="text-[10px] text-slate-500 mt-1 flex flex-col gap-0.5">
                        <span className="truncate">📍 {evt.venue ? `${evt.venue}, ` : ''}{evt.city}</span>
                        <span className="text-indigo-600 font-bold bg-indigo-50 w-max px-1.5 py-0.5 rounded-sm">{new Date(evt.start_date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                      <Compass className="w-5 h-5 text-indigo-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 mb-1">Chưa có sự kiện nào</p>
                    <p className="text-xs text-slate-400 mb-3">Khám phá lịch Fes Cosplay toàn quốc tháng này</p>
                    <Link href="/events" className="text-xs bg-indigo-50 text-indigo-600 font-bold px-3 py-1.5 rounded-full hover:bg-indigo-100 transition">Khám phá ngay</Link>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
