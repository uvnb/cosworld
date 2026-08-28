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
    .limit(5)

  // Lấy danh sách Reports
  const { data: reports } = await supabase
    .from('reports')
    .select('*, reporter:reporter_id(username), reported:reported_user_id(username)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  // Lấy danh sách Events cần duyệt
  const { data: pendingEvents } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-3xl font-black text-slate-900 mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-medium text-sm">Sản phẩm mới (24h)</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{latestListings?.length || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-medium text-sm">Báo cáo (Reports)</div>
          <div className="text-3xl font-black text-rose-600 mt-2">{reports?.length || 0}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-slate-500 font-medium text-sm">Sự kiện chờ duyệt</div>
          <div className="text-3xl font-black text-brand-600 mt-2">{pendingEvents?.length || 0}</div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Reports Section */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 bg-rose-50 flex items-center justify-between">
            <h2 className="font-bold text-rose-900">Báo cáo vi phạm (Cần xử lý)</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {reports?.map(report => (
              <div key={report.id} className="p-6 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    {Array.isArray(report.reporter) ? report.reporter[0]?.username : report.reporter?.username} tố cáo {Array.isArray(report.reported) ? report.reported[0]?.username : report.reported?.username}
                  </h3>
                  <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">{report.reason}</span>
                </div>
                <p className="text-sm text-slate-600 mb-4">{report.description}</p>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-rose-600 text-white font-semibold text-xs rounded-xl hover:bg-rose-700 transition">
                    Ban tài khoản / Trừ Uy Tín
                  </button>
                  <button className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-200 transition">
                    Đóng (Bỏ qua)
                  </button>
                </div>
              </div>
            ))}
            {!reports?.length && (
              <div className="p-10 text-center text-slate-400">Không có báo cáo nào cần xử lý.</div>
            )}
          </div>
        </div>

        {/* Events Approval Section */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 bg-brand-50 flex items-center justify-between">
            <h2 className="font-bold text-brand-900">Sự kiện chờ duyệt</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingEvents?.map(evt => (
              <div key={evt.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition">
                <div>
                  <h3 className="font-bold text-slate-900">{evt.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{evt.city} • {new Date(evt.start_date).toLocaleDateString('vi-VN')}</p>
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
            {!pendingEvents?.length && (
              <div className="p-10 text-center text-slate-400">Không có sự kiện nào đang chờ.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
