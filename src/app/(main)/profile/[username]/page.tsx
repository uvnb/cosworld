import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Heart, MessageSquare, Link2, MapPin, CheckCircle2 } from 'lucide-react'
import { EditProfileDialog } from '@/components/profile/EditProfileDialog'
import { ProfileTabs } from '@/components/profile/ProfileTabs'
import { LikeProfileButton } from '@/components/profile/LikeProfileButton'

export default async function ProfilePage({
  params
}: {
  params: Promise<{ username: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await params

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch profile by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', resolvedParams.username)
    .maybeSingle()

  if (!profile) {
    // Nếu không tìm thấy profile, quay về trang chủ hoặc hiện 404
    redirect('/')
  }

  const isOwner = user?.id === profile.id

  // Fetch Đồ đang cho thuê
  const { data: listings } = await supabase
    .from('listings')
    .select('*, listing_images(r2_url)')
    .eq('owner_id', profile.id)

  // Fetch Lịch sử giao dịch (cả đi thuê và cho thuê)
  const { data: bookings } = await supabase
    .from('bookings')
    .select('*, listings(title, city), renter:renter_id(username, full_name, avatar_url), owner:owner_id(username, full_name, avatar_url)')
    .or(`renter_id.eq.${profile.id},owner_id.eq.${profile.id}`)
    .order('created_at', { ascending: false })

  // Fetch Đánh giá
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, reviewer:reviewer_id(username, avatar_url), bookings(listings(title))')
    .eq('reviewee_id', profile.id)
    .eq('is_published', true)

  // Fetch Lập team & Tuyển staff
  const { data: recruitments } = await supabase
    .from('recruitments')
    .select('*, author:author_id(username, full_name, avatar_url, reputation_score)')
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })

  let hasLiked = false
  if (user) {
    // Sử dụng Admin Client để bypass RLS, tránh trường hợp RLS bị thiết lập sai khiến không đọc được vote cũ
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: vote } = await supabaseAdmin
      .from('reputation_votes')
      .select('vote_value')
      .eq('voter_id', user.id)
      .eq('profile_id', profile.id)
      .maybeSingle()
    if (vote && vote.vote_value > 0) hasLiked = true
  }

  const repScore = profile?.reputation_score !== undefined && profile?.reputation_score !== null 
    ? Math.floor(profile.reputation_score)
    : 0

  return (
    <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
      
      {/* Top Wide Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
        
        {/* Cover Photo */}
        <div className="h-48 sm:h-56 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 relative bg-cover bg-center" style={profile.cover_photo_url ? { backgroundImage: `url(${profile.cover_photo_url})` } : {}}>
          {isOwner && (
            <div className="absolute top-4 right-4">
               <EditProfileDialog profile={profile} email={user?.email || ''} triggerType="cover" />
            </div>
          )}
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
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h1 className="text-2xl font-black text-slate-900">
                      {profile?.full_name || profile?.username || 'Chưa cập nhật'}
                    </h1>
                    {profile?.is_verified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                    
                    {profile?.roles?.map((role: string) => {
                      if (role === 'user') return null; // Don't show basic user role badge
                      
                      const badgeColors: Record<string, string> = {
                        admin: 'bg-rose-50 text-rose-600',
                        coser: 'bg-fuchsia-50 text-fuchsia-600',
                        photographer: 'bg-blue-50 text-blue-600',
                        staff: 'bg-amber-50 text-amber-600'
                      };
                      
                      const defaultColor = 'bg-slate-100 text-slate-600';
                      const colorClass = badgeColors[role.toLowerCase()] || defaultColor;
                      
                      return (
                        <span key={role} className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${colorClass}`}>
                          {role}
                        </span>
                      );
                    })}

                    <LikeProfileButton 
                      profileId={profile.id}
                      userId={user?.id}
                      initialHasLiked={hasLiked}
                      initialScore={repScore}
                    />
                  </div>
                  
                  <p className="text-slate-500 text-sm">
                    Tham gia từ Thg 8, 2026
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isOwner && (
                    <div className="w-fit">
                      <EditProfileDialog profile={profile} email={user?.email || ''} />
                    </div>
                  )}
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
        recruitments={recruitments || []}
        currentUserId={user?.id}
      />

    </main>
  )
}
