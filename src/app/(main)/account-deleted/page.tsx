import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function AccountDeletedPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        
        <h1 className="text-2xl font-black text-slate-900 mb-3">
          Tạm biệt bạn!
        </h1>
        
        <p className="text-slate-600 mb-8 leading-relaxed">
          Tài khoản của bạn cùng toàn bộ dữ liệu cá nhân, sản phẩm, và lịch sử giao dịch đã được xóa thành công khỏi hệ thống CosWorld một cách an toàn.
        </p>

        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition shadow-lg shadow-slate-900/20 active:scale-[0.98]"
        >
          Về trang chủ CosWorld <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
