'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Trash2, Loader2 } from 'lucide-react'
import { deleteListing, toggleListingStatus } from '@/app/actions/listings'
import toast from 'react-hot-toast'

export function ListingActions({ listingId, currentStatus }: { listingId: string, currentStatus: string }) {
  const [isUpdating, setIsUpdating] = useState(false)
  const isActive = currentStatus === 'active'

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsUpdating(true)
    try {
      await toggleListingStatus(listingId, currentStatus)
      toast.success(isActive ? 'Đã ẩn sản phẩm' : 'Đã hiện sản phẩm')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return
    setIsUpdating(true)
    try {
      await deleteListing(listingId)
      toast.success('Đã xóa sản phẩm')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      <div className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded uppercase ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
        {isActive ? 'Đang hiển thị' : 'Đang ẩn'}
      </div>
      <div className="flex-1"></div>
      <button 
        onClick={handleToggleStatus}
        disabled={isUpdating}
        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition disabled:opacity-50"
        title={isActive ? 'Ẩn' : 'Hiện'}
      >
        {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />)}
      </button>
      <button 
        onClick={handleDelete}
        disabled={isUpdating}
        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition disabled:opacity-50"
        title="Xóa"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
