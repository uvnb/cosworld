'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateProfile } from '@/app/actions/profile'
import { toast } from 'sonner'
import { Loader2, X } from 'lucide-react'

interface EditProfileDialogProps {
  profile: any
}

export function EditProfileDialog({ profile }: EditProfileDialogProps) {
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
      <Button 
        onClick={() => setIsOpen(true)}
        className="rounded-full bg-slate-900 text-white font-bold px-6 shadow-md hover:bg-slate-800 transition"
      >
        Chỉnh sửa trang cá nhân
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4">Chỉnh sửa hồ sơ</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar">Ảnh đại diện mới (Tùy chọn)</Label>
                <Input id="avatar" name="avatar" type="file" accept="image/*" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Tên hiển thị</Label>
                <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ''} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Biệt danh (Username)</Label>
                <Input id="username" name="username" defaultValue={profile?.username || ''} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Địa chỉ (Thành phố)</Label>
                <Input id="city" name="city" defaultValue={profile?.city || ''} placeholder="VD: Hà Nội, TP.HCM..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Tiểu sử</Label>
                <Textarea id="bio" name="bio" defaultValue={profile?.bio || ''} rows={3} placeholder="Giới thiệu bản thân..." />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Lưu thay đổi
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
