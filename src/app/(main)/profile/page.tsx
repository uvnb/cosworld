import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Star, MessageSquare, Link2, MapPin, CheckCircle2 } from 'lucide-react'
import { EditProfileDialog } from '@/components/profile/EditProfileDialog'
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog'
import { ProfileTabs } from '@/components/profile/ProfileTabs'

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  // Fetch Đồ đang cho thuê
  const { data: listings } = await supabase
    .from('listings')
    .select('*, listing_images(r2_url)')
    .eq('owner_id', user.id)

  // Fetch Lịch sử thuê
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, listings(title, city)')
    .eq('renter_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch Đánh giá
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:reviewer_id(username, avatar_url)')
    .eq('reviewee_id', user.id)
    .eq('is_published', true)

  const reviewCount = reviews ? reviews.length : 0
  const repScore = profile?.reputation_score !== undefined && profile?.reputation_score !== null 
    ? profile.reputation_score.toFixed(1) 
    : '5.0'

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
      
      {/* Top Wide Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        
        {/* Cover Photo */}
        <div className="h-48 sm:h-56 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 relative">
          <button className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm transition flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Đổi ảnh bìa
          </button>
        </div>
        
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row gap-6 relative">
            
            {/* Avatar */}
            <div className="shrink-0 -mt-16 sm:-mt-20 relative z-10">
              <img 
                src={profile?.avatar_url || "https://ui-avatars.com/api/?name=" + (profile?.username || 'User')} 
                alt="Avatar" 
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-md object-cover bg-white"
              />
              <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>

            {/* Main Info */}
            <div className="flex-1 pt-2 sm:pt-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                
                {/* Name & Badge */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-black text-slate-900">
                      {profile?.full_name || profile?.username || 'Chưa cập nhật'}
                    </h1>
                    {profile?.is_verified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-bold rounded">Admin</span>
                    <div className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-200 ml-2">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{repScore} ({reviewCount} đánh giá)</span>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-sm">
                    @{profile?.username || 'user'} • Tham gia từ Thg 8, 2026
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <a href="/listings/new" className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-lg transition">
                    + Đăng đồ cho thuê
                  </a>
                  <div className="w-fit">
                    <EditProfileDialog profile={profile} email={user.email || ''} />
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bio & Socials */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6 pt-6 border-t border-slate-100">
            <div className="max-w-2xl text-slate-600 text-sm leading-relaxed">
              {profile?.bio || 'Chưa có tiểu sử.'}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium border border-slate-100">
                <MapPin className="w-3.5 h-3.5" />
                <span>{profile?.city || 'Chưa cập nhật địa chỉ'}</span>
              </div>
              {profile?.phone && (
                <a href={`https://zalo.me/${profile.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition border border-blue-100/50">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Nhắn Zalo</span>
                </a>
              )}
              {profile?.facebook_url && (
                <a href={profile.facebook_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition border border-indigo-100/50">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Messenger</span>
                </a>
              )}
            </div>
          </div>

        </div>
      </div>

      <ProfileTabs 
        listings={listings || []} 
        bookings={bookings || []} 
        reviews={reviews || []} 
      />

    </main>
  )
}
