'use client'

import { useState } from 'react'
import { deleteRecruitment } from '@/app/actions/recruitments'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function DeleteRecruitmentButton({ recruitmentId, redirectTo }: { recruitmentId: string, redirectTo?: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Bạn có chắc chắn muốn xóa bài đăng này? Mọi đơn ứng tuyển sẽ bị xóa.')) return

    setLoading(true)
    const res = await deleteRecruitment(recruitmentId)
    
    if (res.error) {
      alert(res.error)
      setLoading(false)
    } else {
      if (redirectTo) {
        router.push(redirectTo)
      }
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition flex items-center justify-center shrink-0"
      title="Xóa bài đăng"
    >
      <Trash2 className="w-5 h-5" />
    </button>
  )
}
