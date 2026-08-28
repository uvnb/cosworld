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

  const getIcon = (type: string) => {
    switch (type) {
      case 'makeup': return <Sparkles className="w-5 h-5 text-pink-500" />
      case 'photographer': return <Camera className="w-5 h-5 text-indigo-500" />
      case 'staff': return <UserCheck className="w-5 h-5 text-emerald-500" />
      default: return <Sparkles className="w-5 h-5" />
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Dịch vụ bổ trợ (Add-ons)</h1>
          <p className="text-slate-500 mt-1">Tìm kiếm Makeup Artist, Photographer và Staff hỗ trợ đi fes.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <a href="/services" className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition ${!typeFilter ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Tất cả</a>
          <a href="/services?type=makeup" className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition ${typeFilter === 'makeup' ? 'bg-pink-600 text-white' : 'bg-pink-50 text-pink-600 hover:bg-pink-100'}`}>Makeup</a>
          <a href="/services?type=photographer" className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition ${typeFilter === 'photographer' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>Photographer</a>
          <a href="/services?type=staff" className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition ${typeFilter === 'staff' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>Staff / Helper</a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {services?.map(srv => {
          const owner = Array.isArray(srv.owner) ? srv.owner[0] : srv.owner
          const zaloLink = owner?.phone ? `https://zalo.me/${owner.phone}` : '#'

          return (
            <div key={srv.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                  {getIcon(srv.service_type)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{srv.title}</h3>
                  <p className="text-xs text-slate-500 uppercase font-semibold">{srv.service_type}</p>
                </div>
              </div>

              <div className="space-y-3 mb-5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-[10px]">VNĐ</span>
                  <span className="font-bold text-slate-900">{srv.price_per_session?.toLocaleString('vi-VN')}đ</span> / buổi
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {srv.city}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={owner?.avatar_url || "https://ui-avatars.com/api/?name=User"} className="w-8 h-8 rounded-full" alt="avatar" />
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[100px]">{owner?.username}</span>
                </div>
                <a href={zaloLink} target="_blank" rel="noreferrer">
                  <Button size="sm" className="rounded-lg font-bold">Liên hệ Zalo</Button>
                </a>
              </div>
            </div>
          )
        })}

        {!services?.length && (
          <div className="col-span-full py-20 text-center text-slate-400">
            Không tìm thấy dịch vụ nào phù hợp.
          </div>
        )}
      </div>
    </div>
  )
}
