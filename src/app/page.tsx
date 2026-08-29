import { ListingsGrid } from '@/components/listings/ListingsGrid'
import { Shirt, Smile, Sword, Footprints, Gem, Camera, MoreHorizontal, ChevronRight, Users, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

import Link from 'next/link'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string, category?: string }> }) {
  const resolvedParams = await searchParams
  const q = resolvedParams?.q || ''
  const category = resolvedParams?.category || ''

  const supabase = await createClient()
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'approved')
    .gte('end_date', new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: true })
    .limit(3)

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 w-full flex-1">
      <div className="space-y-6">

        {/* Category Icon Bar */}
        <section className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4">
          {[
            { id: 'costume', icon: Shirt, label: 'Trang phục', color: 'text-purple-600', bg: 'bg-purple-50' },
            { id: 'wig', icon: Smile, label: 'Tóc giả', color: 'text-pink-500', bg: 'bg-pink-50' },
            { id: 'props', icon: Sword, label: 'Vũ khí', color: 'text-blue-600', bg: 'bg-blue-50' },
            { id: 'shoes', icon: Footprints, label: 'Giày dép', color: 'text-rose-500', bg: 'bg-rose-50' },
            { id: 'accessories', icon: Gem, label: 'Phụ kiện', color: 'text-amber-600', bg: 'bg-amber-50' },
            { id: 'studio', icon: Camera, label: 'Studio', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { id: '', icon: MoreHorizontal, label: 'Khác', color: 'text-slate-600', bg: 'bg-slate-100' },
          ].map((cat, i) => {
            const isActive = category === cat.id
            return (
              <Link 
                href={cat.id ? `/?category=${cat.id}` : '/'} 
                key={cat.id || i}
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border shadow-sm cursor-pointer transition ${
                  isActive ? 'bg-brand-50 border-brand-500 ring-1 ring-brand-500 shadow-md scale-105' : 'bg-white border-slate-200 hover:border-brand-300'
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {category 
                    ? `Danh mục: ${
                        { costume: 'Trang phục', wig: 'Tóc giả', props: 'Vũ khí / Đạo cụ', shoes: 'Giày dép', accessories: 'Phụ kiện', studio: 'Studio' }[category] || category
                      }` 
                    : q ? `Kết quả tìm kiếm cho "${q}"` : 'Nổi bật trên CosWorld'}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  Vị trí bảo mật Fuzzy (±500m) • PostGIS Matching
                </p>
              </div>
            </div>
            
            <ListingsGrid filters={{ query: q, category }} />
          </section>

          {/* Right: Sticky Sidebar (3 Cols) */}
          <aside className="xl:col-span-3 space-y-5 sticky top-24">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 text-brand-600 flex items-center justify-center"><Users className="w-full h-full" /></span>
                  Lập team / Tuyển staff
                </h3>
                <button className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center">
                  Xem tất cả <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-3.5">
                <div className="text-sm text-slate-500 text-center py-4">Chưa có bài đăng nào</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-4 h-4 text-indigo-600 flex items-center justify-center"><Calendar className="w-full h-full" /></span>
                  Sự kiện sắp diễn ra
                </h3>
                <button className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center">
                  Xem tất cả <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-3.5">
                {events && events.length > 0 ? events.map(evt => (
                  <div key={evt.id} className="flex gap-3 items-center group cursor-pointer hover:bg-slate-50 p-2 -mx-2 rounded-xl transition">
                    <img src={evt.poster_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=120&auto=format&fit=crop&q=80"} className="w-12 h-12 rounded-xl object-cover shrink-0" alt="Event" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-brand-600 transition">{evt.name}</h4>
                      <div className="text-[10px] text-slate-400 mt-1 flex flex-col gap-0.5">
                        <span>📍 {evt.venue ? `${evt.venue}, ` : ''}{evt.city}</span>
                        <span className="text-indigo-600 font-bold">{new Date(evt.start_date).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500 text-center py-4">Chưa có sự kiện nào</div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
