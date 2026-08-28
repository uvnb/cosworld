import { createClient } from '@/lib/supabase/server'
import { Camera, Sparkles, UserCheck, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ServicesPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const resolvedParams = await searchParams
  const typeFilter = resolvedParams?.type || ''

  const supabase = await createClient()
  let query = supabase.from('addon_providers').select('*, owner:owner_id(username, avatar_url, phone)')
  
  if (typeFilter) {
    query = query.eq('service_type', typeFilter)
  }

  const { data: services } = await query

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Lập Team Cosplay & Tuyển Dụng Staff</h1>
          <p className="text-slate-500 text-sm mt-1">Tìm đồng đội đi Festival, Makeup Artist, Photographer & Studio chuyên nghiệp</p>
        </div>
        <button className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-full text-sm font-bold shrink-0 transition flex items-center gap-2 shadow-sm whitespace-nowrap">
          <span className="text-lg leading-none">+</span> Đăng tin tuyển team / staff
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Placeholder Demo Cards similar to Screenshot since addon_providers doesn't exactly match the "tuyển team" concept perfectly yet */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-brand-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-bold uppercase rounded-full">Tuyển Cosplayer</span>
              <span className="text-[11px] text-slate-400 font-medium">Hạn: 10/09/2026</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">[TP.HCM] Tuyển Full Cast Nữ Genshin đi Fes Summer 2026</h3>
            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
              Đã có Furina, Raiden, Hu Tao. Cần thêm 1 Arlecchino và 1 Yelan. Team hỗ trợ tiền vé và studio chụp sau fes.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold rounded-md">Cosplayer</span>
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold rounded-md">Makeup Artist</span>
              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold rounded-md">Hỗ trợ vé & studio</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://ui-avatars.com/api/?name=Yukari" className="w-10 h-10 rounded-full" alt="avatar" />
              <div>
                <p className="text-sm font-bold text-slate-900">Yukari</p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> TP. HCM</p>
              </div>
            </div>
            <button className="px-5 py-2 bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white rounded-full text-xs font-bold transition">
              Ứng tuyển ngay
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-brand-300 transition flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-pink-50 text-pink-600 text-[10px] font-bold uppercase rounded-full">Tuyển Photographer</span>
              <span className="text-[11px] text-slate-400 font-medium">Hạn: 15/09/2026</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">[Hà Nội] Cần 1 Photographer chụp ngoại cảnh Concept Wuthering Waves</h3>
            <p className="text-sm text-slate-600 line-clamp-2 mb-4">
              Thời gian chụp: Chiều thứ 7 (14h-17h) tại Công viên Yên Sở. Yêu cầu có kinh nghiệm chụp blend màu tone dark-fantasy.
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-600 text-[10px] font-bold rounded-md">Photographer</span>
              <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold rounded-md">800k/buổi</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://ui-avatars.com/api/?name=Kaito" className="w-10 h-10 rounded-full" alt="avatar" />
              <div>
                <p className="text-sm font-bold text-slate-900">Kaito</p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> Hà Nội</p>
              </div>
            </div>
            <button className="px-5 py-2 bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white rounded-full text-xs font-bold transition">
              Ứng tuyển ngay
            </button>
          </div>
        </div>

        {/* Dynamic content if any */}
        {services?.map(srv => {
          const owner = Array.isArray(srv.owner) ? srv.owner[0] : srv.owner
          const zaloLink = owner?.phone ? `https://zalo.me/${owner.phone}` : '#'

          return (
            <div key={srv.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-brand-300 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-full">{srv.service_type}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{srv.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                  Cung cấp dịch vụ {srv.service_type}.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-bold rounded-md">{srv.price_per_session?.toLocaleString('vi-VN')}đ / buổi</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={owner?.avatar_url || "https://ui-avatars.com/api/?name=User"} className="w-10 h-10 rounded-full" alt="avatar" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{owner?.username}</p>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {srv.city}</p>
                  </div>
                </div>
                <a href={zaloLink} target="_blank" rel="noreferrer">
                  <button className="px-5 py-2 bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white rounded-full text-xs font-bold transition">
                    Ứng tuyển ngay
                  </button>
                </a>
              </div>
            </div>
          )
        })}

      </div>
    </div>
  )
}
