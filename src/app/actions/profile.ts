'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const full_name = formData.get('full_name') as string
  const username = formData.get('username') as string
  const bio = formData.get('bio') as string
  const city = formData.get('city') as string
  const avatarFile = formData.get('avatar') as File | null

  let avatar_url = undefined

  // Handle avatar upload if provided
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const filePath = `${user.id}-${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile)

    if (uploadError) {
      throw new Error('Upload failed')
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
      
    avatar_url = publicUrl
  }

  const updates: any = {
    full_name,
    username,
    bio,
    city,
  }

  if (avatar_url) {
    updates.avatar_url = avatar_url
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/profile')
  revalidatePath('/')
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase.rpc('delete_own_account')

  if (error) {
    throw new Error(error.message)
  }

  await supabase.auth.signOut()
  revalidatePath('/')
}
