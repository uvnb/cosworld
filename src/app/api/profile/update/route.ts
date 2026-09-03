import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const formData = await request.formData()

    const { data: profile } = await supabase.from('profiles').select('username, roles').eq('id', user.id).single()
    const username = profile?.username

    const full_name = formData.get('full_name') as string
    const bio = formData.get('bio') as string
    const city = formData.get('city') as string
    const rawRoles = formData.getAll('roles') as string[]
    const avatarFile = formData.get('avatar') as File | null
    const coverPhotoFile = formData.get('cover_photo') as File | null

    let avatar_url: string | undefined
    let cover_photo_url: string | undefined

    // Handle avatar upload
    if (avatarFile && avatarFile.size > 0) {
      const filePath = `${user.id}-${Date.now()}.webp`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true })

      if (uploadError) {
        return NextResponse.json({ error: `Upload avatar thất bại: ${uploadError.message}` }, { status: 400 })
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      avatar_url = publicUrl
    }

    // Handle cover photo upload
    if (coverPhotoFile && coverPhotoFile.size > 0) {
      const filePath = `${user.id}-cover-${Date.now()}.webp`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, coverPhotoFile, { upsert: true })

      if (uploadError) {
        return NextResponse.json({ error: `Upload ảnh bìa thất bại: ${uploadError.message}` }, { status: 400 })
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      cover_photo_url = publicUrl
    }

    // Build roles array safely
    const currentRoles = profile?.roles || ['user']
    const isAdmin = currentRoles.includes('admin')
    
    // Filter valid roles that users can select themselves
    let newRoles = rawRoles.filter(r => ['coser', 'photographer', 'staff'].includes(r))
    newRoles.push('user') // Base role
    if (isAdmin) newRoles.push('admin') // Preserve admin role

    const updates: Record<string, any> = {
      full_name,
      bio,
      city,
      roles: Array.from(new Set(newRoles))
    }

    if (avatar_url) updates.avatar_url = avatar_url
    if (cover_photo_url) updates.cover_photo_url = cover_photo_url

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    revalidatePath('/profile')
    revalidatePath(`/profile/${user.id}`)
    revalidatePath('/')

    return NextResponse.json({ success: true, id: user.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Có lỗi xảy ra' }, { status: 500 })
  }
}
