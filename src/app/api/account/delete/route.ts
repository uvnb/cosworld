import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // 1. Get the current user via the normal auth client
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const userId = user.id

    // 2. Create an admin client with service role key (bypasses all RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 3. Manually delete ALL dependent data in correct order (child → parent)
    // This works regardless of CASCADE settings

    // Delete listing_images for user's listings
    const { data: userListings } = await supabaseAdmin
      .from('listings')
      .select('id')
      .eq('owner_id', userId)

    if (userListings && userListings.length > 0) {
      const listingIds = userListings.map((l: any) => l.id)
      await supabaseAdmin.from('listing_images').delete().in('listing_id', listingIds)
      await supabaseAdmin.from('listing_tags').delete().in('listing_id', listingIds)
      await supabaseAdmin.from('calendar_locks').delete().in('listing_id', listingIds)
    }

    // Delete bookings related data
    const { data: userBookings } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .or(`renter_id.eq.${userId},owner_id.eq.${userId}`)

    if (userBookings && userBookings.length > 0) {
      const bookingIds = userBookings.map((b: any) => b.id)
      await supabaseAdmin.from('reviews').delete().in('booking_id', bookingIds)
      await supabaseAdmin.from('calendar_locks').delete().in('booking_id', bookingIds)
      await supabaseAdmin.from('reports').delete().in('booking_id', bookingIds)
    }

    // Delete remaining reviews where user is reviewer or reviewee
    await supabaseAdmin.from('reviews').delete().eq('reviewer_id', userId)
    await supabaseAdmin.from('reviews').delete().eq('reviewee_id', userId)

    // Delete reports
    await supabaseAdmin.from('reports').delete().eq('reporter_id', userId)
    await supabaseAdmin.from('reports').delete().eq('reported_user_id', userId)

    // Delete bookings
    await supabaseAdmin.from('bookings').delete().eq('renter_id', userId)
    await supabaseAdmin.from('bookings').delete().eq('owner_id', userId)

    // Delete listings
    await supabaseAdmin.from('listings').delete().eq('owner_id', userId)

    // Delete social data
    await supabaseAdmin.from('follows').delete().eq('follower_id', userId)
    await supabaseAdmin.from('follows').delete().eq('following_id', userId)
    await supabaseAdmin.from('favorites').delete().eq('user_id', userId)
    await supabaseAdmin.from('followers').delete().eq('follower_id', userId)
    await supabaseAdmin.from('followers').delete().eq('following_id', userId)

    // Delete notifications
    await supabaseAdmin.from('notifications').delete().eq('user_id', userId)

    // Delete addon services
    await supabaseAdmin.from('addon_providers').delete().eq('owner_id', userId)

    // Delete events submitted by user
    await supabaseAdmin.from('events').delete().eq('submitted_by', userId)

    // Delete reputation votes
    await supabaseAdmin.from('reputation_votes').delete().eq('voter_id', userId)
    await supabaseAdmin.from('reputation_votes').delete().eq('profile_id', userId)

    // Delete messages (if table exists)
    try {
      await supabaseAdmin.from('messages').delete().eq('sender_id', userId)
      await supabaseAdmin.from('messages').delete().eq('receiver_id', userId)
    } catch {
      // Table may not exist yet, ignore
    }

    // Delete profile
    await supabaseAdmin.from('profiles').delete().eq('id', userId)

    // 4. Finally, delete the auth user using admin API
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Admin deleteUser error:', deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    // 5. Sign out the current session
    try {
      await supabase.auth.signOut()
    } catch {
      // Already deleted, ignore
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Delete account error:', err)
    return NextResponse.json(
      { error: err.message || 'Có lỗi xảy ra khi xóa tài khoản' },
      { status: 500 }
    )
  }
}
