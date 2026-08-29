'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, ImagePlus, X } from 'lucide-react'

export default function CreateEventPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const [posterFile, setPosterFile] = useState<File | null>(null)
  const [posterPreview, setPosterPreview] = useState<string | null>(null)

  const handleFilePreview = async (file: File) => {
    try {
      const imageCompression = (await import('browser-image-compression')).default
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1, // Poster can be up to 1MB to preserve text
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp'
      })
      setPosterFile(compressedFile)
      setPosterPreview(URL.createObjectURL(compressedFile))
    } catch (error) {
      toast.error('Lỗi khi xử lý ảnh')
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    let poster_url = null
    try {
      if (posterFile) {
        toast.info('Đang tải ảnh poster lên...')
        const fileExt = 'webp'
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
        const filePath = `events/${fileName}`
        const fileType = 'image/webp'

        const res = await fetch('/api/upload/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: filePath, contentType: fileType }),
        })
        const { url, publicUrl } = await res.json()
        if (!url) throw new Error('Không lấy được link upload')

        const uploadRes = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': fileType },
          body: posterFile,
        })
        if (!uploadRes.ok) throw new Error('Upload ảnh thất bại')

        poster_url = publicUrl
      }

      const eventData = {
        name: formData.get('name'),
        description: formData.get('description'),
        venue: formData.get('venue'),
        city: formData.get('city'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        source_url: formData.get('source_url'),
        poster_url
      }

      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })
      
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      toast.success('Đã gửi sự kiện thành công! Chờ ban quản trị duyệt.')
      router.push('/events')
    } catch (error: any) {
      toast.error('Lỗi khi gửi sự kiện: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-slate-900 mb-2">Đóng góp sự kiện</h1>
      <p className="text-slate-500 mb-8">Biết một lễ hội hay sự kiện Cosplay sắp diễn ra? Hãy đăng lên đây để cộng đồng cùng biết nhé. (Sự kiện cần chờ admin duyệt).</p>

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        {/* Poster Image */}
        <div>
          <label className="text-sm font-bold text-slate-700 block mb-1.5">Ảnh Poster Sự Kiện</label>
          <div className="flex flex-col gap-3">
            {posterPreview ? (
              <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-200">
                <img src={posterPreview} alt="Poster preview" className="w-full h-auto object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setPosterFile(null)
                    setPosterPreview(null)
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="w-full max-w-sm h-48 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition group">
                <ImagePlus className="w-8 h-8 text-slate-400 group-hover:text-brand-500 mb-2" />
                <span className="text-sm font-medium text-slate-600 group-hover:text-brand-600">Thêm ảnh poster</span>
                <span className="text-xs text-slate-400 mt-1">Tự động nén WebP (Max 1MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFilePreview(f)
                  }}
                />
              </label>
            )}
          </div>
        </div>

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
