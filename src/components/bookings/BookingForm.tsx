'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, CalendarDays, Loader2 } from 'lucide-react'
import { createBookingAction } from '@/app/actions/booking'
import { toast } from 'sonner'
import { format, differenceInDays } from 'date-fns'

export function BookingForm({ 
  listingId, 
  pricePerDay, 
  minDays, 
  zaloPhone 
}: { 
  listingId: string
  pricePerDay: number
  minDays: number
  zaloPhone: string | null
}) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<any>(null)

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      toast.error('Vui lòng chọn ngày bắt đầu và kết thúc')
      return
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start > end) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu')
      return
    }

    const days = differenceInDays(end, start) + 1
    if (days < minDays) {
      toast.error(`Sản phẩm này yêu cầu thuê ít nhất ${minDays} ngày`)
      return
    }

    setIsLoading(true)
    const res = await createBookingAction(listingId, startDate, endDate)
    setIsLoading(false)

    if (res.success) {
      toast.success('Gửi yêu cầu thuê thành công! Hệ thống đã khóa lịch tạm thời (60 phút).')
      setBookingSuccess(res.booking)
    } else {
      toast.error(res.error)
    }
  }

  if (bookingSuccess) {
    const zaloDeepLink = zaloPhone ? `https://zalo.me/${zaloPhone}?text=${encodeURIComponent(`Xin chào, tôi muốn thuê đồ này trên CosWorld.\nMã đơn: #${bookingSuccess.id.substring(0,8)}`)}` : null
    return (
      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
        <h3 className="font-bold text-emerald-800 text-lg mb-2">Đã tạo đơn thành công!</h3>
        <p className="text-emerald-700 text-sm mb-4">
          Lịch thuê của bạn đã được <strong>khóa tạm thời trong 60 phút</strong>. Vui lòng chat ngay với chủ đồ để thanh toán tiền cọc. Quá 60 phút hệ thống sẽ tự động hủy lịch.
        </p>
        {zaloDeepLink ? (
          <a href={zaloDeepLink} target="_blank" rel="noreferrer">
            <Button className="w-full h-12 text-base font-bold rounded-xl bg-[#0068FF] hover:bg-[#0054cc] shadow-md text-white">
              <MessageCircle className="w-5 h-5 mr-2" />
              Chat Zalo để xác nhận cọc
            </Button>
          </a>
        ) : (
          <Button disabled className="w-full h-12 text-base font-bold rounded-xl">
            Chủ đồ chưa cập nhật số điện thoại
          </Button>
        )}
        <p className="text-xs text-slate-500 mt-3 font-mono">Mã Đơn: #{bookingSuccess.id.split('-')[0]}</p>
      </div>
    )
  }

  // Calculate projected cost
  let totalCost = 0
  let days = 0
  if (startDate && endDate) {
    const s = new Date(startDate)
    const e = new Date(endDate)
    if (s <= e) {
      days = differenceInDays(e, s) + 1
      totalCost = days * pricePerDay
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xl shadow-brand-500/5">
      <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
        <CalendarDays className="w-5 h-5 text-brand-600" />
        Chọn ngày thuê
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-xs font-bold text-slate-600 mb-1.5 block">Ngày nhận đồ</label>
          <input 
            type="date" 
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-brand-500 outline-none text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 mb-1.5 block">Ngày trả đồ</label>
          <input 
            type="date" 
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-brand-500 outline-none text-sm"
          />
        </div>
      </div>

      {days > 0 && (
        <div className="flex justify-between items-center py-3 border-t border-slate-100 mb-2">
          <span className="text-sm font-medium text-slate-600">Tổng phí thuê ({days} ngày)</span>
          <span className="text-lg font-black text-slate-900">{totalCost.toLocaleString('vi-VN')}đ</span>
        </div>
      )}

      <Button 
        onClick={handleBooking} 
        disabled={isLoading || !startDate || !endDate || days < minDays}
        className="w-full h-12 text-base font-bold rounded-xl bg-brand-600 hover:bg-brand-700 shadow-md shadow-brand-600/20"
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        Tạo yêu cầu thuê & Khóa lịch
      </Button>
      <p className="text-[10px] text-center text-slate-400 mt-3">
        Tiền cọc sẽ thoả thuận và thanh toán trực tiếp qua Zalo/Messenger
      </p>
    </div>
  )
}
