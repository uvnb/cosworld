'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle } from 'lucide-react'
import { CreateReviewDialog } from '@/components/profile/CreateReviewDialog'

interface BookingActionsProps {
  bookingId: string
  listingId: string
  revieweeId: string
  status: string
  isOwner: boolean
  onStatusChange?: (newStatus: string) => void
}

export function BookingActions({ bookingId, listingId, revieweeId, status, isOwner, onStatusChange }: BookingActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const updateStatus = async (newStatus: string) => {
    setIsLoading(true)
    try {
      if (newStatus === 'cancelled' || newStatus === 'rejected') {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'rejected' })
          .eq('id', bookingId)
        
        if (error) throw error
        toast.success('Đã từ chối yêu cầu giao dịch')
        
        // Notify Renter
        const { createNotification } = await import('@/app/actions/notifications')
        await createNotification(
          revieweeId, // Reviewee is Renter here
          'BOOKING_REJECTED',
          'Yêu cầu bị từ chối',
          `Yêu cầu giao dịch của bạn đã bị từ chối.`,
          '#'
        )
      } else {
        const { error } = await supabase
          .from('bookings')
          .update({ status: newStatus })
          .eq('id', bookingId)

        if (error) throw error

        // Notify Renter
        const { createNotification } = await import('@/app/actions/notifications')
        let notifTitle = 'Giao dịch cập nhật'
        let notifBody = `Giao dịch của bạn đã chuyển sang trạng thái: ${newStatus}`
        if (newStatus === 'confirmed') {
          notifTitle = 'Yêu cầu được chấp nhận'
          notifBody = 'Chủ đồ đã chấp nhận yêu cầu giao dịch của bạn!'
        } else if (newStatus === 'completed') {
          notifTitle = 'Giao dịch hoàn tất'
          notifBody = 'Giao dịch đã hoàn tất. Hãy để lại đánh giá nhé!'
        }
        await createNotification(
          revieweeId, // Renter
          `BOOKING_${newStatus.toUpperCase()}`,
          notifTitle,
          notifBody,
          '#'
        )

        if (newStatus === 'completed' && isOwner) {
          if (window.confirm('Giao dịch đã hoàn thành! Bạn có muốn ẨN bài đăng sản phẩm này trên trang "Thuê & Mua bán" để không nhận thêm yêu cầu mới không?\n(Chọn OK để Ẩn, Hủy để Giữ nguyên)')) {
            await supabase.from('listings').update({ status: 'inactive' }).eq('id', listingId)
            toast.success('Đã ẩn bài đăng thành công!')
          }
        }
        toast.success('Cập nhật trạng thái thành công')
      }
      
      if (onStatusChange) {
        onStatusChange(newStatus)
      } else {
        router.refresh()
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi cập nhật')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'pending' && isOwner) {
    return (
      <div className="flex items-center gap-2 mt-3 sm:mt-2 justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-8 rounded-lg"
          onClick={() => updateStatus('cancelled')}
          disabled={isLoading}
        >
          Từ chối
        </Button>
        <Button 
          size="sm" 
          className="text-xs h-8 rounded-lg bg-brand-600 hover:bg-brand-700"
          onClick={() => updateStatus('confirmed')}
          disabled={isLoading}
        >
          Đồng ý
        </Button>
      </div>
    )
  }

  if (status === 'confirmed' && isOwner) {
    return (
      <div className="flex items-center gap-2 mt-3 sm:mt-2 justify-end">
        <Button 
          size="sm" 
          className="text-xs h-8 rounded-lg bg-green-600 hover:bg-green-700 text-white"
          onClick={() => updateStatus('completed')}
          disabled={isLoading}
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Đánh dấu Hoàn thành
        </Button>
      </div>
    )
  }
  
  if (status === 'completed' && !isOwner) {
    return (
      <div className="flex items-center gap-2 mt-3 sm:mt-2 justify-end">
        <CreateReviewDialog bookingId={bookingId} revieweeId={revieweeId} />
      </div>
    )
  }

  return null
}
