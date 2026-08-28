import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ShieldAlert, CheckCircle2, XCircle } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. Kiểm tra Admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Lưu ý: Trong DB có 'admin' role? 
  // (Trong schema init.sql có role default là 'user', cần set 'admin' thủ công qua SQL)
  if (profile?.role !== 'admin') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-900">Không có quyền truy cập</h1>
          <p className="text-slate-500 mt-2">Chỉ dành cho quản trị viên CosWorld.</p>
        </div>
      </div>
    )
  }

  // Lấy các bài post đang chờ duyệt (nếu có state pending)
  // MVP: Lấy tất cả bài viết mới nhất để Admin xem/xóa
  const { data: latestListings } = await supabase
    .from('listings')
    .select('*, owner:owner_id(username)')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-medium text-sm">Tổng Listing mới (24h)</div>
          <div className="text-3xl font-black text-slate-900 mt-2">12</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-medium text-sm">Báo cáo (Reports)</div>
          <div className="text-3xl font-black text-rose-600 mt-2">3</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-medium text-sm">Sự kiện chờ duyệt</div>
          <div className="text-3xl font-black text-brand-600 mt-2">5</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Sản phẩm mới đăng</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {latestListings?.map(listing => (
            <div key={listing.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
              <div>
                <h3 className="font-bold text-slate-900">{listing.title}</h3>
                <p className="text-sm text-slate-500 mt-1">Đăng bởi {Array.isArray(listing.owner) ? listing.owner[0]?.username : listing.owner?.username} • {listing.city}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-xl flex items-center gap-1 hover:bg-emerald-100">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                </button>
                <button className="px-4 py-2 bg-rose-50 text-rose-700 font-semibold text-xs rounded-xl flex items-center gap-1 hover:bg-rose-100">
                  <XCircle className="w-3.5 h-3.5" /> Xóa
                </button>
              </div>
            </div>
          ))}
          {!latestListings?.length && (
            <div className="p-10 text-center text-slate-400">Không có dữ liệu</div>
          )}
        </div>
      </div>
    </div>
  )
}
