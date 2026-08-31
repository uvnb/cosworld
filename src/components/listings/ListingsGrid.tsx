'use client'

import { useListings, ListingFilters } from '@/lib/hooks/useListings'
import { Button } from '@/components/ui/button'
import { Loader2, Heart, MapPin } from 'lucide-react'
import Link from 'next/link'

// Thêm thư viện dayjs hoặc date-fns nếu muốn format "2 giờ trước", ở đây dùng hàm đơn giản
function timeAgo(dateString: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Vừa xong'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`
  return `${Math.floor(diffInSeconds / 86400)} ngày trước`
}

import { useState, useEffect } from 'react'
export function ListingsGrid({ filters }: { filters?: ListingFilters }) {
  const [coords, setCoords] = useState<{ lat: number, lng: number } | null>(null)

  useEffect(() => {
    // Only attempt to get location if not filtering by city
    if (!filters?.city && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.warn('Geolocation error:', error)
        }
      )
    }
  }, [filters?.city])

  const effectiveFilters = { ...filters, ...coords }

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useListings(effectiveFilters)

  if (status === 'pending') return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
  if (status === 'error') return <div className="py-20 text-center text-rose-500">Đã có lỗi xảy ra: {(error as Error).message}</div>

  const listings = data?.pages.flat() || []

  if (listings.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-slate-400 text-sm font-semibold">
        Không tìm thấy sản phẩm nào phù hợp.
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {listings.map((listing: any) => {
          const isRent = listing.listing_type === 'rent' || listing.listing_type === 'both'
          const displayPrice = isRent ? listing.price_per_day : listing.sale_price
          
              return (
            <Link href={`/listings/${listing.id}`} key={listing.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group">
              <div className="relative aspect-square bg-slate-100 overflow-hidden">
                {listing.cover_image ? (
                  <img
                    src={listing.cover_image}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">No Image</div>
                )}
                
                {(() => {
                  let tagText = 'Thuê'
                  let tagClass = 'bg-brand-600'
                  if (listing.listing_type === 'sale') {
                    tagText = 'Pass lại'
                    tagClass = 'bg-indigo-600'
                  } else if (listing.listing_type === 'both') {
                    tagText = 'Thuê & Pass'
                    tagClass = 'bg-violet-600'
                  } else if (listing.listing_type === 'want_to_rent') {
                    tagText = 'Cần thuê'
                    tagClass = 'bg-amber-600'
                  } else if (listing.listing_type === 'want_to_buy') {
                    tagText = 'Cần mua'
                    tagClass = 'bg-rose-600'
                  }

                  return (
                    <span className={`absolute top-2 left-2 ${tagClass} text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm`}>
                      {tagText}
                    </span>
                  )
                })()}
                
                {listing.size && (
                  <span className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                    {listing.size}
                  </span>
                )}
                
                <button 
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white text-slate-600 transition"
                  onClick={(e) => {
                    e.preventDefault()
                    // toggleLike logic here
                  }}
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-brand-600 transition">
                    {listing.title}
                  </h3>
                  <div className="text-[13px] font-black text-brand-600 mt-1.5">
                    {displayPrice ? displayPrice.toLocaleString('vi-VN') : 0}đ
                    {isRent && <span className="text-[10px] font-normal text-slate-500">/ngày</span>}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-100">
                  {listing.distance_meters !== undefined ? (
                    <span className="flex items-center gap-0.5 text-brand-600 font-medium">
                      <MapPin className="w-2.5 h-2.5" /> Cách ~{Math.ceil(listing.distance_meters / 500) * 0.5}km
                    </span>
                  ) : (
                    <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" /> {listing.city}</span>
                  )}
                  <span>{timeAgo(listing.created_at)}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {hasNextPage && (
        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full max-w-sm rounded-full text-xs font-bold text-slate-600 border-slate-200"
          >
            {isFetchingNextPage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
          </Button>
        </div>
      )}
    </div>
  )
}
