'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, X, ImagePlus, AlertTriangle } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { DeleteAccountDialog } from './DeleteAccountDialog'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB original limit before compression

interface EditProfileDialogProps {
  profile: any
  email: string
  triggerType?: 'edit' | 'cover'
}

export function EditProfileDialog({ profile, email, triggerType = 'edit' }: EditProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const avatarRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  function handleFilePreview(file: File, setter: (url: string | null) => void) {
    if (file && file.size > 0) {
      const url = URL.createObjectURL(file)
      setter(url)
    }
  }

  async function compressFile(file: File, maxSizeMB: number, maxDim: number): Promise<File> {
    if (file.size <= maxSizeMB * 1024 * 1024 && file.type === 'image/webp') return file // already small enough and right format
    return await imageCompression(file, {
      maxSizeMB,
      maxWidthOrHeight: maxDim,
      useWebWorker: true,
      fileType: 'image/webp',
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      // --- Validate & Compress Avatar ---
      const avatarFile = formData.get('avatar') as File | null
      if (avatarFile && avatarFile.size > 0) {
        if (avatarFile.size > MAX_FILE_SIZE) {
          throw new Error('Ảnh đại diện quá lớn (tối đa 10MB). Vui lòng chọn ảnh nhỏ hơn.')
        }
        setLoadingText('Đang nén ảnh đại diện...')
        const compressed = await compressFile(avatarFile, 0.5, 1024)
        formData.set('avatar', compressed, compressed.name || avatarFile.name)
      }

      // --- Validate & Compress Cover Photo ---
      const coverFile = formData.get('cover_photo') as File | null
      if (coverFile && coverFile.size > 0) {
        if (coverFile.size > MAX_FILE_SIZE) {
          throw new Error('Ảnh bìa quá lớn (tối đa 10MB). Vui lòng chọn ảnh nhỏ hơn.')
        }
        setLoadingText('Đang nén ảnh bìa...')
        const compressed = await compressFile(coverFile, 1, 1920)
        formData.set('cover_photo', compressed, compressed.name || coverFile.name)
      }

      // --- Upload via API Route (not Server Action) ---
      setLoadingText('Đang lưu thay đổi...')
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra khi cập nhật hồ sơ')
      }

      toast.success('Cập nhật hồ sơ thành công!')

      // Hard redirect to avoid React rendering errors
      if (data.username) {
        window.location.href = `/profile/${data.username}`
      } else {
        window.location.reload()
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra')
      setIsLoading(false)
      setLoadingText('')
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
              onClick={() => { if (!isLoading) setIsOpen(false) }}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-black mb-6 text-slate-900">Cài đặt tài khoản</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Uploads with Preview */}
              <div className="grid grid-cols-2 gap-4">
                {/* Avatar Upload */}
                <div className="space-y-2">
                  <Label htmlFor="avatar" className="font-bold text-sm">Ảnh đại diện</Label>
                  <div
                    onClick={() => avatarRef.current?.click()}
                    className="cursor-pointer relative w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-400 transition overflow-hidden bg-slate-50 flex items-center justify-center group"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Current" className="w-full h-full object-cover opacity-50" />
                    ) : (
                      <div className="text-center p-2">
                        <ImagePlus className="w-8 h-8 text-slate-300 mx-auto" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                      <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition">Chọn ảnh</span>
                    </div>
                  </div>
                  <input
                    ref={avatarRef}
                    id="avatar"
                    name="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleFilePreview(f, setAvatarPreview)
                    }}
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Tối đa 10MB · Tự động nén</p>
                </div>

                {/* Cover Photo Upload */}
                <div className="space-y-2">
                  <Label htmlFor="cover_photo" className="font-bold text-sm">Ảnh bìa</Label>
                  <div
                    onClick={() => coverRef.current?.click()}
                    className="cursor-pointer relative w-full aspect-square rounded-2xl border-2 border-dashed border-slate-200 hover:border-brand-400 transition overflow-hidden bg-slate-50 flex items-center justify-center group"
                  >
                    {coverPreview ? (
                      <img src={coverPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : profile?.cover_photo_url ? (
                      <img src={profile.cover_photo_url} alt="Current" className="w-full h-full object-cover opacity-50" />
                    ) : (
                      <div className="text-center p-2">
                        <ImagePlus className="w-8 h-8 text-slate-300 mx-auto" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center">
                      <span className="text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition">Chọn ảnh</span>
                    </div>
                  </div>
                  <input
                    ref={coverRef}
                    id="cover_photo"
                    name="cover_photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleFilePreview(f, setCoverPreview)
                    }}
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Tối đa 10MB · Tự động nén</p>
                </div>
              </div>

              {/* Text Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name" className="font-bold">Tên hiển thị</Label>
                  <Input id="full_name" name="full_name" defaultValue={profile?.full_name || ''} required className="rounded-xl bg-slate-50 border-slate-200" />
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

              {/* Submit Button */}
              <div className="pt-2">
                <Button type="submit" className="w-full h-12 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">{loadingText || 'Đang xử lý...'}</span>
                    </span>
                  ) : 'Lưu thay đổi'}
                </Button>
              </div>
            </form>

            {/* Danger Zone */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-rose-600 mb-2">Vùng nguy hiểm</h3>
              <p className="text-xs text-slate-500 mb-3">Xóa tài khoản vĩnh viễn và không thể khôi phục lại dữ liệu.</p>
              <DeleteAccountDialog email={email} phone={profile?.phone || null} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
