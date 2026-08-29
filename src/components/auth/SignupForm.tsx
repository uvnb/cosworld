'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { signup } from '@/app/(auth)/actions'

export function SignupForm({ message }: { message?: string }) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <form 
      className="space-y-5" 
      action={(formData) => {
        setIsLoading(true)
        signup(formData)
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="username" className="text-slate-700 font-bold">Tên người dùng (Username) <span className="text-rose-500">*</span></Label>
        <Input
          id="username"
          name="username"
          type="text"
          placeholder="Ví dụ: cosplayer123 (viết liền, không dấu)"
          pattern="^\S+$"
          title="Username không được chứa dấu cách"
          required
          className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-brand-500 focus:border-brand-500 transition-all rounded-xl"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-700 font-bold">Email <span className="text-rose-500">*</span></Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Ví dụ: ban@gmail.com (Dùng để đăng nhập)"
          required
          className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-brand-500 focus:border-brand-500 transition-all rounded-xl"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-slate-700 font-bold">Số điện thoại <span className="text-slate-400 font-normal ml-1">Tùy chọn</span></Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="0987654321"
            className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="facebook_url" className="text-slate-700 font-bold">Link Facebook <span className="text-slate-400 font-normal ml-1">Tùy chọn</span></Label>
          <Input
            id="facebook_url"
            name="facebook_url"
            type="url"
            placeholder="https://facebook.com/..."
            className="h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <Label htmlFor="password" className="text-slate-700 font-bold">Mật khẩu <span className="text-rose-500">*</span></Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Tối thiểu 6 ký tự"
            minLength={6}
            required
            className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-brand-500 focus:border-brand-500 transition-all rounded-xl pr-12"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      <div className="pt-2 flex items-start gap-3">
        <input 
          type="checkbox" 
          id="terms" 
          name="terms" 
          required 
          className="mt-1 w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
        />
        <Label htmlFor="terms" className="text-sm text-slate-600 leading-tight">
          Bằng việc đăng ký, bạn đồng ý với <a href="#" className="font-bold text-brand-600 hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="font-bold text-brand-600 hover:underline">Chính sách bảo mật</a> của CosWorld
        </Label>
      </div>

      <Button 
        className="w-full h-12 mt-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-base rounded-xl shadow-lg shadow-brand-600/25 transition-all active:scale-[0.98]" 
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        Đăng ký tài khoản
      </Button>

      {message && (
        <div className="mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-medium rounded-xl flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-rose-600 font-bold text-xs">!</span>
          </div>
          <p>{message}</p>
        </div>
      )}
    </form>
  )
}
