'use client'

import { useState } from 'react'
import { Package, ShoppingBag, Star, Users, MapPin } from 'lucide-react'
import Link from 'next/link'
import { ListingActions } from '@/components/listings/ListingActions'
import { BookingActions } from '@/components/profile/BookingActions'
import { DeleteRecruitmentButton } from '@/components/services/DeleteRecruitmentButton'

interface ProfileTabsProps {
  listings: any[]
  bookings: any[]
  reviews: any[]
  recruitments?: any[]
  currentUserId?: string
}

export function ProfileTabs({ listings, bookings: initialBookings, reviews, recruitments = [], currentUserId }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings' | 'reviews' | 'recruitments'>('listings')
  const [localBookings, setLocalBookings] = useState(initialBookings || [])

  const activeBookings = localBookings.filter((b: any) => b.status !== 'cancelled' && b.status !== 'rejected')
  const avgRating = reviews?.length ? (reviews.reduce((acc: any, r: any) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0.0'

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b border-slate-100 overflow-x-auto hide-scrollbar px-6">
        <button 
          onClick={() => setActiveTab('listings')}
          className={`px-6 py-4 border-b-2 font-bold text-sm flex items-center gap-2 cursor-pointer shrink-0 transition ${activeTab === 'listings' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Package className="w-4 h-4" /> Đồ đang cho thuê ({listings?.length || 0})
        </button>
        <button 
          onClick={() => setActiveTab('recruitments')}
          className={`px-6 py-4 border-b-2 font-bold text-sm flex items-center gap-2 cursor-pointer shrink-0 transition ${activeTab === 'recruitments' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Users className="w-4 h-4" /> Bài đăng tuyển ({recruitments?.length || 0})
        </button>
        <button 
          onClick={() => setActiveTab('bookings')}
          className={`px-6 py-4 border-b-2 font-bold text-sm flex items-center gap-2 cursor-pointer shrink-0 transition ${activeTab === 'bookings' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <ShoppingBag className="w-4 h-4" /> Lịch sử giao dịch ({activeBookings.length})
        </button>
        <button 
          onClick={() => setActiveTab('reviews')}
          className={`px-6 py-4 border-b-2 font-bold text-sm flex items-center gap-2 cursor-pointer shrink-0 transition ${activeTab === 'reviews' ? 'border-brand-600 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Star className="w-4 h-4" /> Đánh giá nhận được ({reviews?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        
        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {listings?.map(item => (
              <div key={item.id} className="group cursor-pointer">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-100 mb-3 border border-slate-100 relative">
                  <img 
                    src={item.listing_images?.[0]?.r2_url || "https://images.unsplash.com/photo-1540575467063-178a50c2df87"} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                    alt={item.title}
                  />
                  {item.status === 'hidden' && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-bold">
                      Đã ẩn
                    </div>
                  )}
                </div>
                <Link href={`/listings/${item.id}`} className="font-bold text-slate-900 line-clamp-1 group-hover:text-brand-600 transition">
                  {item.title}
                </Link>
                <p className="text-sm font-black text-brand-600 mt-1">
                  {['rent', 'both', 'want_to_rent'].includes(item.listing_type)
                    ? `${item.price_per_day?.toLocaleString('vi-VN') || 0}đ`
                    : `${item.sale_price?.toLocaleString('vi-VN') || 0}đ`
                  }
                  {['rent', 'both', 'want_to_rent'].includes(item.listing_type) && <span className="text-slate-400 font-medium text-xs">/ngày</span>}
                </p>
                <ListingActions listingId={item.id} currentStatus={item.status} />
              </div>
            ))}
            {!listings?.length && <p className="text-slate-500 text-sm col-span-full">Bạn chưa đăng sản phẩm nào.</p>}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {activeBookings.length === 0 ? (
              <p className="text-slate-500 text-sm">Bạn chưa có lịch sử giao dịch nào.</p>
            ) : (
              activeBookings.map((booking: any) => {
                const isOwner = booking.owner_id === currentUserId
                const isRenter = booking.renter_id === currentUserId
                const otherParty = isOwner ? booking.renter : booking.owner
                
                return (
                  <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 gap-4">
                    <div className="flex items-center gap-4">
                      <Link href={`/profile/${otherParty?.id || ''}`} className="shrink-0 hover:opacity-80 transition">
                        <img 
                          src={otherParty?.avatar_url || `https://ui-avatars.com/api/?name=${otherParty?.username || 'U'}&background=random`} 
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 bg-white" 
                          alt="" 
                        />
                      </Link>
                      <div>
                        <h4 className="font-bold text-slate-900 line-clamp-1">{booking.listings?.title}</h4>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <span>{isOwner ? 'Người thuê/mua: ' : 'Chủ đồ: '} <span className="font-bold text-slate-700">{otherParty?.full_name || otherParty?.username}</span></span>
                          <span>•</span>
                          <span>Trạng thái: <span className={`font-bold uppercase ${booking.status === 'pending' ? 'text-amber-500' : 'text-brand-600'}`}>{booking.status}</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-bold text-slate-900">{booking.total_amount?.toLocaleString('vi-VN')}đ</p>
                      {booking.start_date !== booking.end_date && (
                        <p className="text-xs text-slate-400 mt-0.5">Từ {booking.start_date} - {booking.end_date}</p>
                      )}
                      
                      <BookingActions 
                        bookingId={booking.id} 
                        listingId={booking.listing_id}
                        revieweeId={isOwner ? booking.renter_id : booking.owner_id}
                        status={booking.status} 
                        isOwner={isOwner} 
                        onStatusChange={(newStatus: string) => {
                          if (newStatus === 'cancelled' || newStatus === 'rejected') {
                            setLocalBookings((prev: any) => prev.filter((b: any) => b.id !== booking.id))
                          } else {
                            setLocalBookings((prev: any) => prev.map((b: any) => b.id === booking.id ? { ...b, status: newStatus } : b))
                          }
                        }}
                      />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {reviews?.length > 0 && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </div>
                <div className="font-bold text-lg text-slate-900">
                  {avgRating}/5
                </div>
                <div className="text-slate-500 text-sm">
                  ({reviews.length} đánh giá)
                </div>
              </div>
            )}
            
            {!reviews?.length ? (
              <p className="text-slate-500 text-sm">Bạn chưa nhận được đánh giá nào.</p>
            ) : (
              reviews.map((review: any) => {
                const reviewer = review.reviewer
                let displayName = reviewer?.full_name || reviewer?.username || 'Người dùng'
                if (/^\d{9,12}$/.test(reviewer?.username || '')) {
                  displayName = reviewer?.full_name || `Người dùng (${reviewer.username.substring(0, 3)}***${reviewer.username.substring(reviewer.username.length - 3)})`
                }

                return (
                <div key={review.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/profile/${reviewer?.id}`} className="flex items-center gap-3 hover:opacity-80 transition">
                      <img src={reviewer?.avatar_url || "https://ui-avatars.com/api/?name=" + (reviewer?.full_name || reviewer?.username)} className="w-8 h-8 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <p className="font-bold text-sm text-slate-900 truncate">{displayName}</p>
                          {review.bookings?.listings?.title && (
                            <span className="text-xs text-slate-500 truncate">
                              đã đánh giá giao dịch: <span className="font-medium text-slate-700">{review.bookings.listings.title}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                      </div>
                    </Link>
                  </div>
                  <p className="text-sm text-slate-600">{review.comment}</p>
                </div>
                )
              })
            )}
          </div>
        )}

        {/* Recruitments Tab */}
        {activeTab === 'recruitments' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {!recruitments?.length ? (
              <p className="text-slate-500 text-sm col-span-full">Người dùng này chưa đăng tin lập team nào.</p>
            ) : (
              recruitments.map((rec: any) => {
                const author = Array.isArray(rec.author) ? rec.author[0] : rec.author
                const repScore = author?.reputation_score !== undefined && author?.reputation_score !== null 
                  ? Math.floor(author.reputation_score) 
                  : 0

                return (
                  <div key={rec.id} className="bg-slate-50 rounded-3xl p-6 border border-slate-100 hover:shadow-md transition flex flex-col relative group">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {rec.roles?.map((r: string) => (
                            <span key={r} className="px-2.5 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-wider rounded-lg border border-rose-100">
                              Tuyển {r}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                          Hạn: {new Date(rec.deadline).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-extrabold text-slate-900 mb-1.5 group-hover:text-brand-600 transition line-clamp-2">
                        {rec.title}
                      </h3>
                      
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {rec.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {rec.budget && (
                          <span className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-emerald-100">
                            💰 {rec.budget}
                          </span>
                        )}
                        <span className="px-2.5 py-1.5 bg-white text-slate-600 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-slate-200">
                          <MapPin className="w-3.5 h-3.5" /> {rec.location}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                      <Link href={`/profile/${author?.id || ''}`} className="flex items-center gap-3 hover:opacity-80 transition">
                        <img src={author?.avatar_url || `https://ui-avatars.com/api/?name=${author?.username || 'User'}`} className="w-9 h-9 rounded-full border border-slate-200 bg-white" alt="avatar" />
                        <div>
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{author?.full_name || author?.username}</p>
                          <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-0.5">
                            ♥ {repScore} uy tín
                          </p>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2">
                        <Link href={`/services/${rec.id}`}>
                          {currentUserId === rec.author_id ? (
                            <button className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-xl text-xs font-bold transition border border-indigo-100">
                              Xem ứng viên
                            </button>
                          ) : (
                            <button className="px-4 py-2 bg-brand-50 text-brand-600 hover:bg-brand-600 hover:text-white rounded-xl text-xs font-bold transition border border-brand-100">
                              Ứng tuyển ngay
                            </button>
                          )}
                        </Link>
                        {currentUserId === rec.author_id && (
                          <DeleteRecruitmentButton recruitmentId={rec.id} />
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

      </div>
    </div>
  )
}
