'use client'

import { useState } from 'react'
import { manageApplication } from '@/app/actions/recruitments'
import { Check, X } from 'lucide-react'

export function ManageApplicationButtons({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false)

  async function handleAction(status: 'ACCEPTED' | 'REJECTED') {
    setLoading(true)
    const res = await manageApplication(applicationId, status)
    if (res.error) {
      alert(res.error)
      setLoading(false)
    }
    // if success, revalidation will update UI automatically
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button 
        disabled={loading}
        onClick={() => handleAction('ACCEPTED')}
        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-xs font-bold transition flex items-center gap-1"
      >
        <Check className="w-4 h-4" /> Duyệt
      </button>
      <button 
        disabled={loading}
        onClick={() => handleAction('REJECTED')}
        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold transition flex items-center gap-1"
      >
        <X className="w-4 h-4" /> Từ chối
      </button>
    </div>
  )
}
