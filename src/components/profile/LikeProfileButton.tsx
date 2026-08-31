'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface LikeProfileButtonProps {
  profileId: string
  userId: string | undefined
  initialHasLiked: boolean
  initialScore: number
}

export function LikeProfileButton({ profileId, userId, initialHasLiked, initialScore }: LikeProfileButtonProps) {
  const [hasLiked, setHasLiked] = useState(initialHasLiked)
  const [score, setScore] = useState(initialScore)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleToggleLike() {
    if (!userId) {
      router.push('/login')
      return
    }

    if (userId === profileId) {
      alert('Bạn không thể tự thả tim cho chính mình!')
      return
    }

    setLoading(true)

    if (hasLiked) {
      // Bỏ thả tim
      setHasLiked(false)
      setScore(s => s - 1)
      const { error } = await supabase
        .from('reputation_votes')
        .delete()
        .eq('profile_id', profileId)
        .eq('voter_id', userId)

      if (error) {
        setHasLiked(true)
        setScore(s => s + 1)
        alert('Lỗi: ' + error.message)
      }
    } else {
      // Thả tim
      setHasLiked(true)
      setScore(s => s + 1)
      
      const { error } = await supabase
        .from('reputation_votes')
        .insert({
          profile_id: profileId,
          voter_id: userId,
          vote_value: 1
        })

      if (error) {
        setHasLiked(false)
        setScore(s => s - 1)
        alert('Lỗi: ' + error.message)
      }
    }

    setLoading(false)
  }

  return (
    <button 
      onClick={handleToggleLike}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1 text-sm font-bold rounded-full border transition hover:scale-105 ml-2 cursor-pointer
        ${hasLiked 
          ? 'bg-rose-50 text-rose-600 border-rose-200' 
          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-rose-50 hover:text-rose-500'
        }`}
    >
      <Heart className={`w-4 h-4 transition ${hasLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
      <span>{score}</span>
    </button>
  )
}
