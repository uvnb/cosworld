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
    .single()

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

  const repScore = profile?.reputation_score !== undefined && profile?.reputation_score !== null 
    ? profile.reputation_score.toFixed(1) 
    : '0'

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-6 w-full flex-1 space-y-6">
      
      {/* Top Wide Profile Card */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        {/* Avatar */}
        <div className="shrink-0 relative z-10">
          <img 
            src={profile?.avatar_url || "https://ui-avatars.com/api/?name=" + (profile?.username || 'User')} 
            alt="Avatar" 
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
          />
        </div>
        
        {/* Info */}
        <div className="flex-1 relative z-10 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2 md:gap-4 mb-2">
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              {profile?.full_name || profile?.username || 'Chưa cập nhật'}
              {profile?.is_verified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
            </h1>
            <span className="text-slate-400 font-medium text-sm">@{profile?.username || 'user'}</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full ml-0 md:ml-4 border border-amber-200">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Uy tín: {repScore} điểm</span>
            </div>
          </div>
          
          <p className="text-slate-600 text-sm max-w-2xl mb-4">
            {profile?.bio || 'Người dùng chưa cập nhật thông tin giới thiệu. Rất vui được giao lưu kết nối!'}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile?.city || 'Chưa cập nhật địa chỉ'}</span>
            </div>
            {profile?.phone && (
              <a href={`https://zalo.me/${profile.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full text-xs font-medium transition">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Nhắn Zalo</span>
              </a>
            )}
            {profile?.facebook_url && (
              <a href={profile.facebook_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full text-xs font-medium transition">
                <Link2 className="w-3.5 h-3.5" />
                <span>Nhắn Messenger</span>
              </a>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 self-center md:self-start mt-4 md:mt-0 flex flex-col items-end">
          <EditProfileDialog profile={profile} />
          <DeleteAccountDialog email={user.email || ''} phone={profile?.phone || null} />
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
