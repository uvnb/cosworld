import Link from 'next/link'
import { Sparkles, Search, MessageSquare, Bell, User, LogOut, Home, ShoppingBag, Users, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'

export async function TopBar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', user.id)
      .maybeSingle()
      
    if (!error && data) {
      profile = data
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between gap-6">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="h-10 w-10 flex items-center justify-center">
            <img src="/logo-web.png" alt="CosWorld Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
              Cos<span className="text-brand-600">World</span>
            </span>
            <span className="text-[10px] block text-slate-400 font-semibold uppercase tracking-wider -mt-1">
              Thuê đồ • Tuyển staff • Sự kiện
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form action="/" method="GET" className="hidden md:flex flex-1 max-w-2xl items-center relative">
          <input 
            name="q"
            type="text" 
            placeholder="Tìm kiếm cosplay, nhân vật, đạo cụ, vũ khí, studio..."
            className="w-full pl-5 pr-12 py-2.5 text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-brand-500 rounded-full outline-none transition"
          />
          <button type="submit" className="absolute right-4 text-slate-400 hover:text-brand-600 transition">
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Right Header: Auth Actions */}
        <div className="flex items-center gap-3">
          <button className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Tin nhắn</span>
          </button>

          <button className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full relative transition">
            <Bell className="w-5 h-5" />
          </button>

          {!user ? (
            <div className="pl-2 border-l border-slate-200">
              <Link href="/login" className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-brand-600/20 transition flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>Đăng nhập / Đăng ký</span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <Link href="/profile" className="flex items-center gap-2.5 cursor-pointer p-1.5 rounded-xl hover:bg-slate-100/80 transition" title="Xem trang cá nhân">
                <img 
                  src={profile?.avatar_url || "https://ui-avatars.com/api/?name=" + (profile?.full_name || 'User')} 
                  alt="User Avatar" 
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-brand-200" 
                />
                <span className="hidden lg:block text-left">
                  <span className="text-xs font-bold text-slate-800 block leading-tight">{profile?.full_name || user.email?.split('@')[0] || 'Khách'}</span>
                  <span className="text-[10px] text-brand-600 font-semibold">Xem profile</span>
                </span>
              </Link>
              <Link href="/calendar">
                <Button variant="ghost" className="rounded-xl text-xs font-bold text-slate-600">
                  Lịch cá nhân
                </Button>
              </Link>
              
              <form action="/auth/signout" method="post">
                <button type="submit" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition" title="Đăng xuất">
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Hub Tabs */}
      <div className="border-t border-slate-100 bg-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center gap-2 sm:gap-8 overflow-x-auto hide-scrollbar text-xs font-bold">
          <Link href="/" className="py-3.5 px-2 border-b-2 border-brand-600 text-brand-600 flex items-center gap-2 shrink-0 transition">
            <Home className="w-4 h-4" /> Trang chủ
          </Link>
          <Link href="/listings" className="py-3.5 px-2 border-b-2 border-transparent text-slate-600 hover:text-brand-600 flex items-center gap-2 shrink-0 transition">
            <ShoppingBag className="w-4 h-4" /> Thuê & Mua bán
          </Link>
          <Link href="/services" className="py-3.5 px-2 border-b-2 border-transparent text-slate-600 hover:text-brand-600 flex items-center gap-2 shrink-0 transition">
            <Users className="w-4 h-4" /> Lập team / Tuyển staff
          </Link>
          <Link href="/events" className="py-3.5 px-2 border-b-2 border-transparent text-slate-600 hover:text-brand-600 flex items-center gap-2 shrink-0 transition">
            <Calendar className="w-4 h-4" /> Sự kiện & Festival
          </Link>
        </div>
      </div>
    </header>
  )
}
