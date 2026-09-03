'use client'

import { useState } from 'react'
import { submitEvent } from '@/app/actions/events'
import { Calendar, MapPin, Link2, FileText, Send, X } from 'lucide-react'

export function SubmitEventForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const res = await submitEvent(formData)

    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full text-center relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
          <X className="w-6 h-6" />
        </button>
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <Send className="w-8 h-8 ml-1" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Gửi thành công!</h2>
        <p className="text-slate-600 mb-6">
          Cảm ơn bạn đã đóng góp. Sự kiện của bạn đã được gửi cho Ban quản trị xét duyệt.
          Bạn sẽ nhận được thông báo khi sự kiện được duyệt và được cộng điểm Uy tín.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition"
        >
          Đóng cửa sổ
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full relative shadow-2xl max-h-[90vh] overflow-y-auto">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
        <X className="w-6 h-6" />
      </button>
      
      <div className="mb-6">
        <h2 className="text-2xl font-black text-slate-900">Đóng góp Sự kiện mới</h2>
        <p className="text-slate-500 mt-1">Cùng xây dựng lịch trình Fes phong phú nhất Việt Nam.</p>
      </div>

      {error && (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-medium mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Tên sự kiện / Festival <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="VD: Natsu Matsuri 2026..."
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Link nguồn (Facebook / Website) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="url"
              name="source_url"
              required
              placeholder="https://facebook.com/..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition font-medium"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Dùng để Admin xác thực thông tin và tránh trùng lặp.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Ngày bắt đầu <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="date"
                name="start_date"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition font-medium"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Ngày kết thúc (Không bắt buộc)
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="date"
                name="end_date"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition font-medium"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Tỉnh / Thành phố <span className="text-rose-500">*</span>
            </label>
            <select
              name="province"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition font-medium"
            >
              <option value="">Chọn Tỉnh/Thành</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. HCM">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Cần Thơ">Cần Thơ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Địa điểm cụ thể
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="location"
                placeholder="VD: SECC Quận 7"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition font-medium"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">
            Mô tả thêm (Không bắt buộc)
          </label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
            <textarea
              name="description"
              rows={3}
              placeholder="Giá vé, khách mời, lưu ý đặc biệt..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition font-medium resize-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 text-lg shadow-lg shadow-brand-600/30"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Gửi yêu cầu xét duyệt
            </>
          )}
        </button>
      </form>
    </div>
  )
}
