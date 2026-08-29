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

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8 w-full flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - Profile Summary (1/3 Width) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden relative">
            
            {/* Cover Photo */}
            <div className="h-32 bg-gradient-to-br from-indigo-500 via-brand-500 to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
            </div>
            
            <div className="px-6 pb-8 pt-0 relative flex flex-col items-center text-center">
              {/* Avatar */}
              <div className="shrink-0 relative z-10 -mt-12 mb-4">
                <img 
                  src={profile?.avatar_url || "https://ui-avatars.com/api/?name=" + (profile?.username || 'User')} 
                  alt="Avatar" 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white"
                />
              </div>

              {/* Name & Badge */}
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-1.5 justify-center mb-1">
                {profile?.full_name || profile?.username || 'Chưa cập nhật'}
                {profile?.is_verified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
              </h1>
              <p className="text-slate-400 font-medium text-sm mb-4">@{profile?.username || 'user'}</p>
              
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200 mb-6">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>{reviewCount} đánh giá</span>
              </div>

              {/* Bio */}
              <div className="w-full text-left mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Giới thiệu</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {profile?.bio || 'Người dùng chưa cập nhật thông tin giới thiệu. Rất vui được giao lưu kết nối!'}
                </p>
              </div>

              {/* Links & Contacts */}
              <div className="w-full space-y-2.5">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-700">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{profile?.city || 'Chưa cập nhật địa chỉ'}</span>
                </div>
                {profile?.phone && (
                  <a href={`https://zalo.me/${profile.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm font-bold text-blue-700 transition">
                    <MessageSquare className="w-4 h-4" />
                    <span>Zalo: {profile.phone}</span>
                  </a>
                )}
                {profile?.facebook_url && (
                  <a href={profile.facebook_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-sm font-bold text-indigo-700 transition">
                    <Link2 className="w-4 h-4" />
                    <span className="truncate">Facebook Cá nhân</span>
                  </a>
                )}
              </div>

              <EditProfileDialog profile={profile} email={user.email || ''} />
            </div>
          </div>
        </div>

        {/* Right Column - Tabs & Content (2/3 Width) */}
        <div className="lg:col-span-8">
          <ProfileTabs 
            listings={listings || []} 
            bookings={bookings || []} 
            reviews={reviews || []} 
          />
        </div>

      </div>
    </main>
  )
}
