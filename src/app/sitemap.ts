import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cosworld.vercel.app'
  
  const supabase = await createClient()
  
  // Lấy danh sách listings
  const { data: listings } = await supabase
    .from('listings')
    .select('id, created_at')
    .eq('status', 'active')
    
  // Lấy danh sách events
  const { data: events } = await supabase
    .from('events')
    .select('id, created_at')
    .eq('status', 'approved')

  const listingUrls = (listings || []).map((listing) => ({
    url: `${baseUrl}/listings/${listing.id}`,
    lastModified: new Date(listing.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const eventUrls = (events || []).map((evt) => ({
    url: `${baseUrl}/events`,
    lastModified: new Date(evt.created_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    ...listingUrls,
    ...eventUrls,
  ]
}
