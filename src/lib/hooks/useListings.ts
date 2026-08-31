import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export type ListingFilters = {
  query?: string;
  category?: string;
  sizes?: string[];
  listingMode?: 'all' | 'rent' | 'sale' | 'want_to_rent' | 'want_to_buy';
  city?: string;
  lat?: number;
  lng?: number;
}

export function useListings(filter: ListingFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['listings', filter],
    queryFn: async ({ pageParam = 0 }) => {
      
      let query;
      
      // Nếu có tọa độ, sử dụng hàm PostGIS
      if (filter.lat !== undefined && filter.lng !== undefined) {
        const { data: nearby, error: rpcError } = await supabase
          .rpc('get_nearby_listings', {
            user_lat: filter.lat,
            user_lng: filter.lng,
            radius_meters: 10000, // 10km mặc định
            filter_category: filter.category || null,
            filter_query: filter.query || null
          })

        if (rpcError) throw rpcError

        if (!nearby || nearby.length === 0) return []

        // Phân trang trên mảng ID đã lấy được từ RPC
        const startIndex = pageParam * 12
        const paginatedNearby = nearby.slice(startIndex, startIndex + 12)
        
        if (paginatedNearby.length === 0) return []
        
        const ids = paginatedNearby.map((n: any) => n.id)

        let listingsQuery = supabase
          .from('listings')
          .select(`
            id, title, price_per_day, sale_price, city, listing_type, size, created_at,
            owner:profiles!owner_id(username, avatar_url, reputation_score),
            images:listing_images(r2_url)
          `)
          .in('id', ids)

        if (filter.listingMode === 'rent') {
          listingsQuery = listingsQuery.in('listing_type', ['rent', 'both'])
        } else if (filter.listingMode === 'sale') {
          listingsQuery = listingsQuery.in('listing_type', ['sale', 'both'])
        } else if (filter.listingMode === 'want_to_rent' || filter.listingMode === 'want_to_buy') {
          listingsQuery = listingsQuery.eq('listing_type', filter.listingMode)
        }

        const { data, error } = await listingsQuery

        if (error) throw error

        const enriched = (data as any[]).map(item => {
           const n = paginatedNearby.find((n: any) => n.id === item.id)
           return { ...item, distance_meters: n?.distance_meters }
        })

        // Sắp xếp lại theo khoảng cách vì .in() không giữ nguyên thứ tự
        enriched.sort((a, b) => a.distance_meters - b.distance_meters)

        return enriched.map(item => ({
          ...item,
          cover_image: item.images?.[0]?.r2_url || null,
          owner: Array.isArray(item.owner) ? item.owner[0] : item.owner
        }))
      } else {
        query = supabase
          .from('listings')
          .select(`
            id, title, price_per_day, sale_price, city, listing_type, size, created_at,
            owner:profiles!owner_id(username, avatar_url, reputation_score),
            images:listing_images(r2_url)
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
      }

      query = query.range(pageParam * 12, (pageParam + 1) * 12 - 1)

      // Các bộ lọc cơ bản (chỉ áp dụng cho query thường vì RPC đã tự lọc query và category)
      if (!filter.lat || !filter.lng) {
        if (filter.query) {
          query = query.ilike('title', `%${filter.query}%`)
        }
        if (filter.category) {
          query = query.eq('category', filter.category)
        }
        if (filter.listingMode === 'rent') {
          query = query.in('listing_type', ['rent', 'both'])
        } else if (filter.listingMode === 'sale') {
          query = query.in('listing_type', ['sale', 'both'])
        } else if (filter.listingMode === 'want_to_rent' || filter.listingMode === 'want_to_buy') {
          query = query.eq('listing_type', filter.listingMode)
        }
        if (filter.city) {
          query = query.ilike('city', `%${filter.city}%`)
        }
        if (filter.sizes && filter.sizes.length > 0) {
          query = query.in('size', filter.sizes)
        }
      }

      const { data, error } = await query
      
      if (error) throw error

      const listings = (data as any[]) || []

      // Post-process to just get cover image
      return listings.map(item => ({
        ...item,
        cover_image: item.images?.[0]?.r2_url || null,
        owner: Array.isArray(item.owner) ? item.owner[0] : item.owner
      }))
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 12 ? allPages.length : undefined
    }
  })
}
