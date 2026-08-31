'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toggleSaveEventAction } from '@/app/actions/interactions'

export function SaveEventButton({ eventId, isSavedInitially, userId }: { eventId: string, isSavedInitially: boolean, userId?: string }) {
  const [isSaved, setIsSaved] = useState(isSavedInitially)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleToggle() {
    if (!userId) {
      router.push('/login')
      return
    }

    setLoading(true)
    if (isSaved) {
      const result = await toggleSaveEventAction(eventId, userId, isSaved)
      if (result?.error) {
        alert('Lỗi: ' + result.error)
      } else {
        setIsSaved(false)
      }
    } else {
      const result = await toggleSaveEventAction(eventId, userId, isSaved)
      if (result?.error) {
        alert('Lỗi: ' + result.error)
      } else {
        setIsSaved(true)
      }
    }
    setLoading(false)
  }

  return (
    <button 
      onClick={handleToggle}
      disabled={loading}
      className={`w-full md:w-48 py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg ${isSaved ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'}`}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
      {isSaved ? 'Đã lưu vào lịch' : 'Thêm vào lịch cá nhân'}
    </button>
  )
}
