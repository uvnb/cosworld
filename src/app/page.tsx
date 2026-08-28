import { ListingsGrid } from '@/components/listings/ListingsGrid'
import { Shirt, Smile, Sword, Footprints, Gem, Camera, MoreHorizontal } from 'lucide-react'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams
  const q = resolvedParams?.q || ''

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 w-full flex-1">
      <div className="space-y-6">

        {/* Category Icon Bar */}
        <section className="grid grid-cols-4 sm:grid-cols-7 gap-3 sm:gap-4">
          {[
            { icon: Shirt, label: 'Trang phục', color: 'text-purple-600', bg: 'bg-purple-50' },
            { icon: Smile, label: 'Tóc giả', color: 'text-pink-500', bg: 'bg-pink-50' },
            { icon: Sword, label: 'Vũ khí', color: 'text-blue-600', bg: 'bg-blue-50' },
            { icon: Footprints, label: 'Giày dép', color: 'text-rose-500', bg: 'bg-rose-50' },
            { icon: Gem, label: 'Phụ kiện', color: 'text-amber-600', bg: 'bg-amber-50' },
            { icon: Camera, label: 'Studio', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { icon: MoreHorizontal, label: 'Khác', color: 'text-slate-600', bg: 'bg-slate-100' },
          ].map((cat, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-brand-500 cursor-pointer transition">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-1.5 ${cat.bg} ${cat.color}`}>
                <cat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-slate-700">{cat.label}</span>
            </div>
          ))}
        </section>

        {/* Banner Section */}
        <section className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-[4/1] min-h-[160px] flex items-center">
          <img src="https://images.unsplash.com/photo-1612487528505-d2338264c821?w=1600&auto=format&fit=crop&q=80" alt="Banner" className="absolute inset-0 w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-transparent"></div>
          <div className="relative z-10 px-6 sm:px-12 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-brand-500 text-white text-xs font-bold rounded-full mb-3">HOT EVENT</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-2 leading-tight">Lễ Hội Cosplay Mùa Hè 2024</h2>
            <p className="text-slate-300 text-sm font-medium mb-4">Giảm 50% phí cọc cho tất cả đồ thuê trong tháng 7</p>
            <button className="px-5 py-2.5 bg-white text-slate-900 font-bold rounded-full text-sm hover:bg-slate-100 transition shadow-lg">Khám phá ngay</button>
          </div>
        </section>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start mt-8">
          
          {/* Left: Listing Grid (9 Cols) */}
          <section className="xl:col-span-9 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {q ? `Kết quả tìm kiếm cho "${q}"` : 'Nổi bật trên CosWorld'}
                </h2>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  Vị trí bảo mật Fuzzy (±500m) • PostGIS Matching
                </p>
              </div>
            </div>
            
            <ListingsGrid query={q} />
          </section>

          {/* Right: Sticky Sidebar (3 Cols) */}
          <aside className="xl:col-span-3 space-y-5 sticky top-24">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  Lập team / Tuyển staff
                </h3>
              </div>
              <div className="space-y-3.5">
                <div className="text-sm text-slate-500 text-center py-4">Chưa có bài đăng nào</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  Sự kiện sắp diễn ra
                </h3>
              </div>
              <div className="space-y-3.5">
                <div className="text-sm text-slate-500 text-center py-4">Chưa có sự kiện nào</div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
