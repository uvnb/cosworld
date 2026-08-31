import { createClient } from '@/lib/supabase/server'
import { MapPin, Search, Filter, Plus, Users, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ q?: string, location?: string, role?: string, status?: string }> }) {
  const resolvedParams = await searchParams
  const q = resolvedParams?.q || ''
  const location = resolvedParams?.location || ''
  const role = resolvedParams?.role || ''
  const status = resolvedParams?.status || 'OPEN'

  const supabase = await createClient()
  
  let query = supabase
    .from('recruitments')
    .select('*, author:author_id(username, full_name, avatar_url, reputation_score)')
    .order('created_at', { ascending: false })
  
  if (q) {
    query = query.ilike('title', `%${q}%`)
  }
  if (location) {
    query = query.ilike('location', `%${location}%`)
  }
  if (status) {
    query = query.eq('status', status)
  }
  if (role) {
    query = query.contains('roles', [role])
  }

  const { data: recruitments, error } = await query

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 w-full flex-1 space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-600 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-3">Lập Team Cosplay & Tuyển Dụng Staff</h1>
            <p className="text-brand-100 text-lg max-w-2xl">Tìm đồng đội đi Festival, Makeup Artist, Photographer & Studio chuyên nghiệp nhanh chóng và uy tín.</p>
          </div>
          <Link href="/services/create" className="px-8 py-3.5 bg-white text-brand-700 hover:bg-slate-50 rounded-full text-base font-extrabold shrink-0 transition flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95">
            <Plus className="w-5 h-5" /> Đăng tin tuyển team
          </Link>
        </div>
        
        {/* Background shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 blur-3xl rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 -mb-20 w-72 h-72 bg-indigo-900/20 blur-2xl rounded-full pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar: Filters (3 Cols) */}
        <aside className="xl:col-span-3 space-y-6 sticky top-24">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-600" />
                BỘ LỌC TÌM KIẾM
              </h3>
              <Link href="/services" className="text-xs font-bold text-brand-600 hover:text-brand-700">Làm mới</Link>
            </div>

            <form className="space-y-6" action="/services" method="GET">
              
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-3">Tìm theo từ khóa</h4>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    name="q"
                    defaultValue={q}
                    placeholder="Tên fes, char..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-brand-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-3">Khu vực</h4>
                <input 
                  type="text" 
                  name="location"
                  defaultValue={location}
                  placeholder="Hà Nội, Cần Thơ..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-1 focus:ring-brand-500 outline-none"
                />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-3">Vai trò cần tìm</h4>
                <select name="role" defaultValue={role} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 appearance-none">
                  <option value="">Tất cả vai trò</option>
                  <option value="Cosplayer">Cosplayer</option>
                  <option value="Photographer">Photographer</option>
                  <option value="Makeup Artist">Makeup Artist</option>
                  <option value="Staff hỗ trợ">Staff hỗ trợ</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition">
                Áp dụng bộ lọc
              </button>
            </form>
          </div>
        </aside>

        {/* Right Feed (9 Cols) */}
        <section className="xl:col-span-9 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Mới nhất</h2>
            <div className="text-sm font-medium text-slate-500">
              Tìm thấy {recruitments?.length || 0} kết quả
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!error && recruitments && recruitments.length > 0 ? (
              recruitments.map(rec => {
                const author = Array.isArray(rec.author) ? rec.author[0] : rec.author;
                const repScore = author?.reputation_score !== undefined && author?.reputation_score !== null 
                  ? Math.floor(author.reputation_score) 
                  : 0;
                  
                return (
                  <div key={rec.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300 transition flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex gap-2">
                          {rec.roles?.slice(0, 2).map((r: string) => (
                            <span key={r} className="px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-black uppercase rounded-full tracking-wider">
                              Tuyển {r}
                            </span>
                          ))}
                          {rec.roles?.length > 2 && (
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase rounded-full">
                              +{rec.roles.length - 2}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-md">
                          Hạn: {new Date(rec.deadline).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-extrabold text-slate-900 mb-1.5 group-hover:text-brand-600 transition line-clamp-2">
                        {rec.title}
                      </h3>
                      
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {rec.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {rec.budget && (
                          <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-emerald-100">
                            💰 {rec.budget}
                          </span>
                        )}
                        <span className="px-2.5 py-1.5 bg-slate-50 text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-slate-200">
                          <MapPin className="w-3.5 h-3.5" /> {rec.location}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                      <Link href={`/profile/${author?.username || ''}`} className="flex items-center gap-3 hover:opacity-80 transition">
                        <img src={author?.avatar_url || `https://ui-avatars.com/api/?name=${author?.username || 'User'}`} className="w-9 h-9 rounded-full border border-slate-200 bg-slate-50" alt="avatar" />
                        <div>
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{author?.full_name || author?.username}</p>
                          <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-0.5">
                            ♥ {repScore} uy tín
                          </p>
                        </div>
                      </Link>
                      <Link href={`/services/${rec.id}`}>
                        <button className="px-4 py-2 bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white rounded-xl text-xs font-bold transition">
                          Ứng tuyển ngay
                        </button>
                      </Link>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">Chưa có bài tuyển dụng nào</h3>
                <p className="text-sm text-slate-500 mt-1">Hãy là người đầu tiên đăng tin lập team nhé!</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </main>
  )
}
