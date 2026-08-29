'use client'

import { useState } from 'react'
import { Package, ShoppingBag, Star } from 'lucide-react'
import Link from 'next/link'
import { ListingActions } from '@/components/listings/ListingActions'

interface ProfileTabsProps {
  listings: any[]
  bookings: any[]
  reviews: any[]
}

export function ProfileTabs({ listings, bookings, reviews }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<'listings' | 'bookings' | 'reviews'>('listings')

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
          <ShoppingBag className="w-4 h-4" /> Lịch sử thuê ({bookings?.length || 0})
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
                <p className="text-sm font-black text-brand-600 mt-1">{item.price_per_day?.toLocaleString('vi-VN')}đ<span className="text-slate-400 font-medium text-xs">/ngày</span></p>
                <ListingActions listingId={item.id} currentStatus={item.status} />
              </div>
            ))}
            {!listings?.length && <p className="text-slate-500 text-sm col-span-full">Bạn chưa đăng sản phẩm nào.</p>}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {!bookings?.length ? (
              <p className="text-slate-500 text-sm">Bạn chưa có lịch sử thuê đồ nào.</p>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">{booking.listings?.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">Trạng thái: <span className="font-bold text-brand-600 uppercase">{booking.status}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{booking.total_price?.toLocaleString('vi-VN')}đ</p>
                    <p className="text-xs text-slate-400">Từ {booking.start_date.split('T')[0]} - {booking.end_date.split('T')[0]}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {!reviews?.length ? (
              <p className="text-slate-500 text-sm">Bạn chưa nhận được đánh giá nào.</p>
            ) : (
              reviews.map(review => (
                <div key={review.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <img src={review.reviewer?.avatar_url || "https://ui-avatars.com/api/?name=" + review.reviewer?.username} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="font-bold text-sm text-slate-900">{review.reviewer?.username}</p>
                      <div className="flex gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                    </div>
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
