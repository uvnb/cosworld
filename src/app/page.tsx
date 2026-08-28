import { ListingsGrid } from '@/components/listings/ListingsGrid'
import { Shirt, Smile, Sword, Footprints, Gem, Camera, MoreHorizontal, ChevronRight, Users, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedParams = await searchParams
  const q = resolvedParams?.q || ''

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 w-full flex-1">
      <div className="space-y-6">
        
        {/* Top Banner */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Sàn Giao Dịch Cosplay Toàn Quốc</h1>
            <p className="text-slate-500 text-sm mt-1">Hơn 500+ trang phục cho thuê & đồ thanh lý pass lại từ cộng đồng cosplayer uy tín</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="bg-slate-100 rounded-full p-1 flex items-center shrink-0">
              <button className="px-4 py-2 bg-white rounded-full text-sm font-bold text-slate-900 shadow-sm">Tất cả</button>
              <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900">Chỉ đồ thuê</button>
              <button className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-900">Bán thanh lý</button>
            </div>
            <a href="/listings/create" className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-full text-sm font-bold shrink-0 transition flex items-center gap-2 shadow-sm">
              <span className="text-lg leading-none">+</span> Đăng đồ cho thuê / Bán pass
            </a>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Filter Sidebar (3 Cols) */}
          <aside className="lg:col-span-3 space-y-5 sticky top-24">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="text-brand-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                  </span>
                  BỘ LỌC SẢN PHẨM
                </h3>
                <button className="text-xs font-bold text-brand-600 hover:text-brand-700">Làm mới</button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-3">Size trang phục</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {['Size S', 'Size M', 'Size L', 'One-size'].map(s => (
                      <label key={s} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                        <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500" />
                        <span className="text-xs font-medium text-slate-700">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-3">Danh mục món đồ</h4>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none">
                    <option>Tất cả danh mục</option>
                    <option>Trang phục</option>
                    <option>Tóc giả</option>
                    <option>Vũ khí</option>
                    <option>Giày dép</option>
                  </select>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-1">Khu vực (PostGIS Matching)</h4>
                  <p className="text-[10px] text-slate-400 mb-3">Độ lệch an toàn Fuzzy ±500m</p>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 appearance-none">
                    <option>Toàn quốc</option>
                    <option>Hà Nội</option>
                    <option>TP. HCM</option>
                    <option>Đà Nẵng</option>
                  </select>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Listing Grid (9 Cols) */}
          <section className="lg:col-span-9 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-500 font-medium">Hiển thị {q ? `kết quả cho "${q}"` : 'các sản phẩm'}</p>
              <select className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none appearance-none shadow-sm cursor-pointer">
                <option>Mới đăng nhất</option>
                <option>Giá thấp nhất</option>
                <option>Giá cao nhất</option>
              </select>
            </div>
            
            <ListingsGrid query={q} />
          </section>

        </div>
      </div>
    </main>
  )
}
