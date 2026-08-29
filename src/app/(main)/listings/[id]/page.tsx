import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MapPin, MessageCircle, ShieldCheck } from 'lucide-react'
import { ListingCarousel } from '@/components/listings/ListingCarousel'


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()
  const { data: listing } = await supabase
    .from('listings')
    .select('title, description, r2_url')
    .eq('id', resolvedParams.id)
    .single()

  if (!listing) return { title: 'Not Found' }

  return {
    title: `${listing.title} | CosWorld`,
    description: listing.description || `Thuê ${listing.title} trên CosWorld`,
    openGraph: {
      title: listing.title,
      description: listing.description || `Thuê ${listing.title} trên CosWorld`,
      images: [{ url: listing.r2_url }],
    },
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: listing, error } = await supabase
    .from('listings')
    .select(`
      *,
      owner:owner_id(username, full_name, avatar_url, phone, reputation_score),
      images:listing_images(r2_url, display_order)
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (error || !listing) {
    notFound()
  }

  const isRent = listing.listing_type === 'rent' || listing.listing_type === 'both'
  const isSale = listing.listing_type === 'sale' || listing.listing_type === 'both'

  // Sắp xếp ảnh theo display_order
  const sortedImages = listing.images
    ? [...listing.images].sort((a, b) => a.display_order - b.display_order).map((img) => img.r2_url)
    : []

  // Xử lý SĐT chủ đồ để làm deep link Zalo (bỏ số 0 ở đầu thay bằng 84)
  // Thực tế có thể thay đổi cách gọi tuỳ theo Zalo link
  const rawPhone = Array.isArray(listing.owner) ? listing.owner[0]?.phone : listing.owner?.phone
  const zaloPhone = rawPhone ? (rawPhone.startsWith('0') ? `84${rawPhone.substring(1)}` : rawPhone) : ''
  const zaloDeepLink = zaloPhone ? `https://zalo.me/${zaloPhone}` : null

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Images */}
        <div className="space-y-4">
          <ListingCarousel images={sortedImages} />
        </div>

        {/* Right: Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${isRent ? 'bg-brand-100 text-brand-700' : 'bg-indigo-100 text-indigo-700'}`}>
                {listing.listing_type === 'both' ? 'Thuê & Bán' : isRent ? 'Cho Thuê' : 'Bán Pass'}
              </span>
              {listing.category !== 'studio' && listing.size && (
                <span className="bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-bold rounded-full">
                  Size {listing.size}
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {isRent ? 'Cho thuê ' : 'Thanh lý '}{
                { costume: 'Trang phục', wig: 'Tóc giả', props: 'Vũ khí / Đạo cụ', shoes: 'Giày dép', accessories: 'Phụ kiện', studio: 'Studio' }[listing.category as string] || ''
              } {listing.title} {listing.district ? `- ${listing.district}` : ''}
            </h1>
            
            <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap gap-6 items-center">
              {isRent && listing.price_per_day && (
                <div>
                  <div className="text-sm text-slate-500 font-medium">Giá thuê</div>
                  <div className="text-2xl font-black text-brand-600">{listing.price_per_day.toLocaleString('vi-VN')}đ<span className="text-sm font-normal text-slate-500">/ngày</span></div>
                </div>
              )}
              {isSale && listing.sale_price && (
                <div>
                  <div className="text-sm text-slate-500 font-medium">Giá bán pass</div>
                  <div className="text-2xl font-black text-brand-600">{listing.sale_price.toLocaleString('vi-VN')}đ</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Vị trí: {listing.district ? `${listing.district}, ` : ''}{listing.city}
          </div>

          {listing.deposit_amount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-800 rounded-2xl border border-amber-100">
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-bold text-sm text-amber-900">Yêu cầu tiền cọc (Offline)</p>
                <p className="text-xs mt-1">Chủ đồ yêu cầu cọc <strong>{listing.deposit_amount.toLocaleString('vi-VN')}đ</strong>. Bạn sẽ thoả thuận và thanh toán tiền cọc trực tiếp với chủ đồ (không qua hệ thống).</p>
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 mb-3">Mô tả chi tiết</h3>
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">Thông tin chủ đồ</h3>
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-white">
              <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                {Array.isArray(listing.owner) ? (
                  listing.owner[0]?.avatar_url && <img src={listing.owner[0].avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  listing.owner?.avatar_url && <img src={listing.owner.avatar_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-900 truncate">
                  {Array.isArray(listing.owner) 
                    ? (listing.owner[0]?.full_name || listing.owner[0]?.username) 
                    : (listing.owner?.full_name || listing.owner?.username || 'Cosplayer')}
                </div>
                <div className="text-xs text-amber-500 font-bold mt-0.5">
                  ★ {Array.isArray(listing.owner) ? listing.owner[0]?.reputation_score : listing.owner?.reputation_score || 5.0} uy tín
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {zaloDeepLink && (
                  <a href={zaloDeepLink} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" /> Zalo
                  </a>
                )}
                <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5">
                  Nhắn tin
                </button>
              </div>
            </div>
          </div>

          {/* Xóa khối BookingForm cũ chưa dùng đến theo yêu cầu, các thao tác liên hệ đều dồn về Thẻ Chủ Đồ */}
        </div>
      </div>
    </div>
  )
}
