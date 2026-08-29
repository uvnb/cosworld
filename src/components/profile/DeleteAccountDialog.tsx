'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, X, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DeleteAccountDialogProps {
  email: string
  phone: string | null
}

  export function DeleteAccountDialog({ email, phone }: DeleteAccountDialogProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [confirmEmail, setConfirmEmail] = useState('')
    const [confirmPhone, setConfirmPhone] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const router = useRouter()
  
    async function handleDelete(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      setErrorMsg('')
      
      if (confirmEmail !== email) {
        setErrorMsg('Email xác nhận không khớp!')
        return
      }
      
      if (phone && confirmPhone !== phone) {
        setErrorMsg('Số điện thoại xác nhận không khớp!')
        return
      }
  
      setIsLoading(true)
      try {
        const res = await fetch('/api/account/delete', { method: 'POST' })
        const data = await res.json()
  
        if (!res.ok) {
          setErrorMsg(data.error || 'Có lỗi xảy ra khi xóa tài khoản')
          setIsLoading(false)
          return
        }
  
        // Success! Instantly navigate away to prevent React errors on the current page
        setIsOpen(false)
        window.location.href = '/account-deleted'
      } catch {
        setErrorMsg('Không thể kết nối tới máy chủ. Vui lòng thử lại.')
        setIsLoading(false)
      }
    }

  return (
    <>
      <Button 
        variant="destructive"
        onClick={() => setIsOpen(true)}
        className="w-full text-sm font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 shadow-none border border-rose-200"
      >
        Xóa tài khoản
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
            <button 
              onClick={() => { setIsOpen(false); setErrorMsg('') }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-bold">Xóa tài khoản vĩnh viễn</h2>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">
              Hành động này không thể hoàn tác. Mọi dữ liệu (bao gồm cả sản phẩm của bạn) sẽ bị xóa khỏi hệ thống. Vui lòng nhập Email {phone && "và Số điện thoại"} để xác nhận.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleDelete} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="confirm_email">Nhập Email: <span className="font-bold">{email}</span></Label>
                <Input 
                  id="confirm_email" 
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder="Nhập chính xác email của bạn" 
                  required 
                />
              </div>
              {phone && (
                <div className="space-y-2">
                  <Label htmlFor="confirm_phone">Nhập Số điện thoại: <span className="font-bold">{phone}</span></Label>
                  <Input 
                    id="confirm_phone" 
                    value={confirmPhone}
                    onChange={(e) => setConfirmPhone(e.target.value)}
                    placeholder="Nhập chính xác SDT của bạn" 
                    required 
                  />
                </div>
              )}
              
              <Button type="submit" variant="destructive" className="w-full mt-4" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Xác nhận XÓA TÀI KHOẢN
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
