'use client'

import { useState } from 'react'
import { Package, ShoppingBag, Star } from 'lucide-react'
import Link from 'next/link'
import { ListingActions } from '@/components/listings/ListingActions'
import { BookingActions } from '@/components/profile/BookingActions'

interface ProfileTabsProps {
  listings: any[]
  bookings: any[]
  reviews: any[]
  currentUserId?: string
}

export function ProfileTabs({ listings, bookings: initialBookings, reviews, currentUserId }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings' | 'reviews'>('listings')
  const [localBookings, setLocalBookings] = useState(initialBookings || [])

  const activeBookings = localBookings.filter((b: any) => b.status !== 'cancelled')
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
                      <Link href={`/profile/${otherParty?.username || ''}`} className="shrink-0 hover:opacity-80 transition">
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
                        revieweeId={booking.owner_id}
                        status={booking.status} 
                        isOwner={isOwner} 
                        onStatusChange={(newStatus: string) => {
                          if (newStatus === 'cancelled') {
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
              reviews.map((review: any) => (
                <div key={review.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Link href={`/profile/${review.reviewer?.username}`} className="flex items-center gap-3 hover:opacity-80 transition">
                      <img src={review.reviewer?.avatar_url || "https://ui-avatars.com/api/?name=" + review.reviewer?.username} className="w-8 h-8 rounded-full" />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <p className="font-bold text-sm text-slate-900 truncate">{review.reviewer?.username}</p>
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
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}
