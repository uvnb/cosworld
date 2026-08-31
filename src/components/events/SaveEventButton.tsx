'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function SaveEventButton({ eventId, isSavedInitially, userId }: { eventId: string, isSavedInitially: boolean, userId?: string }) {
  const [isSaved, setIsSaved] = useState(isSavedInitially)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleToggle() {
    if (!userId) {
      router.push('/login')
      return
    }

    setLoading(true)
    if (isSaved) {
      const { error } = await supabase.from('saved_events').delete().eq('event_id', eventId).eq('user_id', userId)
      if (error) {
        alert('Lỗi: ' + error.message)
      } else {
        setIsSaved(false)
      }
    } else {
      const { error } = await supabase.from('saved_events').insert({ event_id: eventId, user_id: userId })
      if (error) {
        alert('Lỗi: ' + error.message)
      } else {
        setIsSaved(true)
      }
    }
    setLoading(false)
    router.refresh()
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
