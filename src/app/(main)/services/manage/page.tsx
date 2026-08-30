import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check, X, Clock, Users } from 'lucide-react'
import { ManageApplicationButtons } from '@/components/services/ManageApplicationButtons'

export default async function ManageRecruitmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?message=Vui lòng đăng nhập')
  }

  // Fetch all recruitments posted by this user
  const { data: recruitments } = await supabase
    .from('recruitments')
    .select(`
      *,
      recruitment_applications(
        id, applied_role, message, status, created_at,
        applicant:applicant_id(id, username, full_name, avatar_url, phone)
      )
    `)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      <Link href="/services" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Về trang tuyển dụng
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Quản lý Đội hình & Tuyển dụng</h1>
        <p className="text-slate-500 mt-2">Xét duyệt các ứng viên đã nộp đơn vào project của bạn.</p>
      </div>

      <div className="space-y-8">
        {!recruitments || recruitments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Bạn chưa đăng bài tuyển dụng nào</h3>
            <Link href="/services/create">
              <button className="mt-4 px-6 py-2 bg-brand-600 text-white font-bold rounded-xl">Đăng tin ngay</button>
            </Link>
          </div>
        ) : (
          recruitments.map(rec => (
            <div key={rec.id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <Link href={`/services/${rec.id}`} className="hover:text-brand-600 transition">
                    <h2 className="text-lg font-black text-slate-900">{rec.title}</h2>
                  </Link>
                  <p className="text-sm text-slate-500 mt-1">Trạng thái: <span className="font-bold text-slate-700">{rec.status}</span></p>
                </div>
                <div className="text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200">
                  Tổng đơn: {rec.recruitment_applications?.length || 0}
                </div>
              </div>

              <div className="p-6">
                {!rec.recruitment_applications || rec.recruitment_applications.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-4">Chưa có ứng viên nào ứng tuyển.</p>
                ) : (
                  <div className="space-y-4">
                    {rec.recruitment_applications.map((app: any) => {
                      const applicant = Array.isArray(app.applicant) ? app.applicant[0] : app.applicant;
                      
                      return (
                        <div key={app.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50 items-start sm:items-center">
                          <img 
                            src={applicant?.avatar_url || `https://ui-avatars.com/api/?name=${applicant?.username || 'U'}`} 
                            alt="" 
                            className="w-12 h-12 rounded-full border border-slate-200 object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900">{applicant?.full_name || applicant?.username}</h4>
                              <span className="px-2 py-0.5 bg-brand-100 text-brand-700 text-[10px] font-bold rounded uppercase">
                                {app.applied_role}
                              </span>
                              {app.status === 'PENDING' && <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1"><Clock className="w-3 h-3"/> Đang chờ</span>}
                              {app.status === 'ACCEPTED' && <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"><Check className="w-3 h-3"/> Đã duyệt</span>}
                              {app.status === 'REJECTED' && <span className="text-[10px] font-bold text-rose-500 flex items-center gap-1"><X className="w-3 h-3"/> Từ chối</span>}
                            </div>
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{app.message || '(Không có lời nhắn)'}</p>
                          </div>
                          
                          {app.status === 'PENDING' && (
                            <ManageApplicationButtons applicationId={app.id} />
                          )}
                          
                          {app.status === 'ACCEPTED' && applicant?.phone && (
                            <a href={`https://zalo.me/${applicant.phone}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold rounded-lg transition shrink-0">
                              Zalo Group
                            </a>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
