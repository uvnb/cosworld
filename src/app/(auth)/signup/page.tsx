import Link from 'next/link'
import { ArrowLeft, Sparkles, ShieldCheck, Zap } from 'lucide-react'
import { SignupForm } from '@/components/auth/SignupForm'

export default async function SignupPage({
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
        <div className="absolute inset-0 bg-gradient-to-br from-brand-600/90 via-indigo-900/90 to-slate-900/95" />
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
              Cộng đồng Cosplay <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-brand-300">
                lớn nhất Việt Nam
              </span>
            </h1>
            
            <div className="space-y-6 mt-12">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Sparkles className="w-5 h-5 text-brand-300" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Thuê đồ dễ dàng</h3>
                  <p className="text-slate-300 text-sm">Hàng ngàn món đồ cosplay đa dạng, giá cả minh bạch và an toàn.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <ShieldCheck className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Giao dịch an toàn</h3>
                  <p className="text-slate-300 text-sm">Hệ thống uy tín, đánh giá minh bạch giúp bạn yên tâm khi giao dịch.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                  <Zap className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-white font-bold mb-1">Kết nối nhanh chóng</h3>
                  <p className="text-slate-300 text-sm">Tìm kiếm team, staff và đối tác studio chỉ trong vài cú click.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-slate-400 text-sm">
            © 2026 CosWorld Platform. Đã đăng ký bản quyền.
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto max-h-screen">
        <div className="w-full max-w-md py-12">
          {/* Mobile Back Button */}
          <Link href="/" className="lg:hidden inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-semibold">Trang chủ</span>
          </Link>

          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Tạo tài khoản mới
            </h2>
            <p className="text-slate-500">
              Điền thông tin bên dưới để bắt đầu hành trình của bạn tại CosWorld.
            </p>
          </div>

          <SignupForm message={resolvedSearchParams?.message} />

          <div className="mt-10 text-center">
            <p className="text-slate-500">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-brand-600 font-bold hover:text-brand-700 transition">
                Đăng nhập tại đây
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
