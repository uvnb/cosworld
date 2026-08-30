'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ImagePlus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function generateSlug(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    + '-' + Date.now().toString().slice(-6)
}

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Bạn cần đăng nhập để đăng sự kiện.')
      }

      const title = formData.get('title') as string
      
      const eventData = {
        title: title,
        slug: generateSlug(title),
        description: formData.get('description'),
        location: formData.get('location'),
        province: formData.get('province'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        source_url: formData.get('source_url'),
        ticket_price: formData.get('ticket_price'),
        is_crawled: false,
        status: 'PENDING'
      }

      const { error } = await supabase.from('events').insert(eventData)
      if (error) {
        if (error.code === '23505') {
          throw new Error('Sự kiện này đã tồn tại trên hệ thống (Trùng tên và ngày bắt đầu).')
        }
        throw error
      }

      setSuccessMsg('Đã gửi sự kiện thành công! Chờ ban quản trị duyệt.')
      setTimeout(() => {
        router.push('/events')
      }, 2000)
    } catch (error: any) {
      setErrorMsg(error.message || 'Lỗi khi gửi sự kiện')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/events" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách sự kiện
      </Link>
      
      <h1 className="text-3xl font-black text-slate-900 mb-2">Đăng thông tin Sự kiện / Festival</h1>
      <p className="text-slate-500 mb-8">Chia sẻ sự kiện Cosplay sắp diễn ra với cộng đồng. Sự kiện sẽ được admin duyệt trước khi hiển thị công khai.</p>

      {errorMsg && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl font-bold mb-6 border border-rose-100">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl font-bold mb-6 border border-emerald-100">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">Tên sự kiện / Festival <span className="text-rose-500">*</span></label>
          <input type="text" name="title" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="VD: Natsu Matsuri 2026" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Ngày bắt đầu <span className="text-rose-500">*</span></label>
            <input type="datetime-local" name="start_date" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Ngày kết thúc <span className="text-rose-500">*</span></label>
            <input type="datetime-local" name="end_date" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Địa điểm tổ chức <span className="text-rose-500">*</span></label>
            <input type="text" name="location" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="VD: Nhà thi đấu Phú Thọ" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Khu vực (Tỉnh/Thành) <span className="text-rose-500">*</span></label>
            <select name="province" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. HCM">TP. HCM</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Giá vé (Nếu có)</label>
            <input type="text" name="ticket_price" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="VD: 150.000đ hoặc Miễn phí" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900">Link nguồn / Bài viết BTC</label>
            <input type="url" name="source_url" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://facebook.com/..." />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-900">Mô tả chi tiết sự kiện</label>
          <textarea name="description" rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Thông tin về khách mời, hoạt động, cuộc thi..."></textarea>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Gửi Yêu Cầu Đăng Sự Kiện'}
        </button>
      </form>
    </div>
  )
}
