import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Star, Package, ShoppingBag, MessageSquare, Link2, Phone, MapPin, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { ListingActions } from '@/components/listings/ListingActions'

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

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      
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
              <span>Uy tín: {profile?.reputation_score?.toFixed(1) || '100'} điểm</span>
            </div>
          </div>
          
          <p className="text-slate-600 text-sm max-w-2xl mb-4">
            Người dùng chưa cập nhật thông tin giới thiệu. Rất vui được giao lưu kết nối!
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>Hà Nội</span>
            </div>
            {profile?.zalo_link && (
              <a href={profile.zalo_link} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full text-xs font-medium transition">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Nhắn Zalo</span>
              </a>
            )}
            {profile?.facebook_url && (
              <a href={profile.facebook_url} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full text-xs font-medium transition">
                <Link2 className="w-3.5 h-3.5" />
                <span>Nhắn Messenger</span>
              </a>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="relative z-10 self-center md:self-start mt-4 md:mt-0">
          <Button className="rounded-full bg-slate-900 text-white font-bold px-6 shadow-md hover:bg-slate-800 transition">
            Chỉnh sửa trang cá nhân
          </Button>
          <form action="/auth/signout" method="post" className="mt-2 text-right">
            <button type="submit" className="text-xs text-rose-500 hover:underline font-medium">Đăng xuất</button>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        {/* Fake Tabs Header */}
        <div className="flex border-b border-slate-100 overflow-x-auto hide-scrollbar px-6">
          <div className="px-6 py-4 border-b-2 border-brand-600 text-brand-600 font-bold text-sm flex items-center gap-2 cursor-pointer shrink-0">
            <Package className="w-4 h-4" /> Đồ đang cho thuê ({listings?.length || 0})
          </div>
          <div className="px-6 py-4 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium text-sm flex items-center gap-2 cursor-pointer shrink-0">
            <ShoppingBag className="w-4 h-4" /> Lịch sử thuê
          </div>
          <div className="px-6 py-4 border-b-2 border-transparent text-slate-500 hover:text-slate-800 font-medium text-sm flex items-center gap-2 cursor-pointer shrink-0">
            <Star className="w-4 h-4" /> Đánh giá nhận được
          </div>
        </div>

        {/* Tab Content: Đồ đang cho thuê */}
        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {listings?.map(item => (
              <div key={item.id} className="group cursor-pointer">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-100">
                  <img 
                    src={item.listing_images?.[0]?.r2_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                  />
                </div>
                <Link href={`/listings/${item.id}`} className="font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition">
                  {item.title}
                </Link>
                <p className="text-sm font-black text-brand-600 mt-1">{item.price_per_day?.toLocaleString('vi-VN')}đ<span className="text-slate-400 font-medium text-xs">/ngày</span></p>
                <ListingActions listingId={item.id} currentStatus={item.status} />
              </div>
            ))}
            {!listings?.length && <p className="text-slate-500 text-sm col-span-full">Bạn chưa đăng sản phẩm nào.</p>}
          </div>
        </div>

      </div>
    </div>
  )
}
