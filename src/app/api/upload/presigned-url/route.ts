import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generatePresignedUrl } from '@/lib/r2/upload'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileName, fileType, fileSize } = await req.json()

    if (!fileName || !fileType || fileSize === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
    if (!ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const MAX_SIZE = 5 * 1024 * 1024 // 5MB sau khi đã nén client-side
    if (fileSize > MAX_SIZE) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    // Key có user ID: tránh path traversal, dễ thu hồi quyền sau
    const key = `uploads/${user.id}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    const url = await generatePresignedUrl(key, fileType)
    
    return NextResponse.json({ url, key })
  } catch (error: any) {
    console.error('Error generating presigned URL:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
