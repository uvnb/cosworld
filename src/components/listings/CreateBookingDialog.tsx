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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CalendarDays, ShoppingCart } from 'lucide-react'

interface CreateBookingDialogProps {
  listingId: string
  ownerId: string
  listingType: string
  pricePerDay: number | null
  salePrice: number | null
  depositAmount: number | null
  isLoggedIn: boolean
}

export function CreateBookingDialog({
  listingId,
  ownerId,
  listingType,
  pricePerDay,
  salePrice,
  depositAmount,
  isLoggedIn
}: CreateBookingDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const isRentType = ['rent', 'both', 'want_to_rent'].includes(listingType)
  const isSaleType = ['sale', 'both', 'want_to_buy'].includes(listingType)
  
  // Choose default tab if 'both'
  const [selectedType, setSelectedType] = useState<'rent' | 'sale'>(
    listingType === 'sale' || listingType === 'want_to_buy' ? 'sale' : 'rent'
  )

  const handleSubmit = async () => {
    if (!isLoggedIn) {
      toast.error('Vui lòng đăng nhập để thực hiện giao dịch')
      router.push('/login')
      return
    }

    if (selectedType === 'rent' && (!startDate || !endDate)) {
      toast.error('Vui lòng chọn ngày bắt đầu và ngày kết thúc')
      return
    }

    if (selectedType === 'rent' && new Date(startDate) > new Date(endDate)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu')
      return
    }

    setIsLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let sDate = startDate
      let eDate = endDate
      let bDate = endDate // default buffer
      let totalFee = 0
      let total = 0
      let deposit = depositAmount || 0

      if (selectedType === 'rent') {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
        totalFee = days * (pricePerDay || 0)
        total = totalFee + deposit
        // Add 2 days for buffer
        const buffer = new Date(end)
        buffer.setDate(buffer.getDate() + 2)
        bDate = buffer.toISOString().split('T')[0]
      } else {
        // Sale type
        sDate = new Date().toISOString().split('T')[0]
        eDate = sDate
        bDate = sDate
        totalFee = 0
        deposit = 0
        total = salePrice || 0
      }

      const { error } = await supabase.from('bookings').insert({
        listing_id: listingId,
        renter_id: user.id,
        owner_id: ownerId,
        start_date: sDate,
        end_date: eDate,
        buffer_end_date: bDate,
        total_rental_fee: totalFee,
        deposit_amount: deposit,
        total_amount: total,
        status: 'pending' // Chờ xác nhận
      })

      if (error) throw error

      toast.success('Đã gửi yêu cầu giao dịch! Vui lòng nhắn tin với đối tác để chốt đơn.')
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Có lỗi xảy ra khi gửi yêu cầu')
    } finally {
      setIsLoading(false)
    }
  }

  // Define button text based on listing type
  let buttonText = 'Tạo Giao Dịch'
  if (listingType === 'rent') buttonText = 'Gửi yêu cầu thuê'
  if (listingType === 'sale') buttonText = 'Gửi yêu cầu mua'
  if (listingType === 'want_to_rent') buttonText = 'Đồng ý cho người này thuê'
  if (listingType === 'want_to_buy') buttonText = 'Đồng ý bán cho người này'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={<Button className="w-full mt-4 bg-brand-600 hover:bg-brand-700 text-white font-bold h-11 rounded-xl">{buttonText}</Button>} 
      />
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black">Xác nhận giao dịch</DialogTitle>
          <DialogDescription>
            CosWorld chỉ đóng vai trò ghi nhận lịch sử để bạn có thể đánh giá (review) sau khi hoàn thành. Việc thanh toán sẽ do 2 bên tự thoả thuận.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {listingType === 'both' && (
            <div className="flex gap-2">
              <Button 
                variant={selectedType === 'rent' ? 'default' : 'outline'}
                onClick={() => setSelectedType('rent')}
                className={`flex-1 ${selectedType === 'rent' ? 'bg-brand-600 hover:bg-brand-700' : ''}`}
              >
                <CalendarDays className="w-4 h-4 mr-2" /> Thuê đồ
              </Button>
              <Button 
                variant={selectedType === 'sale' ? 'default' : 'outline'}
                onClick={() => setSelectedType('sale')}
                className={`flex-1 ${selectedType === 'sale' ? 'bg-brand-600 hover:bg-brand-700' : ''}`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" /> Mua đứt
              </Button>
            </div>
          )}

          {selectedType === 'rent' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="font-bold">Ngày lấy đồ</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="font-bold">Ngày trả đồ</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  className="rounded-xl"
                />
              </div>
            </div>
          )}
          
          {selectedType === 'sale' && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600 text-center">
              Xác nhận bạn muốn ghi nhận giao dịch mua/bán đồ (Pass lại) này?
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl font-bold h-11 w-full sm:w-auto">
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="rounded-xl font-bold h-11 bg-brand-600 hover:bg-brand-700 w-full sm:w-auto">
            {isLoading ? 'Đang xử lý...' : 'Xác nhận gửi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
