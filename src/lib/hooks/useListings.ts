import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export function useListings(filter: { category?: string, query?: string } = {}) {
  return useInfiniteQuery({
    queryKey: ['listings', filter],
    queryFn: async ({ pageParam = 0 }) => {
      let query = supabase
        .from('listings')
        .select(`
          id, title, price_per_day, sale_price, city, listing_type,
          owner:owner_id(username, avatar_url, reputation_score),
          images:listing_images(r2_url)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(pageParam * 12, (pageParam + 1) * 12 - 1)

      if (filter.query) {
        query = query.ilike('title', `%${filter.query}%`)
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
