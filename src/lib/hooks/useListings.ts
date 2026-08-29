import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export type ListingFilters = {
  query?: string;
  category?: string;
  sizes?: string[];
  listingMode?: 'all' | 'rent' | 'sale';
  city?: string;
}

export function useListings(filter: ListingFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['listings', filter],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('listings')
        .select(`
          id, title, price_per_day, sale_price, city, listing_type, size, created_at,
          owner:owner_id(username, avatar_url, reputation_score),
          images:listing_images(r2_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(pageParam * 12, (pageParam + 1) * 12 - 1)

      if (filter.query) {
        query = query.ilike('title', `%${filter.query}%`)
      }
      if (filter.category) {
        query = query.eq('category', filter.category)
      }
      if (filter.city) {
        query = query.ilike('city', `%${filter.city}%`)
      }
      if (filter.sizes && filter.sizes.length > 0) {
        query = query.in('size', filter.sizes)
      }
      if (filter.listingMode === 'rent') {
        query = query.in('listing_type', ['rent', 'both'])
      } else if (filter.listingMode === 'sale') {
        query = query.in('listing_type', ['sale', 'both'])
      }

      const { data, error } = await query
      
      if (error) throw error

      // Post-process to just get cover image
      return data.map(item => ({
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
