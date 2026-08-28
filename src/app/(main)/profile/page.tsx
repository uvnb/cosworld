import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Star, Package, ShoppingBag, MessageSquare, Facebook, Phone, MapPin, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

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
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-brand-600 to-indigo-600 z-0"></div>
            <div className="relative z-10 pt-16">
              <img 
                src={profile?.avatar_url || "https://ui-avatars.com/api/?name=" + (profile?.username || 'User')} 
                alt="Avatar" 
                className="w-32 h-32 rounded-full border-4 border-white shadow-md mx-auto object-cover bg-white"
              />
              <h1 className="text-2xl font-black text-slate-900 mt-4 flex justify-center items-center gap-2">
                {profile?.username || 'Chưa cập nhật'}
                {profile?.is_verified && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
              </h1>
              <p className="text-slate-500 font-medium">{profile?.full_name}</p>
              
              <div className="flex justify-center items-center gap-2 mt-3 mb-6 bg-slate-50 w-max mx-auto px-4 py-2 rounded-2xl">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-xl font-bold text-slate-900">{profile?.reputation_score?.toFixed(1) || '5.0'}</span>
                <span className="text-slate-400 text-sm">/ 5.0</span>
              </div>

              <div className="space-y-3 text-left text-sm text-slate-600 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="truncate">{user.email}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="font-medium text-slate-700">{profile.phone}</span>
                  </div>
                )}
                {profile?.zalo_link && (
                  <a href={profile.zalo_link} target="_blank" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-blue-600 group-hover:underline">Nhắn tin Zalo</span>
                  </a>
                )}
                {profile?.facebook_url && (
                  <a href={profile.facebook_url} target="_blank" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition">
                      <Facebook className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="font-medium text-indigo-600 group-hover:underline">Facebook Profile</span>
                  </a>
                )}
              </div>

              <div className="mt-8 space-y-3">
                <Button className="w-full rounded-xl font-bold">Chỉnh sửa hồ sơ</Button>
                <form action="/auth/signout" method="post">
                  <Button variant="outline" type="submit" className="w-full rounded-xl font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-100">
                    Đăng xuất
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Đồ đang cho thuê */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-600" /> Đồ của tôi ({listings?.length || 0})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {listings?.map(item => (
                <div key={item.id} className="flex gap-4 p-3 rounded-2xl border border-slate-100 hover:border-brand-200 hover:shadow-sm transition group">
                  <img src={item.listing_images?.[0]?.r2_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"} className="w-20 h-20 rounded-xl object-cover" />
                  <div>
                    <Link href={`/listings/${item.id}`} className="font-bold text-slate-800 line-clamp-2 group-hover:text-brand-600 transition">{item.title}</Link>
                    <p className="text-sm text-brand-600 font-bold mt-1">{item.price_per_day?.toLocaleString('vi-VN')}đ/ngày</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase">{item.status}</span>
                  </div>
                </div>
              ))}
              {!listings?.length && <p className="text-slate-500 text-sm col-span-full">Bạn chưa đăng sản phẩm nào.</p>}
            </div>
          </section>

          {/* Lịch sử thuê */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-600" /> Lịch sử đi thuê ({bookings?.length || 0})
            </h2>
            <div className="space-y-4">
              {bookings?.map(b => (
                <div key={b.id} className="flex justify-between items-center p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-slate-800">{Array.isArray(b.listings) ? b.listings[0]?.title : b.listings?.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">Thuê từ {new Date(b.start_date).toLocaleDateString('vi-VN')} đến {new Date(b.end_date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                      {b.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              {!bookings?.length && <p className="text-slate-500 text-sm">Chưa có lịch sử giao dịch.</p>}
            </div>
          </section>

          {/* Đánh giá nhận được */}
          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" /> Đánh giá nhận được ({reviews?.length || 0})
            </h2>
            <div className="space-y-6">
              {reviews?.map(rv => (
                <div key={rv.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <img src={(Array.isArray(rv.reviewer) ? rv.reviewer[0]?.avatar_url : rv.reviewer?.avatar_url) || "https://ui-avatars.com/api/?name=User"} className="w-10 h-10 rounded-full bg-slate-100" />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{Array.isArray(rv.reviewer) ? rv.reviewer[0]?.username : rv.reviewer?.username}</p>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {Array.from({ length: rv.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(rv.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <p className="text-slate-600 text-sm mt-2">{rv.comment}</p>
                </div>
              ))}
              {!reviews?.length && <p className="text-slate-500 text-sm">Chưa có đánh giá nào.</p>}
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
