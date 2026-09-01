'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Star } from 'lucide-react'

interface CreateReviewDialogProps {
  bookingId: string
  revieweeId: string
}

export function CreateReviewDialog({ bookingId, revieweeId }: CreateReviewDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error('Vui lòng chọn số sao từ 1 đến 5')
      return
    }

    if (!comment.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá')
      return
    }

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if review already exists to prevent duplicate reviews
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('reviewer_id', user.id)
        .maybeSingle()

      if (existingReview) {
        throw new Error('Bạn đã đánh giá giao dịch này rồi.')
      }

      const { error } = await supabase.from('reviews').insert({
        booking_id: bookingId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating,
        comment,
        is_published: true
      })

      if (error) throw error

      toast.success('Đã gửi đánh giá thành công!')
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Có lỗi xảy ra khi gửi đánh giá')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={<Button size="sm" variant="outline" className="text-xs h-8 rounded-lg border-brand-200 text-brand-600 hover:bg-brand-50">Viết đánh giá</Button>} 
      />
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Đánh giá giao dịch</DialogTitle>
          <DialogDescription>
            Chia sẻ trải nghiệm của bạn với đối tác để giúp cộng đồng CosWorld xây dựng môi trường an toàn và uy tín.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-bold text-slate-700">Đánh giá độ uy tín (1-5 sao)</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star 
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating) 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'fill-slate-100 text-slate-200'
                    } transition-colors`} 
                  />
                </button>
              ))}
            </div>
            <span className="text-xs text-brand-600 font-medium">
              {['Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'][rating - 1]}
            </span>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-bold text-slate-700">Chi tiết trải nghiệm của bạn</span>
            <Textarea 
              placeholder="Sản phẩm có giống mô tả không? Đối tác có nhiệt tình không?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px] resize-none rounded-xl"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl font-bold h-11 w-full sm:w-auto">
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="rounded-xl font-bold h-11 bg-brand-600 hover:bg-brand-700 w-full sm:w-auto">
            {isLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
