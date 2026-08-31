'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toggleLikeProfileAction } from '@/app/actions/interactions'

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
      const result = await toggleLikeProfileAction(profileId, userId, hasLiked)

      if (result?.error) {
        setHasLiked(true)
        setScore(s => s + 1)
        alert('Lỗi: ' + result.error)
      }
    } else {
      // Thả tim
      setHasLiked(true)
      setScore(s => s + 1)
      
      const result = await toggleLikeProfileAction(profileId, userId, hasLiked)

      if (result?.error) {
        setHasLiked(false)
        setScore(s => s - 1)
        alert('Lỗi: ' + result.error)
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
