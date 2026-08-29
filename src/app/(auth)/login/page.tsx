import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>
}) {
  const resolvedSearchParams = await searchParams
  
  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Column - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative flex-col justify-between overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 via-slate-900/95 to-slate-950/95" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />
        
        {/* Content */}
        <div className="relative z-10 p-12 flex flex-col h-full justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-white hover:opacity-80 transition">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Quay lại trang chủ</span>
            </Link>
          </div>
          
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2 shadow-2xl">
                <img src="/logo-web.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight">CosWorld</h2>
            </div>
            
            <h1 className="text-4xl font-black text-white leading-tight mb-6">
              Chào mừng <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-indigo-300">
                bạn trở lại!
              </span>
            </h1>
            
            <p className="text-slate-300 text-lg mb-12">
              Đăng nhập để tiếp tục thuê đồ, quản lý sản phẩm và kết nối với hàng ngàn cosplayer khác trên toàn quốc.
            </p>
            
            <div className="flex items-center gap-4">
               <div className="flex -space-x-4">
                  <img className="w-12 h-12 rounded-full border-2 border-slate-900" src="https://ui-avatars.com/api/?name=C&background=random" alt="" />
                  <img className="w-12 h-12 rounded-full border-2 border-slate-900" src="https://ui-avatars.com/api/?name=O&background=random" alt="" />
                  <img className="w-12 h-12 rounded-full border-2 border-slate-900" src="https://ui-avatars.com/api/?name=S&background=random" alt="" />
                  <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-brand-600 flex items-center justify-center text-white font-bold text-xs">
                    +5K
                  </div>
               </div>
               <p className="text-slate-300 text-sm font-medium">Tham gia cùng <br/><span className="text-white font-bold">5,000+ thành viên</span></p>
            </div>
          </div>
          
          <div className="text-slate-400 text-sm">
            © 2026 CosWorld Platform. Đã đăng ký bản quyền.
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md">
          {/* Mobile Back Button */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Trang chủ</span>
          </Link>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Đăng nhập
            </h2>
            <p className="text-slate-500">
              Nhập email và mật khẩu của bạn để truy cập tài khoản.
            </p>
          </div>

          <LoginForm message={resolvedSearchParams?.message} />

          <div className="mt-10 text-center">
            <p className="text-slate-500">
              Chưa có tài khoản?{' '}
              <Link href="/signup" className="text-brand-600 font-bold hover:text-brand-700 transition">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
