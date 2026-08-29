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
  const coverPhotoFile = formData.get('cover_photo') as File | null

  let avatar_url = undefined
  let cover_photo_url = undefined

  // Handle avatar upload if provided
  if (avatarFile && avatarFile.size > 0) {
    const fileExt = avatarFile.name.split('.').pop()
    const filePath = `${user.id}-${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile)

    if (uploadError) {
      throw new Error('Upload avatar failed')
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
      
    avatar_url = publicUrl
  }

  // Handle cover photo upload if provided
  if (coverPhotoFile && coverPhotoFile.size > 0) {
    const fileExt = coverPhotoFile.name.split('.').pop()
    const filePath = `${user.id}-cover-${Math.random()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, coverPhotoFile)

    if (uploadError) {
      throw new Error('Upload cover photo failed')
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)
      
    cover_photo_url = publicUrl
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

  if (cover_photo_url) {
    updates.cover_photo_url = cover_photo_url
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/profile')
  revalidatePath(`/profile/${username}`)
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

  try {
    await supabase.auth.signOut()
  } catch (e) {
    // Ignore error, user is already deleted
  }
  
  revalidatePath('/')
}

export async function voteReputation(profile_id: string, vote_value: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  if (user.id === profile_id) {
    throw new Error('Bạn không thể tự đánh giá chính mình')
  }

  const { error } = await supabase
    .from('reputation_votes')
    .upsert(
      { voter_id: user.id, profile_id, vote_value },
      { onConflict: 'voter_id, profile_id' }
    )

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/profile')
  revalidatePath(`/profile/[id]`, 'page')
}
