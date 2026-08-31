'use client'

import { useState } from 'react'
import { deleteEvent } from '@/app/actions/events'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sự kiện này? Hành động không thể hoàn tác.')) {
      return
    }

    setLoading(true)
    const res = await deleteEvent(eventId)
    
    if (res.error) {
      alert(res.error)
      setLoading(false)
    } else {
      router.push('/events')
    }
  }

  return (
    <button 
      disabled={loading}
      onClick={handleDelete}
      className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition flex items-center justify-center shadow-sm shrink-0"
      title="Xóa sự kiện (Chỉ Admin)"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
    </button>
  )
}
