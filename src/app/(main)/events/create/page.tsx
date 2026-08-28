'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Vui lòng đăng nhập để đóng góp sự kiện')
      setLoading(false)
      return
    }

    const event = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      venue: formData.get('venue') as string,
      city: formData.get('city') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      source_url: formData.get('source_url') as string,
      submitted_by: user.id,
      source_type: 'crowdsourced',
      status: 'pending' // Chờ admin duyệt
    }

    const { error } = await supabase.from('events').insert(event)

    setLoading(false)
    if (error) {
      toast.error('Lỗi khi gửi sự kiện: ' + error.message)
    } else {
      toast.success('Đã gửi sự kiện thành công! Chờ ban quản trị duyệt.')
      router.push('/events')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-slate-900 mb-2">Đóng góp sự kiện</h1>
      <p className="text-slate-500 mb-8">Biết một lễ hội hay sự kiện Cosplay sắp diễn ra? Hãy đăng lên đây để cộng đồng cùng biết nhé. (Sự kiện cần chờ admin duyệt).</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div>
          <label className="text-sm font-bold text-slate-700 block mb-1.5">Tên sự kiện / Festival <span className="text-rose-500">*</span></label>
          <input required name="name" type="text" placeholder="VD: Natsu Matsuri 2026" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1.5">Ngày bắt đầu <span className="text-rose-500">*</span></label>
            <input required name="start_date" type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 outline-none" />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1.5">Ngày kết thúc <span className="text-rose-500">*</span></label>
            <input required name="end_date" type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1.5">Địa điểm tổ chức</label>
            <input name="venue" type="text" placeholder="VD: Nhà thi đấu Phú Thọ" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 outline-none" />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 block mb-1.5">Tỉnh / Thành phố <span className="text-rose-500">*</span></label>
            <select required name="city" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 outline-none bg-white">
              <option value="">Chọn thành phố</option>
              <option value="Hồ Chí Minh">Hồ Chí Minh</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700 block mb-1.5">Link nguồn (Facebook Post, Fanpage, Website)</label>
          <input name="source_url" type="url" placeholder="https://..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 outline-none" />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700 block mb-1.5">Mô tả ngắn</label>
          <textarea name="description" rows={4} placeholder="Giá vé, khách mời, hoạt động chính..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 outline-none resize-none"></textarea>
        </div>

        <div className="pt-4">
          <Button disabled={loading} type="submit" className="w-full h-12 text-base font-bold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/20">
            {loading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
            Gửi yêu cầu phê duyệt
          </Button>
        </div>
      </form>
    </div>
  )
}
