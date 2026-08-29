'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { login } from '@/app/(auth)/actions'

export function LoginForm({ message }: { message?: string }) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <form 
      className="space-y-5" 
      action={(formData) => {
        setIsLoading(true)
        login(formData)
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="email" className="text-slate-700 font-bold">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="m@example.com"
          required
          className="h-12 bg-slate-50 border-slate-200 focus:bg-white focus:ring-brand-500 focus:border-brand-500 transition-all rounded-xl"
        />
      </div>
      
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-slate-700 font-bold">Mật khẩu</Label>
          <Link href="#" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition">
            Quên mật khẩu?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
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

      <Button 
        className="w-full h-12 mt-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base rounded-xl shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98]" 
        type="submit"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        Đăng nhập
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
