'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteListing(listingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Bạn cần đăng nhập để thực hiện chức năng này.')
  }

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
