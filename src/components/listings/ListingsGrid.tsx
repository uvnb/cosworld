'use client'

import { useListings } from '@/lib/hooks/useListings'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function ListingsGrid({ query }: { query?: string }) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useListings({ query })

  if (status === 'pending') return <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div>
  if (status === 'error') return <div className="py-20 text-center text-red-500">Đã có lỗi xảy ra: {(error as Error).message}</div>

  const listings = data?.pages.flat() || []

  if (listings.length === 0) {
    return (
      <div className="py-20 text-center text-zinc-500">
        Không tìm thấy sản phẩm nào phù hợp.
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((listing: any) => (
          <Link href={`/listings/${listing.id}`} key={listing.id} className="group flex flex-col space-y-3 cursor-pointer">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
              {listing.cover_image ? (
                <img
                  src={listing.cover_image}
                  alt={listing.title}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-300">No Image</div>
              )}
              
              <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                {listing.listing_type === 'rent' ? 'Cho thuê' : listing.listing_type === 'sale' ? 'Bán Pass' : 'Thuê & Bán'}
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-medium line-clamp-1 group-hover:text-indigo-600 transition-colors">{listing.title}</h3>
              <p className="text-sm text-zinc-500 line-clamp-1">{listing.city}</p>
              
              <div className="flex items-center space-x-2 pt-1">
                {(listing.listing_type === 'rent' || listing.listing_type === 'both') && listing.price_per_day && (
                  <span className="font-semibold">{listing.price_per_day.toLocaleString('vi-VN')}đ<span className="text-xs font-normal text-zinc-500">/ngày</span></span>
                )}
                {listing.listing_type === 'sale' && listing.sale_price && (
                  <span className="font-semibold">{listing.sale_price.toLocaleString('vi-VN')}đ</span>
                )}
              </div>
            </div>
            
            {listing.owner && (
              <div className="flex items-center space-x-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="w-6 h-6 rounded-full bg-zinc-200 overflow-hidden shrink-0">
                  {listing.owner.avatar_url && <img src={listing.owner.avatar_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <span className="text-xs text-zinc-600 truncate">{listing.owner.username || 'User'}</span>
                {listing.owner.reputation_score && (
                  <span className="text-xs text-amber-500 flex items-center shrink-0">
                    ★ {listing.owner.reputation_score}
                  </span>
                )}
              </div>
            )}
          </Link>
        ))}
      </div>

      {hasNextPage && (
        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="w-full max-w-sm rounded-full"
          >
            {isFetchingNextPage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}
          </Button>
        </div>
      )}
    </div>
  )
}
