import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, MapPin, ExternalLink, Bot } from 'lucide-react'
import { ManageEventButtons } from '@/components/admin/ManageEventButtons'

export default async function AdminEventsDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Vui lòng đăng nhập')
  }

  // Fetch pending events
  const { data: pendingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      <Link href="/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Về trang sự kiện
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Admin Dashboard: Duyệt Sự Kiện</h1>
        <p className="text-slate-500 mt-2">Danh sách các sự kiện được gửi từ Crawler hoặc do User đăng chờ xét duyệt.</p>
      </div>

      {/* Test Crawler Button (for demo purposes) */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-indigo-900 flex items-center gap-2"><Bot className="w-5 h-5"/> Cron Job Crawler (Giai đoạn 2)</h3>
          <p className="text-sm text-indigo-700/80 mt-1">Giả lập việc Cron cào dữ liệu từ Fanpage. Hãy click nút bên cạnh để chạy Test Crawler.</p>
        </div>
        <a href="/api/cron/crawl" target="_blank" rel="noreferrer">
          <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 whitespace-nowrap">
            Chạy Test Crawler
          </button>
        </a>
      </div>

      <div className="space-y-6">
        {!pendingEvents || pendingEvents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Không có sự kiện nào chờ duyệt</h3>
            <p className="text-sm text-slate-500 mt-1">Bạn đã xử lý hết tất cả các sự kiện.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingEvents.map(evt => (
              <div key={evt.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="flex gap-4 p-5">
                  <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                    <img 
                      src={evt.banner_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&auto=format&fit=crop&q=80"} 
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase">
                        Chờ duyệt
                      </span>
                      {evt.is_crawled && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase">
                          Auto-Crawl
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 leading-tight mb-2 line-clamp-2" title={evt.title}>{evt.title}</h3>
                    
                    <div className="space-y-1 mt-3 mb-3 text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(evt.start_date).toLocaleDateString('vi-VN')} {new Date(evt.end_date).getTime() !== new Date(evt.start_date).getTime() ? `- ${new Date(evt.end_date).toLocaleDateString('vi-VN')}` : ''}
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{evt.location} {evt.province ? ` - ${evt.province}` : ''}</span>
                      </div>
                    </div>
                    
                    {evt.source_url && (
                      <a href={evt.source_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline font-medium inline-flex items-center gap-1 mt-1">
                        Xem trang nguồn <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-slate-50 mt-auto">
                  <ManageEventButtons eventId={evt.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
