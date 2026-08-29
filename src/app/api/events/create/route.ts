import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, venue, city, start_date, end_date, source_url, poster_url } = body

    if (!name || !start_date || !end_date || !city) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
    }

    const { error } = await supabase.from('events').insert({
      name,
      description,
      venue,
      city,
      start_date,
      end_date,
      source_url,
      poster_url,
      submitted_by: user.id,
      status: 'pending' // Chờ admin duyệt
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    revalidatePath('/events')

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Có lỗi xảy ra' }, { status: 500 })
  }
}
