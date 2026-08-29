'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateProfile } from '@/app/actions/profile'
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'
import { DeleteAccountDialog } from './DeleteAccountDialog'

interface EditProfileDialogProps {
  profile: any
  email: string
  triggerType?: 'edit' | 'cover'
}

export function EditProfileDialog({ profile, email, triggerType = 'edit' }: EditProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await updateProfile(formData)
      toast.success('Cập nhật hồ sơ thành công!')
      setIsOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {triggerType === 'edit' ? (
        <Button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition border-none shadow-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Chỉnh sửa
        </Button>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-black/40 hover:bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-md transition flex items-center gap-1.5 border border-white/20 shadow-lg"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Đổi ảnh bìa
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 overflow-y-auto pt-10 pb-10">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg relative shadow-2xl my-auto">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black mb-6 text-slate-900">Cài đặt tài khoản</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="font-bold">Ảnh đại diện</Label>
                  <Input id="avatar" name="avatar" type="file" accept="image/*" className="rounded-xl border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cover_photo" className="font-bold">Ảnh bìa</Label>
                  <Input id="cover_photo" name="cover_photo" type="file" accept="image/*" className="rounded-xl border-slate-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="font-bold">Tên hiển thị</Label>
                  <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ''} required className="rounded-xl bg-slate-50 border-slate-200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="font-bold">Username</Label>
                  <Input id="username" name="username" defaultValue={profile?.username || ''} required className="rounded-xl bg-slate-50 border-slate-200" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="font-bold">Địa chỉ (Thành phố)</Label>
                <Input id="city" name="city" defaultValue={profile?.city || ''} placeholder="VD: Hà Nội, TP.HCM..." className="rounded-xl bg-slate-50 border-slate-200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="font-bold">Tiểu sử</Label>
                <Textarea id="bio" name="bio" defaultValue={profile?.bio || ''} rows={3} placeholder="Giới thiệu bản thân..." className="rounded-xl bg-slate-50 border-slate-200 resize-none" />
              </div>
              <div className="pt-2">
                <Button type="submit" className="w-full h-12 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                  Lưu thay đổi
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-2 text-rose-600">Vùng nguy hiểm</h3>
              <p className="text-xs text-slate-500 mb-3">Xóa tài khoản vĩnh viễn và không thể khôi phục lại dữ liệu.</p>
              <DeleteAccountDialog email={email} phone={profile?.phone || null} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
