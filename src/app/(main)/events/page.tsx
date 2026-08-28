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
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Sự kiện & Festival</h1>
          <p className="text-slate-500 mt-1">Lịch trình các lễ hội Cosplay và văn hóa Nhật Bản sắp diễn ra.</p>
        </div>
        <Link href="/events/create">
          <Button className="rounded-xl font-bold bg-brand-600 hover:bg-brand-700">
            <PlusCircle className="w-4 h-4 mr-2" /> Đóng góp sự kiện
          </Button>
        </Link>
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
    </div>
  )
}
