'use client'

import { useState } from 'react'
import { manageEvent } from '@/app/actions/events'
import { Check, X } from 'lucide-react'

export function ManageEventButtons({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleAction(status: 'APPROVED' | 'REJECTED') {
    setLoading(true)
    const res = await manageEvent(eventId, status)
    if (res.error) {
      alert(res.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        disabled={loading}
        onClick={() => handleAction('APPROVED')}
        className="flex-1 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
      >
        <Check className="w-4 h-4" /> Duyệt
      </button>
      <button 
        disabled={loading}
        onClick={() => handleAction('REJECTED')}
        className="flex-1 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2"
      >
        <X className="w-4 h-4" /> Từ chối
      </button>
    </div>
  )
}
