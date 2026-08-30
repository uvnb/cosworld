'use client'

import { useState } from 'react'
import { applyForRecruitment } from '@/app/actions/recruitments'
import { Button } from '@/components/ui/button'

export function ApplyRecruitmentForm({ recruitmentId, roles }: { recruitmentId: string, roles: string[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const role = formData.get('role') as string
    const message = formData.get('message') as string

    if (!role) {
      setError('Vui lòng chọn vị trí ứng tuyển.')
      setLoading(false)
      return
    }

    const res = await applyForRecruitment(recruitmentId, role, message)
    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setIsOpen(false)
    }
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-lg shadow-brand-600/20 text-base h-auto">
        Ứng tuyển ngay
      </Button>
    )
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-2">
      <h4 className="font-bold text-slate-900 mb-3 text-sm">Gửi yêu cầu tham gia</h4>
      
      {error && <div className="text-xs text-red-600 mb-3 bg-red-50 p-2 rounded-lg">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Vị trí muốn ứng tuyển <span className="text-red-500">*</span></label>
          <select name="role" required className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500 outline-none">
            <option value="">Chọn vị trí...</option>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Lời nhắn & Link Portfolio</label>
          <textarea 
            name="message" 
            rows={3} 
            placeholder="Kinh nghiệm của bạn, link ảnh đã chụp, hoặc lời chào..."
            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-brand-500 outline-none resize-y"
          ></textarea>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1 rounded-xl text-xs">
            Hủy
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 bg-brand-600 hover:bg-brand-700 rounded-xl text-xs">
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </div>
      </form>
    </div>
  )
}
