import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Calendar, DollarSign, Heart, ShieldCheck, MessageCircle } from 'lucide-react'
import { ApplyRecruitmentForm } from '@/components/services/ApplyRecruitmentForm'
import { DeleteRecruitmentButton } from '@/components/services/DeleteRecruitmentButton'

export default async function RecruitmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  const { data: recruitment, error } = await supabase
    .from('recruitments')
    .select(`
      *,
      author:author_id(username, full_name, avatar_url, phone, reputation_score)
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (error || !recruitment) {
    notFound()
  }

  // Count accepted members
  const { count: membersCount } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('recruitment_id', recruitment.id)

  // Check if current user has applied
  let hasApplied = false
  if (user) {
    const { count } = await supabase
      .from('recruitment_applications')
      .select('*', { count: 'exact', head: true })
      .eq('recruitment_id', recruitment.id)
      .eq('applicant_id', user.id)
    
    hasApplied = (count ?? 0) > 0
  }

  const isOwner = user?.id === recruitment.author_id
  const author = Array.isArray(recruitment.author) ? recruitment.author[0] : recruitment.author
  const repScore = author?.reputation_score !== undefined && author?.reputation_score !== null 
    ? Math.floor(author.reputation_score) 
    : 0

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
      <Link href="/services" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Về trang tuyển dụng
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Main Content */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-10">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {recruitment.roles?.map((r: string) => (
                <span key={r} className="px-3 py-1 bg-brand-50 text-brand-600 text-xs font-black uppercase rounded-full tracking-wider">
                  Tuyển {r}
                </span>
              ))}
              <span className={`px-3 py-1 text-xs font-black uppercase rounded-full tracking-wider ${
                recruitment.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {recruitment.status === 'OPEN' ? 'ĐANG TUYỂN' : (recruitment.status === 'CLOSED' ? 'ĐÃ ĐÓNG' : 'ĐÃ FULL')}
              </span>
            </div>

            <div className="flex items-start justify-between gap-4 mb-6">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                {recruitment.title}
              </h1>
              {isOwner && (
                <div className="bg-rose-50 rounded-xl">
                  <DeleteRecruitmentButton recruitmentId={recruitment.id} redirectTo="/services/manage" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <MapPin className="w-5 h-5 text-brand-600" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Khu vực</p>
                  <p className="text-sm font-bold text-slate-900">{recruitment.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Calendar className="w-5 h-5 text-brand-600" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Hạn chót</p>
                  <p className="text-sm font-bold text-slate-900">{new Date(recruitment.deadline).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              {recruitment.budget && (
                <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase">Thù lao / Ngân sách</p>
                    <p className="text-sm font-bold text-emerald-700">{recruitment.budget}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="prose prose-slate max-w-none">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Chi tiết yêu cầu</h3>
              <div className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                {recruitment.description}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Author & Apply Actions */}
        <div className="lg:col-span-4 space-y-6 sticky top-24">
          
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h3 className="font-bold text-slate-900 mb-4">Người đăng tuyển</h3>
              <Link href={`/profile/${author?.username || ''}`} className="flex items-center gap-4 mb-6 hover:opacity-80 transition cursor-pointer">
                <img 
                  src={author?.avatar_url || `https://ui-avatars.com/api/?name=${author?.username || 'User'}`} 
                  className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 object-cover" 
                  alt="" 
                />
                <div>
                  <p className="font-bold text-slate-900">{author?.full_name || author?.username}</p>
                  <div className="text-xs text-rose-500 font-bold mt-1 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 fill-current" /> {repScore} uy tín
                  </div>
                </div>
              </Link>

              {/* Action Area */}
              {isOwner ? (
                <div className="space-y-3">
                  <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl text-sm font-medium mb-4 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <p>Đây là bài đăng của bạn. Đã có <strong>{membersCount || 0}</strong> thành viên được duyệt vào team.</p>
                  </div>
                  <Link href="/services/manage" className="block w-full">
                    <button className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition">
                      Quản lý Ứng viên
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {hasApplied ? (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm font-medium text-center border border-emerald-100">
                      ✅ Bạn đã gửi yêu cầu ứng tuyển! Hãy chờ trưởng team liên hệ.
                    </div>
                  ) : recruitment.status !== 'OPEN' ? (
                    <div className="bg-slate-100 text-slate-500 p-4 rounded-xl text-sm font-bold text-center">
                      Bài đăng đã đóng hoặc đủ người.
                    </div>
                  ) : (
                    <ApplyRecruitmentForm recruitmentId={recruitment.id} roles={recruitment.roles} />
                  )}
                  
                  {author?.phone && (
                    <a href={`https://zalo.me/${author.phone}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl font-bold transition">
                      <MessageCircle className="w-5 h-5" /> Nhắn Zalo
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </main>
  )
}
