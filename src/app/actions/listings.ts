'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteListing(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Bạn cần đăng nhập để thực hiện chức năng này.')
  }

  // 1. Lấy danh sách ảnh của bài đăng này
  const { data: images } = await supabase
    .from('listing_images')
    .select('r2_url')
    .eq('listing_id', listingId)

  // 2. Trích xuất keys từ r2_url
  if (images && images.length > 0) {
    const keysToDelete = images.map(img => {
      try {
        const urlObj = new URL(img.r2_url, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
        if (urlObj.pathname.startsWith('/api/image')) {
          return urlObj.searchParams.get('key')
        }
        // Trường hợp dùng custom domain R2: https://pub-xxx.r2.dev/listings/user_id/uuid.webp
        const R2_DOMAIN = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace('https://', '').replace('http://', '')
        if (R2_DOMAIN && urlObj.hostname.includes(R2_DOMAIN)) {
          return urlObj.pathname.substring(1) // Xóa dấu '/' ở đầu
        }
        // Fallback: Lấy path mặc định
        return urlObj.pathname.substring(1)
      } catch (e) {
        return null
      }
    }).filter(Boolean) as string[]

    if (keysToDelete.length > 0) {
      const { deleteFromR2 } = await import('@/lib/r2/delete')
      await deleteFromR2(keysToDelete)
    }
  }

  // 3. Xóa bài đăng khỏi DB (Sẽ cascade xóa luôn listing_images)
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', listingId)
    .eq('owner_id', user.id)

  if (error) {
    throw new Error('Lỗi khi xóa: ' + error.message)
  }

  revalidatePath('/profile')
  revalidatePath('/')
  revalidatePath('/listings')
}

export async function toggleListingStatus(listingId: string, currentStatus: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Bạn cần đăng nhập để thực hiện chức năng này.')
  }

  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'

  const { error } = await supabase
    .from('listings')
    .update({ status: newStatus })
    .eq('id', listingId)
    .eq('owner_id', user.id)

  if (error) {
    throw new Error('Lỗi khi cập nhật trạng thái: ' + error.message)
  }

  revalidatePath('/profile')
  revalidatePath('/')
  revalidatePath('/listings')
}
