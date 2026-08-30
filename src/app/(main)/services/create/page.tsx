'use client'

import { useState } from 'react'
import { createRecruitment } from '@/app/actions/recruitments'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, MapPin, DollarSign, Calendar, Users } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateRecruitmentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const availableRoles = ['Cosplayer', 'Photographer', 'Makeup Artist', 'Staff hỗ trợ']

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const res = await createRecruitment(formData)
    
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      router.push(`/services/${res.id}`)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl px-4 sm:px-6">
      <Link href="/services" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </Link>
      
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Đăng tin Tuyển Team / Staff</h1>
          <p className="text-slate-500 mt-2">Tìm kiếm đồng đội hoàn hảo cho project sắp tới của bạn.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 block">Tiêu đề bài tuyển <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              name="title" 
              required
              placeholder="VD: [Hà Nội] Cần 1 Photographer chụp ngoại cảnh Concept Wuthering Waves" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 block">Nội dung chi tiết <span className="text-red-500">*</span></label>
            <textarea 
              name="description" 
              required
              rows={5}
              placeholder="Mô tả chi tiết yêu cầu công việc, quyền lợi, thời gian..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition resize-y"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-500"/> Khu vực / Địa chỉ <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="location" 
                required
                placeholder="VD: Công viên Yên Sở, Hà Nội"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-500"/> Hạn chót ứng tuyển <span className="text-red-500">*</span></label>
              <input 
                type="date" 
                name="deadline" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2"><DollarSign className="w-4 h-4 text-slate-500"/> Ngân sách / Thù lao (Tùy chọn)</label>
            <input 
              type="text" 
              name="budget" 
              placeholder="VD: 500k/buổi, Hỗ trợ chi phí, Thỏa thuận..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-500 outline-none transition"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-2"><Users className="w-4 h-4 text-slate-500"/> Vai trò cần tuyển (Chọn nhiều) <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {availableRoles.map(role => (
                <label key={role} className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition group">
                  <input type="checkbox" name="roles" value={role} className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300" />
                  <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <Button type="submit" disabled={loading} className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-600/20 text-base h-auto">
              {loading ? 'Đang xử lý...' : (
                <><Save className="w-5 h-5 mr-2" /> Đăng Tuyển Ngay</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
